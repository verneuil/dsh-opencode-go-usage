import z from "@deepseek-ai/schemastery"

export const name = "opencode-go-usage"
export const inject = ["settings", "timer"]

// ── 官方契约（DSH 0.1.7）────────────────────────────────────────────────────────
// 插件导出 Config，Loader 解析后以第二个参数传给 apply；字段必须标记 `.volatile()`
// 才能被设置页读写，并在不重启插件的前提下就地生效。设置表单的 ns = 本行 patch 的 id
// （settings.describe() 按 entry.options.id 投影），因此 id 必须与客户端读取的 ns 一致。
//
// 本插件自带 settings.section 页面，因此禁用了自动生成的表单页（见 apply 内
// settings.configure({ auto: false })）——否则会出现两个重复的配置界面。

const UsageWindow = z.object({
  // 官方接口每个窗口返回的 status（正常为 "ok"）
  status: z.string().default(""),
  // 已用百分比（0~100，官方语义为 used）
  percent: z.number().default(0),
  // 窗口重置时间（ISO 8601 字符串；缺失时为空串）
  resetsAt: z.string().default(""),
})

const UsageSnapshot = z.object({
  rolling: UsageWindow.default({}),
  weekly: UsageWindow.default({}),
  monthly: UsageWindow.default({}),
})

// DeepSeek 官方余额（沿用原余额插件的字段形状与语义）
const BalanceInfo = z.object({
  isAvailable: z.boolean().default(false),
  currency: z.string().default(""),
  totalBalance: z.string().default(""),
  grantedBalance: z.string().default(""),
  toppedUpBalance: z.string().default(""),
})

export const Config = z.object({
  // ── 用户可改 ──
  // 两把 Key 都是可选覆盖：留空则自动使用 DSH 凭据库
  // （OpenCode Go → OPENCODE_GO_API_KEY；DeepSeek → DEEPSEEK_API_KEY）
  apiKey: z.string().role("secret").default("").volatile(),
  deepseekApiKey: z.string().role("secret").default("").volatile(),
  // 自动刷新间隔（分钟）：一次刷新同时更新「余额」与「OCG 用量」
  refreshMinutes: z.number().default(5).volatile(),
  // 浮窗显示开关
  widgetVisible: z.boolean().default(true).volatile(),
  // 浮窗上是否显示 DeepSeek 账户余额（关掉后浮窗只留 OCG 三组圆环，更窄）
  showBalance: z.boolean().default(true).volatile(),
  // 浮窗锚定（「最近锚线」模型）：拖动松手时只记「锚线 + 偏移」，窗口或输入框
  // 尺寸变化时按锚线重算像素位置，而不是记住绝对坐标。
  // 水平锚线：card-left | card-right | view-left | view-right
  // 垂直锚线：card-top | card-bottom | view-top | view-bottom
  widgetAnchorX: z.string().default("view-right").volatile(),
  widgetOffsetX: z.number().default(-24).volatile(),
  widgetAnchorY: z.string().default("view-bottom").volatile(),
  widgetOffsetY: z.number().default(-24).volatile(),
  // 手动刷新请求计数：客户端递增以触发宿主立即重新拉取
  refreshRequest: z.number().default(0).volatile(),
  // 「更新中」信号：宿主每轮真正开始拉取前自增。宿主是拉取完成后才写 lastUpdated 的，
  // 客户端看不到自动刷新的更新中阶段；靠这个字段，自动刷新也能亮起与手动点击同一套边框流光。
  refreshTick: z.number().default(0).volatile(),
  // ── 以下为宿主写入的派生快照（客户端经 remote.settings.describe() 读取）──
  // keyStatus 的默认值必须是「尚未探测」而不是「未配置」：客户端把 missing 当警告态，
  // 拿它做默认值会让浮窗在拿到真实快照之前就先画成错误色。
  keyStatus: z.string().default("loading").volatile(),
  keyHint: z.string().default("").volatile(),
  usageError: z.string().default("").volatile(),
  usage: UsageSnapshot.default({}).volatile(),
  balanceKeyStatus: z.string().default("loading").volatile(),
  balanceKeyHint: z.string().default("").volatile(),
  balanceError: z.string().default("").volatile(),
  balance: BalanceInfo.default({}).volatile(),
  // 本轮刷新的时间（余额与用量同一轮更新）
  lastUpdated: z.string().default("").volatile(),
})

