/**
 * go-data.js — OpenCode Go 模型配额与汇率的**内置兜底数据**（自动生成，请勿手改）。
 *
 * 生成：node _tools/fetch-go-models.cjs
 * 来源：https://opencode.ai/v2/docs/console/go
 *       USD/CNY 汇率：open.er-api.com @ 31 Oct 2026
 * 快照日期：2026-10-31
 *
 * 运行时行为：插件每次刷新会尝试抓取最新数据；抓不到时回退到这份快照，并在界面上明确报错。
 * go 为该模型的 **Go 档月度配额（美元）**；null 表示无限制（免费模型）。
 */
export const GO_DATA_SNAPSHOT = {
  snapshotDate: "2026-10-31",
  source: "https://opencode.ai/v2/docs/console/go",
  fx: { usdCny: 6.669566, date: "31 Oct 2026", source: "open.er-api.com" },
  plans: { go: { label: 'Go', price: 10 } },
  models: [
  { id: "beam-free", name: "Beam Free", go: null },
  { id: "claude-haiku-5-5", name: "Claude Haiku 5.5", go: 15 },
  { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", go: 15 },
  { id: "deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash", go: 100 },
  { id: "gemini-4-argon", name: "Gemini 4 Argon", go: 30 },
  { id: "glm-5.2", name: "GLM-5.2", go: 60 },
  { id: "glm-5.3", name: "GLM-5.3", go: 15 },
  { id: "glm-5.3-flash", name: "GLM-5.3-Flash", go: 60 },
  { id: "gpt-5.6-luna", name: "GPT 5.6 Luna", go: 15 },
  { id: "gpt-6-luna", name: "GPT 6 Luna", go: 15 },
  { id: "grok-4.7", name: "Grok 4.7", go: 15 },
  { id: "hy3", name: "Hy3", go: 60 },
  { id: "hy4-preview", name: "Hy4 preview", go: 30 },
  { id: "iceman-contributor-free", name: "Iceman Contributor Free", go: null },
  { id: "kimi-k2.7-code", name: "Kimi K2.7 Code", go: 60 },
  { id: "kimi-k3", name: "Kimi K3", go: 15 },
  { id: "kimi-k3.1-pro", name: "Kimi K3.1 Pro", go: 15 },
  { id: "longcat-2.0", name: "LongCat-2.0", go: 60 },
  { id: "mimo-v2.5", name: "MiMo-V2.5", go: 60 },
  { id: "mimo-v2.5-pro", name: "MiMo-V2.5-Pro", go: 15 },
  { id: "mimo-v2.6-flash", name: "MiMo-V2.6-Flash", go: 60 },
  { id: "mimo-v2.6-pro", name: "MiMo-V2.6-Pro", go: 15 },
  { id: "minimax-m3", name: "MiniMax M3", go: 60 },
  { id: "minimax-m3.1-flash", name: "MiniMax M3.1 Flash", go: 20 },
  { id: "muse-spark-1.2-contributor", name: "Muse Spark 1.2 Contributor", go: 60 },
  { id: "muse-spark-1.3-contributor", name: "Muse Spark 1.3 Contributor", go: 60 },
  { id: "qwen3.7-plus", name: "Qwen3.7 Plus", go: 60 },
  { id: "qwen3.8-flash", name: "Qwen3.8 Flash", go: 30 },
  { id: "qwen3.8-max", name: "Qwen3.8 Max", go: 15 },
  { id: "step-5-preview", name: "Step 5 Preview", go: 15 }
  ]
};

export default GO_DATA_SNAPSHOT;
