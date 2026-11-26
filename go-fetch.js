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

export const GO_MODELS_URL = "https://opencode.ai/inference/go/v1/models"
export const FX_SOURCES = [
  { name: "open.er-api.com", url: "https://open.er-api.com/v6/latest/USD" },
  { name: "frankfurter.app", url: "https://api.frankfurter.app/latest?from=USD&to=CNY" },
]
export { GO_DATA_SNAPSHOT }

// UA 只在这里定义一次，宿主半侧 import 复用（避免版本号两处漂移）
export const USER_AGENT = "dsh-opencode-go-usage/3.6.4 (+DeepSeek Harness plugin; +https://github.com/verneuil/dsh-opencode-go-usage)"
const UA = USER_AGENT

/**
 * 抓取并解析官方模型表。
 * 2026-11 起官方把「模型 / Monthly limit」表格从文档页移除，改用公开 JSON：
 * GET https://opencode.ai/inference/go/v1/models → data[].go.monthly_usage.go 即 Go 档月度额度（美元）。
 * @returns {Promise<{models: Array<{id:string,name:string,go:number|null}>, at: string, source: string}>}
 */
export async function fetchGoModelsLive(timeoutMs) {
  const res = await fetch(GO_MODELS_URL, {
    headers: { "user-agent": UA, accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs || 20000),
  })
  if (!res.ok) throw new Error("官方模型接口返回 HTTP " + res.status)
  const json = await res.json()
  const list = json && Array.isArray(json.data) ? json.data : []
  if (list.length < 5) throw new Error("接口返回异常：只有 " + list.length + " 个模型")

  const models = []
  for (const m of list) {
    if (!m || typeof m.id !== "string" || !m.id) continue
    const goRaw = m.go && m.go.monthly_usage ? m.go.monthly_usage.go : null
    const go = typeof goRaw === "number" && isFinite(goRaw) ? goRaw : null
    const name = typeof m.name === "string" && m.name.trim() ? m.name.trim() : m.id
    models.push({ id: m.id, name, go })
  }
  models.sort((a, b) => a.name.localeCompare(b.name))
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
