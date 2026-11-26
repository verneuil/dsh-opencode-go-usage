/**
 * go-data.js — OpenCode Go 模型配额与汇率的**内置兜底数据**（自动生成，请勿手改）。
 *
 * 生成：node _tools/fetch-go-models.cjs
 * 来源：https://opencode.ai/inference/go/v1/models
 *       USD/CNY 汇率：open.er-api.com @ 25 Nov 2026
 * 快照日期：2026-11-26
 *
 * 运行时行为：插件每次刷新会尝试抓取最新数据；抓不到时回退到这份快照，并在界面上明确报错。
 * go 为该模型的 **Go 档月度配额（美元）**；null 表示免费模型（无月度额度）。
 */
export const GO_DATA_SNAPSHOT = {
  snapshotDate: "2026-11-26",
  source: "https://opencode.ai/inference/go/v1/models",
  fx: { usdCny: 6.678179, date: "25 Nov 2026", source: "open.er-api.com" },
  plans: { go: { label: 'Go', price: 10 } },
  models: [
  { id: "beam-free", name: "Beam Free", go: null },
  { id: "claude-haiku-5-5", name: "Claude Haiku 5.5", go: 15 },
  { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", go: 15 },
  { id: "deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash 1017", go: 100 },
  { id: "gemini-4-argon", name: "Gemini 4 Argon", go: 30 },
  { id: "gemini-decision-1", name: "Gemini Decision 1", go: 10 },
  { id: "gemini-embedding-2", name: "Gemini Embedding 2", go: 10 },
  { id: "glm-5.3", name: "GLM-5.3", go: 200 },
  { id: "glm-5.3-flash", name: "GLM-5.3-Flash", go: 60 },
  { id: "gpt-5.6-luna", name: "GPT-5.6 Luna", go: 15 },
  { id: "gpt-6-luna", name: "GPT-6 Luna", go: 15 },
  { id: "gpt-6-luna-decision", name: "GPT-6 Luna Decision", go: 10 },
  { id: "grok-4.7", name: "Grok 4.7", go: 15 },
  { id: "hungerg-free", name: "HungerG Free", go: null },
  { id: "hy3", name: "Hy3", go: 60 },
  { id: "hy4", name: "Hy4", go: 60 },
  { id: "hy4-flash-free", name: "Hy4 flash Free", go: null },
  { id: "hy4-preview", name: "Hy4 preview", go: 30 },
  { id: "iceman-contributor-free", name: "Iceman Contributor Free", go: null },
  { id: "jev-1.14", name: "Jev 1.14", go: 10 },
  { id: "kimi-k2.7-code", name: "Kimi K2.7 Code", go: 60 },
  { id: "kimi-k3", name: "Kimi K3", go: 15 },
  { id: "kimi-k3.1-pro", name: "Kimi K3.1 Pro", go: 60 },
  { id: "longcat-2.5", name: "LongCat-2.5", go: 60 },
  { id: "mimo-v2.6-flash", name: "MiMo-V2.6-Flash", go: 60 },
  { id: "mimo-v2.6-pro", name: "MiMo-V2.6-Pro", go: 15 },
  { id: "minimax-m3.1-flash", name: "MiniMax M3.1 Flash", go: 20 },
  { id: "minimax-m3", name: "MiniMax-M3", go: 60 },
  { id: "muse-spark-1.2-contributor", name: "Muse Spark 1.2 Contributor", go: 60 },
  { id: "muse-spark-1.3-contributor", name: "Muse Spark 1.3 Contributor", go: 60 },
  { id: "qwen3-embedding-8b", name: "Qwen3 Embedding 8B", go: 10 },
  { id: "qwen3.7-plus", name: "Qwen3.7 Plus", go: 60 },
  { id: "qwen3.8-flash", name: "Qwen3.8 Flash", go: 30 },
  { id: "qwen3.8-max", name: "Qwen3.8 Max", go: 15 },
  { id: "qwen4-max", name: "Qwen4 Max", go: 15 },
  { id: "step-5-preview", name: "Step 5 Preview", go: 15 },
  { id: "text-embedding-3-small", name: "text-embedding-3-small", go: 10 }
  ]
};

export default GO_DATA_SNAPSHOT;