const OCG_ENDPOINT = "https://opencode.ai/zen/go/v1/usage"
const DS_ENDPOINT = "https://api.deepseek.com/user/balance"
// 凭据名按顺序尝试：产品专用的那个排第一
const OCG_CREDENTIALS = ["OPENCODE_GO_API_KEY", "OPENCODE_API_KEY"]
const DS_CREDENTIALS = ["DEEPSEEK_API_KEY"]
// 官方文档明确要求客户端自报身份（"Identify itself with its own user agent, such as
// my-coding-agent/1.0, rather than a generic SDK or HTTP-library name"）；两个接口都带上。
const USER_AGENT = "dsh-opencode-go-usage/2.11.0 (+DeepSeek Harness plugin)"
// 单请求总超时。跨国链路偶发慢连接，15s 偏紧，放宽到 20s（inflight 去重，不会叠加请求）。
const REQUEST_TIMEOUT_MS = 20000

// 把网络层失败的真实内因摊开：undici 只抛 `TypeError: fetch failed`，
// 真正的 DNS / 连接超时 / TLS / 连接重置都藏在 error.cause 里（如 UND_ERR_CONNECT_TIMEOUT）。
// 不带出来就无法判断到底是"接口挂了"还是"本机网络抖了"。
function describeError(e) {
  const msg = (e && e.message) || String(e)
  const cause = e && e.cause
  if (!cause) return msg
  const code = cause.code || cause.name || ""
  let cmsg = String(cause.message || cause)
  // 去掉 undici 附带的冗长地址列表，只留可读结论
  cmsg = cmsg.replace(/\s*\(attempted addresses?:[^)]*\)/i, "").trim()
  if (cmsg.length > 120) cmsg = cmsg.slice(0, 120) + "…"
  const detail = code && cmsg && cmsg !== code ? code + "：" + cmsg : (code || cmsg)
  return detail ? msg + "（" + detail + "）" : msg
}

function maskKey(key) {
  if (!key) return ""
  if (key.length < 8) return "****"
  return key.slice(0, 3) + "****" + key.slice(-4)
}

// 读取 volatile 配置引用：Loader 在 volatile 路径放的是稳定引用（.get() 取当前快照），
// 非 volatile 或缺失字段则可能是普通值，两者都要能读。
function vget(ref, fallback) {
  if (ref && typeof ref.get === "function") {
    const v = ref.get()
    return v === undefined ? fallback : v
  }
  return ref === undefined || ref === null ? fallback : ref
}

function toNumber(v) {
  if (typeof v === "number" && isFinite(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v)
    if (isFinite(n)) return n
  }
  return null
}

function normalizeIso(value) {
  if (typeof value !== "string" || !value) return ""
  const ts = Date.parse(value)
  if (!isFinite(ts)) return ""
  return new Date(ts).toISOString()
}

// 单个 OCG 窗口的容错解析。官方当前返回 { status, percent, resetsAt }，
// 但该端点并非长期冻结的公开契约：这里同时接受「剩余百分比」「已用/额度金额」
// 以及「距重置秒数」等常见变体，避免接口微调就让整条链路失效。
function pickWindow(raw) {
  const w = raw && typeof raw === "object" ? raw : {}
  const status = typeof w.status === "string" ? w.status : ""

  let percent = null
  for (const k of ["percent", "usedPercent", "used_percent", "usagePercent", "usage_percent"]) {
    const n = toNumber(w[k])
    if (n !== null) { percent = n; break }
  }
  if (percent === null) {
    for (const k of ["remainingPercent", "remaining_percent", "leftPercent", "left_percent"]) {
      const n = toNumber(w[k])
      if (n !== null) { percent = 100 - n; break }
    }
  }
  if (percent === null) {
    const used = toNumber(w.used) ?? toNumber(w.usedDollars) ?? toNumber(w.spend) ?? toNumber(w.spent)
    const limit = toNumber(w.limit) ?? toNumber(w.limitDollars) ?? toNumber(w.cap)
    if (used !== null && limit !== null && limit > 0) percent = (used / limit) * 100
  }
  if (percent === null) percent = 0
  // 夹到 0~100，保留一位小数（进度条宽度用得上）
  percent = Math.min(100, Math.max(0, Math.round(percent * 10) / 10))

  let resetsAt = ""
  for (const k of ["resetsAt", "resets_at", "resetAt", "reset_at"]) {
    resetsAt = normalizeIso(w[k])
    if (resetsAt) break
  }
  if (!resetsAt) {
    for (const k of ["resetInSec", "resetsInSeconds", "resetsInSec", "resetInSeconds", "secondsUntilReset"]) {
      const n = toNumber(w[k])
      if (n !== null) { resetsAt = new Date(Date.now() + n * 1000).toISOString(); break }
    }
  }
  return { status, percent, resetsAt }
}

