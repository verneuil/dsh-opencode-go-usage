/**
 * go-fetch.js — 运行时抓取「OpenCode Go 模型配额表」与「USD/CNY 汇率」（宿主半侧，ESM）。
 *
 * 设计要点：
 *   · 两个数据源都不需要密钥，且都带来源与时间戳，便于界面区分「实时值 / 内置快照」。
 *   · 解析失败一律抛错 —— 由调用方回退到 go-data.js 的内置快照并**明确报错**，绝不静默降级。
 *   · 官方页面是服务端渲染的 <table>：两张 Monthly limit 表（先 Go 后 Go Plus）+ 一张 Endpoints 表
 *     （模型名 → 模型 ID）。本插件只按 **Go 档**计算，故只取第一张表的限额。
 *   · 汇率主源 open.er-api.com（快、带更新时间），备源 api.frankfurter.app（欧洲央行口径），
 *     两者都失败时由调用方回退内置汇率。
 */
import { GO_DATA_SNAPSHOT } from "./go-data.js"

export const GO_PAGE_URL = "https://opencode.ai/v2/docs/console/go"
export const FX_SOURCES = [
  { name: "open.er-api.com", url: "https://open.er-api.com/v6/latest/USD" },
  { name: "frankfurter.app", url: "https://api.frankfurter.app/latest?from=USD&to=CNY" },
]
export { GO_DATA_SNAPSHOT }

// UA 只在这里定义一次，宿主半侧 import 复用（避免版本号两处漂移）
export const USER_AGENT = "dsh-opencode-go-usage/3.0.1 (+DeepSeek Harness plugin; +https://github.com/verneuil/dsh-opencode-go-usage)"
const UA = USER_AGENT

function stripTags(s) {
  return String(s)
    .replace(/<[^>]*>/g, "")
    .replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// "$80" → 80；"Unlimited" → null（无限制）；"Free" → 0
function parseMoney(s) {
  const t = stripTags(s)
  if (/unlimited/i.test(t)) return null
  if (/^free$/i.test(t)) return 0
  const m = t.match(/\$?\s*([\d.]+)/)
  return m ? Number(m[1]) : null
}

/**
 * 抓取并解析官方模型表。
 * @returns {Promise<{models: Array<{id:string,name:string,go:number|null}>, at: string, source: string}>}
 */
export async function fetchGoModelsLive(timeoutMs) {
  const res = await fetch(GO_PAGE_URL, {
    headers: { "user-agent": UA, accept: "text/html" },
    signal: AbortSignal.timeout(timeoutMs || 20000),
  })
  if (!res.ok) throw new Error("官方页面返回 HTTP " + res.status)
  const html = await res.text()
  if (!/Monthly limit/i.test(html)) throw new Error("页面结构变化：未找到「Monthly limit」表")

  // 切表 → 切行 → 切单元格
  const tables = []
  const tre = /<table>([\s\S]*?)<\/table>/g
  let m
  while ((m = tre.exec(html))) {
    const rows = []
    const rre = /<tr>([\s\S]*?)<\/tr>/g
    let r
    while ((r = rre.exec(m[1]))) {
      const cells = []
      const cre = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g
      let c
      while ((c = cre.exec(r[1]))) cells.push(c[1])
      if (cells.length) rows.push(cells)
    }
    if (rows.length) tables.push({ head: rows[0].map(stripTags).join(" | "), rows: rows.slice(1) })
  }

  const limitTables = tables.filter((t) => /Monthly limit/i.test(t.head))
  if (limitTables.length < 1) throw new Error("页面结构变化：限额表数量不足")
  // 只按 Go 档：第一张表即 Go（第二张是 Go Plus，限额更大，本插件不使用）
  const goTable = limitTables[0]

  const ep = tables.find((t) => /Model ID/i.test(t.head))
  if (!ep) throw new Error("页面结构变化：未找到模型 ID 映射表")
  const idByName = new Map()
  for (const cells of ep.rows) {
    const name = stripTags(cells[0])
    const id = stripTags(cells[1])
    if (name && /^[a-z0-9][a-z0-9.\-]*$/i.test(id)) idByName.set(name, id)
  }

  const byId = new Map()
  for (const cells of goTable.rows) {
    const name = stripTags(cells[0])
    if (!name) continue
    const base = name.replace(/\s*\(.*$/, "").trim() // 去掉 (Off-Peak) / (≤ 256K tokens) 等后缀
    const id = idByName.get(base)
    if (!id) continue // 免费/临时模型若没进 Endpoints 表就跳过，不影响主要模型
    const go = parseMoney(cells[cells.length - 1])
    const cur = byId.get(id)
    // 同 ID 的分层行（如 Off-Peak / Peak）：限额应一致，取较大者兜底
    if (!cur) byId.set(id, { id, name: base, go })
    else if (go !== null && (cur.go === null || go > cur.go)) cur.go = go
  }
  const models = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
  if (models.length < 5) throw new Error("解析结果异常：只得到 " + models.length + " 个模型")
  return { models, at: new Date().toISOString(), source: "live" }
}

/**
 * 抓取 USD/CNY 汇率（主源 → 备源）。
 * @returns {Promise<{usdCny:number, date:string, source:string}>}
 */
export async function fetchFxLive(timeoutMs) {
  const errors = []
  for (const src of FX_SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: { "user-agent": UA, accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs || 20000),
      })
      if (!res.ok) throw new Error("HTTP " + res.status)
      const j = await res.json()
      const rate = j && j.rates && Number(j.rates.CNY)
      if (!(rate > 0)) throw new Error("响应缺少 CNY 汇率")
      const date = (j.time_last_update_utc || j.date || "").toString()
      return { usdCny: rate, date, source: src.name }
    } catch (e) {
      errors.push(src.name + "：" + ((e && e.message) || String(e)))
    }
  }
  throw new Error(errors.join("；"))
}