async function fetchUsage(key) {
  const res = await fetch(OCG_ENDPOINT, {
    method: "GET",
    headers: { Authorization: "Bearer " + key, Accept: "application/json", "User-Agent": USER_AGENT },
    // 不跟随重定向：避免把 API Key 交给别的源（key 只发往规范主机）
    redirect: "error",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  let bodyText = ""
  try {
    bodyText = await res.text()
  } catch (e) { /* 保留空串 */ }
  if (res.status === 401) throw new Error("API Key 无效或已失效（HTTP 401）")
  if (res.status === 403) throw new Error("该 Key 没有 OpenCode Go 订阅（HTTP 403）")
  if (!res.ok) {
    let detail = bodyText.slice(0, 200)
    try {
      const j = JSON.parse(bodyText)
      if (j && j.error && j.error.message) detail = j.error.message
    } catch (e) { /* 非 JSON 错误体 */ }
    throw new Error("HTTP " + res.status + (detail ? "：" + detail : ""))
  }
  let parsed
  try {
    parsed = JSON.parse(bodyText)
  } catch (e) {
    throw new Error("用量接口返回非 JSON：" + bodyText.slice(0, 120))
  }
  const u = parsed && typeof parsed.usage === "object" && parsed.usage ? parsed.usage : parsed
  const hasAny = u && (u.rolling || u.weekly || u.monthly || u.fiveHour || u["5h"] || u.week || u.month || u.session)
  if (!hasAny) {
    throw new Error("用量接口返回结构不符合预期：" + bodyText.slice(0, 160))
  }
  return {
    rolling: pickWindow(u.rolling || u.fiveHour || u["5h"] || u.session),
    weekly: pickWindow(u.weekly || u.week),
    monthly: pickWindow(u.monthly || u.month),
  }
}

async function fetchBalance(key) {
  const res = await fetch(DS_ENDPOINT, {
    method: "GET",
    headers: { Authorization: "Bearer " + key, Accept: "application/json", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  let bodyText = ""
  try {
    bodyText = await res.text()
  } catch (e) { /* 保留空串 */ }
  if (!res.ok) {
    let detail = bodyText.slice(0, 200)
    try {
      const j = JSON.parse(bodyText)
      if (j && j.error && j.error.message) detail = j.error.message
    } catch (e) { /* 非 JSON 错误体 */ }
    throw new Error("HTTP " + res.status + (detail ? "：" + detail : ""))
  }
  let parsed
  try {
    parsed = JSON.parse(bodyText)
  } catch (e) {
    throw new Error("余额接口返回非 JSON：" + bodyText.slice(0, 120))
  }
  const infos = Array.isArray(parsed.balance_infos) ? parsed.balance_infos : []
  const row = infos.find((i) => i && i.currency === "CNY") || infos[0] || null
  return {
    isAvailable: !!parsed.is_available,
    currency: row && row.currency != null ? String(row.currency) : "",
    totalBalance: row && row.total_balance != null ? String(row.total_balance) : "",
    grantedBalance: row && row.granted_balance != null ? String(row.granted_balance) : "",
    toppedUpBalance: row && row.topped_up_balance != null ? String(row.topped_up_balance) : "",
  }
}

// configEditor.edit() 内部走 hmr.runExclusive()，而事务不可嵌套；「客户端写配置 →
// Loader 就地提交 volatile 值并派发 loader/volatile-update → 插件回写快照」这条链路
// 本身就处在那次写入的事务里，直接回写会被拒（HMR transactions cannot be nested），
// 刷新结果因此永远落不了盘。这里用 hmr 自己的 AsyncLocalStorage.exit() 起一个干净
// 上下文，让回写作为独立顶层事务排进 HMR 队列；无 hmr 时直接执行。
function outsideTransaction(ctx, run) {
  const hmr = ctx.get("hmr")
  const executing = hmr && hmr.executing
  if (executing && typeof executing.exit === "function") return executing.exit(run)
  return run()
}

export function apply(ctx, config) {
  // ── 启动能力自检（护栏）─────────────────────────────────────────────────────
  // 宿主 API 契约变更时给出可读警告并安全跳过，而不是抛 TypeError 让整条目静默不激活。
  // 校验项 = 本插件实际使用的宿主契约。
  const missing = []
  if (config === undefined || config === null) missing.push("apply(ctx, config) 第二参数 config")
  if (!ctx.settings || typeof ctx.settings.configure !== "function" || typeof ctx.settings.update !== "function") missing.push("ctx.settings.configure()/update()")
  if (typeof ctx.effect !== "function") missing.push("ctx.effect()")
  if (typeof ctx.on !== "function") missing.push("ctx.on()")
  if (typeof ctx.get !== "function") missing.push("ctx.get()")
  if (typeof ctx.timeout !== "function" || typeof ctx.interval !== "function") missing.push("ctx.timeout()/ctx.interval()")
  if (missing.length > 0) {
    const msg = `[opencode-go-usage] 宿主契约不匹配，已跳过激活（本插件按 DSH 0.1.7 插件契约编写）。缺失：${missing.join("、")}。请把 DSH 回退到已验证版本，或更新本插件。`
    const logger = typeof ctx.logger === "function" ? ctx.logger("opencode-go-usage") : null
    if (logger && typeof logger.warn === "function") logger.warn(msg)
    else console.warn(msg)
    return
  }
  const settings = ctx.settings

  // 表单 ns = 本行 patch 的 id
  function ownEntryId() {
    try {
      const id = ctx.fiber && ctx.fiber.entry && ctx.fiber.entry.options && ctx.fiber.entry.options.id
      if (typeof id === "string" && id) return id
    } catch (e) { /* 取不到则回退到 cordis.patch.yml 中声明的 id */ }
    return "opencode-go-usage"
  }
  const ENTRY_ID = ownEntryId()

  // 本插件自带 settings.section 页面，禁止为它再自动生成一个表单页。
  // 失败不致命（最多出现一个重复的自动页），所以只提示不抛出。
  ctx.effect(function () {
    try {
      return settings.configure({ auto: false }, ctx.fiber)
    } catch (e) {
      console.warn("[opencode-go-usage] 关闭自动配置页失败（可能出现重复页面）：" + ((e && e.message) || e))
      return undefined
    }
  })

  function readCfg() {
    return {
      apiKey: String(vget(config.apiKey, "") || ""),
      deepseekApiKey: String(vget(config.deepseekApiKey, "") || ""),
      refreshMinutes: Number(vget(config.refreshMinutes, 5)),
      refreshRequest: Number(vget(config.refreshRequest, 0)) || 0,
      refreshTick: Number(vget(config.refreshTick, 0)) || 0,
    }
  }

  // 派生快照回写：写入本行 Config 后，客户端经 remote.settings.describe() 读到新值。
  async function writeBack(patch) {
    try {
      await outsideTransaction(ctx, function () { return settings.update(ENTRY_ID, patch) })
    } catch (e) {
      const msg = (e && e.message) || String(e)
      // 停机时序：配置编辑器先于插件失效，此写入失败属正常噪音，静音
      if (msg.indexOf("No configurable plugin entry") === -1
        && msg.indexOf("no volatile fields") === -1
        && msg.indexOf("is not registered") === -1) {
        console.error("[opencode-go-usage] 写回快照失败", msg)
      }
    }
  }

  // 取 Key：手动字段优先，其次 DSH 凭据库（多个候选名依次尝试）。
  // answered=false 表示「凭据服务还没给出结论」（服务未挂载或解析异常），
  // 这种情况属于启动时序，不能据此判定「未配置」。
  async function resolveKey(manual, names) {
    if (manual) return { key: manual, status: "manual", hint: maskKey(manual), answered: true }
    const credentials = ctx.get("credentials")
    if (credentials === undefined || typeof credentials.resolve !== "function") {
      return { key: "", status: "missing", hint: "", answered: false }
    }
    let threw = false
    for (const name of names) {
      try {
        const hit = await credentials.resolve(name)
        if (hit && hit.value) {
          return { key: hit.value, status: "auto", hint: maskKey(hit.value) + "（" + name + "）", answered: true }
        }
      } catch (e) {
        threw = true
      }
    }
    return { key: "", status: "missing", hint: "", answered: !threw }
  }

  // 未取到 Key / 凭据未就绪时的重试阶梯。credentials 服务在组合后期才注册，
  // 启动瞬间拿不到它属于正常时序；取到 Key 即归零。
  const MISSING_RETRY_DELAYS = [3000, 8000, 20000, 40000, 60000, 120000]
  let missingRetries = 0
  const retryDisposers = []
  function scheduleMissingRetry() {
    if (missingRetries >= MISSING_RETRY_DELAYS.length) return
    const delay = MISSING_RETRY_DELAYS[missingRetries]
    missingRetries++
    retryDisposers.push(ctx.timeout(function () { refreshAll() }, delay))
    trimRetries()
  }
  function trimRetries() {
    if (retryDisposers.length > 24) retryDisposers.splice(0, retryDisposers.length - 24)
  }

  // 拉取失败后的抗抖动重试：本机网络偶发抖动（DNS、连接超时、连接重置）不该让浮窗一直停在
  // 告警色，也不该等一整个刷新周期。四段共约 71 秒覆盖常见抖动窗口，成功即归零。
  const FETCH_RETRY_DELAYS = [3000, 8000, 20000, 40000]
  let fetchRetryStep = 0
  function scheduleFetchRetry() {
    if (fetchRetryStep >= FETCH_RETRY_DELAYS.length) return
    const delay = FETCH_RETRY_DELAYS[fetchRetryStep]
    fetchRetryStep++
    retryDisposers.push(ctx.timeout(function () { refreshAll() }, delay))
    trimRetries()
  }

  // 最后一份「成功快照」：① 启动早期凭据未就绪时挡住误判；
  // ② 单次拉取失败时保住浮窗上的数字。初值直接取配置里上一次成功写入的快照，
  // 因此刷新页面、重启宿主后立刻可用，不依赖任何一次新的网络往返。
  function readLastGood() {
    const out = { usage: null, balance: null }
    try {
      const u = vget(config.usage, null)
      const ks = String(vget(config.keyStatus, "") || "")
      if (u && typeof u === "object" && u.monthly && typeof u.monthly === "object" && ks && ks !== "missing") {
        out.usage = { keyStatus: ks, keyHint: String(vget(config.keyHint, "") || ""), usage: u }
      }
    } catch (e) { /* 读不到就当没有历史成功 */ }
    try {
      const b = vget(config.balance, null)
      const ks = String(vget(config.balanceKeyStatus, "") || "")
      if (b && typeof b === "object" && b.totalBalance && ks && ks !== "missing") {
        out.balance = { keyStatus: ks, keyHint: String(vget(config.balanceKeyHint, "") || ""), balance: b }
      }
    } catch (e) { /* 读不到就当没有历史成功 */ }
    return out
  }
  const lastGoodInit = readLastGood()
  let lastGoodUsage = lastGoodInit.usage
  let lastGoodBalance = lastGoodInit.balance
  let ocgMisses = 0
  let dsMisses = 0

  let inflight = null
  async function refreshAll() {
    if (inflight) return inflight
    inflight = (async function () {
      const cfg = readCfg()
      const resolved = await Promise.all([
        resolveKey(cfg.apiKey, OCG_CREDENTIALS),
        resolveKey(cfg.deepseekApiKey, DS_CREDENTIALS),
      ])
      const ocg = resolved[0]
      const ds = resolved[1]

      // 两侧凭据都还没就绪：既不落盘也不改客户端状态，只按阶梯重试。
      // 否则会把上一次的良好快照覆盖成「未配置 Key」，浮窗一直报错。
      const ocgNotReady = !ocg.key && !ocg.answered
      const dsNotReady = !ds.key && !ds.answered
      if (ocgNotReady && dsNotReady) {
        scheduleMissingRetry()
        return
      }

      // 「更新中」先落盘：客户端见到 refreshTick 变化即点亮边框流光（自动刷新因此与手动点击同款动效），
      // 结果落盘后客户端再转全绿/全红 + 3 秒淡出。放在这里而不是函数入口：上面那条提前返回
      // （两把 Key 都还没就绪）不会真正拉取，不该让浮窗空转流光。
      await writeBack({ refreshTick: cfg.refreshTick + 1 })

      const patch = {}
      let answered = false

      // ── OpenCode Go 用量 ──────────────────────────────────────────────
      if (ocgNotReady) {
        // 这一侧未就绪：本轮不动它的字段
      } else if (ocg.key) {
        ocgMisses = 0
        missingRetries = 0
        fetchRetryStep = 0
        patch.keyStatus = ocg.status
        patch.keyHint = ocg.hint
        answered = true
        try {
          patch.usage = await fetchUsage(ocg.key)
          patch.usageError = ""
          lastGoodUsage = { keyStatus: ocg.status, keyHint: ocg.hint, usage: patch.usage }
        } catch (e) {
          patch.usageError = describeError(e)
          // 保住最后已知用量：一次抖动不该让进度条从「本月 2%」掉成「--」，
          // 更不该把这个空值写进配置持久化下来。
          patch.usage = lastGoodUsage ? lastGoodUsage.usage : {}
          scheduleFetchRetry()
        }
      } else {
        ocgMisses++
        // 判据分两种：手里没有成功快照（从未成功过）时立即如实报「未配置」，
        // 让新装用户马上看到正确提示；手里有成功快照时容忍三次失手
        // （3s + 8s + 20s ≈ 31 秒），足够覆盖凭据 provider 的慢启动。
        if (lastGoodUsage && ocgMisses < 3) {
          patch.keyStatus = lastGoodUsage.keyStatus
          patch.keyHint = lastGoodUsage.keyHint
          patch.usage = lastGoodUsage.usage
          patch.usageError = ""
        } else {
          patch.keyStatus = "missing"
          patch.keyHint = ""
          patch.usageError = "未配置 OpenCode Go API Key（可在本插件设置页填写，或写入 DSH 凭据库的 OPENCODE_GO_API_KEY）"
          patch.usage = {}
        }
        answered = true
        scheduleMissingRetry()
      }

      // ── DeepSeek 官方余额 ─────────────────────────────────────────────
      if (dsNotReady) {
        // 这一侧未就绪：本轮不动它的字段
      } else if (ds.key) {
        dsMisses = 0
        missingRetries = 0
        fetchRetryStep = 0
        patch.balanceKeyStatus = ds.status
        patch.balanceKeyHint = ds.hint
        answered = true
        try {
          patch.balance = await fetchBalance(ds.key)
          patch.balanceError = ""
          lastGoodBalance = { keyStatus: ds.status, keyHint: ds.hint, balance: patch.balance }
        } catch (e) {
          patch.balanceError = describeError(e)
          patch.balance = lastGoodBalance ? lastGoodBalance.balance : {}
          scheduleFetchRetry()
        }
      } else {
        dsMisses++
        if (lastGoodBalance && dsMisses < 3) {
          patch.balanceKeyStatus = lastGoodBalance.keyStatus
          patch.balanceKeyHint = lastGoodBalance.keyHint
          patch.balance = lastGoodBalance.balance
          patch.balanceError = ""
        } else {
          patch.balanceKeyStatus = "missing"
          patch.balanceKeyHint = ""
          patch.balanceError = "未配置 DeepSeek API Key（可在本插件设置页填写，或写入 DSH 凭据库的 DEEPSEEK_API_KEY）"
          patch.balance = {}
        }
        answered = true
        scheduleMissingRetry()
      }

      // 两侧都没给出结论时不写盘（也不更新「本轮刷新时间」）
      if (!answered) return
      patch.lastUpdated = new Date().toISOString()
      await writeBack(patch)
    })().finally(function () { inflight = null })
    return inflight
  }

  let autoDisposer = null
  function applyAutoRefresh() {
    if (autoDisposer) {
      autoDisposer()
      autoDisposer = null
    }
    const mins = readCfg().refreshMinutes
    const m = Number.isFinite(mins) ? Math.min(1440, Math.max(0.5, mins)) : 5
    autoDisposer = ctx.interval(function () { refreshAll() }, Math.max(30000, Math.round(m * 60000)))
  }

  // 客户端写入配置（两把 Key / refreshMinutes / refreshRequest / 锚点）→ 响应。
  // 变更通知是 Loader 的 loader/volatile-update（写回快照也会触发，故按字段差异判断）。
  let lastCfg = readCfg()
  ctx.on("loader/volatile-update", function () {
    const next = readCfg()
    const prev = lastCfg
    lastCfg = next
    if (next.refreshMinutes !== prev.refreshMinutes) applyAutoRefresh()
    if (next.apiKey !== prev.apiKey || next.deepseekApiKey !== prev.deepseekApiKey) refreshAll()
    if (next.refreshRequest !== prev.refreshRequest) refreshAll()
  })

  ctx.effect(function () {
    refreshAll()
    applyAutoRefresh()
    return function () {
      if (autoDisposer) {
        autoDisposer()
        autoDisposer = null
      }
      for (let i = 0; i < retryDisposers.length; i++) retryDisposers[i]()
      retryDisposers.length = 0
    }
  })
}
