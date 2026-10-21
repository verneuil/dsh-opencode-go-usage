# OCG 余量查询 · dsh-opencode-go-usage

| ![插件图标](assets/icon.png) | **把 DeepSeek 官方余额与 OpenCode Go 三个用量窗口（5 小时 R / 本周 W / 本月 M）合并进同一个悬浮胶囊**，另带一个同名设置页。 |
| :---: | --- |

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![version](https://img.shields.io/github/v/tag/verneuil/dsh-opencode-go-usage?label=version&color=4b8bf5)](https://github.com/verneuil/dsh-opencode-go-usage/releases/latest) [![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/verneuil/dsh-opencode-go-usage) [![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com/p/verneuil/dsh-opencode-go-usage) [![dsh.so risk](https://www.dsh.so/badge/dsh-opencode-go-usage-15.svg)](https://www.dsh.so/artifact/dsh-opencode-go-usage-15/)

**中文** · [English](README.en.md) · [更新日志](CHANGELOG.md) · [反馈](https://github.com/verneuil/dsh-opencode-go-usage/issues)

![浮窗 · 浅色主题](screenshots/float-light.png)

> *An unofficial [DeepSeek Harness](https://github.com/deepseek-ai) plugin that shows your DeepSeek balance and OpenCode Go usage (Rolling / weekly / monthly) in one floating pill, with click-to-refresh, border-flash feedback, drag-to-snap and a hover popover.*

## 目录

- [特性](#特性) · [安装](#安装) · [使用](#使用) · [设置页](#设置页)
- [截图](#截图) · [数据来源](#数据来源) · [构型](#构型)
- [配置项](#配置项) · [稳健性设计](#稳健性设计) · [已知限制与免责声明](#已知限制与免责声明) · [许可](#许可)

## 特性

**浮窗**

- **一屏两套数据**：DeepSeek 官方余额（`¥` 金额）+ OpenCode Go 三窗口用量；**点击浮窗即刷新**（同时拉取，一侧失败不影响另一侧）。
- **三颗圆环**：环心就是百分比（默认**已使用**，可在设置里切「剩余」；不显示 `%`），剩余 > 20% 绿 / ≤ 20% 琥珀 / ≤ 5% 红；底盘为同色 32% 透明，一眼成套。
- **边框反馈**：更新中边框**呼吸式闪烁**，成功**长亮绿色**后淡出，失败**短促闪三下红** —— 闪的就是浮窗自己的边框，不存在「路径与边框对不齐」的问题。
- **悬停浮层**：鼠标停在胶囊上显示「DS账户余额 + 三条进度条」；进度条末端带**圆形百分比钮**（贴住当前进度、随主题着色），条下带**重置倒计时**；贴近窗口底部时自动改为向上展开。
- **极简模式**：三环**嵌套**（内 R / 中 W / 外 M）+ 余额**取整到元**显示在环旁，胶囊更紧凑；非极简模式为「余额 + 三颗独立圆环」。再关掉「官方余额」即为**最精简形态**：只留三环嵌套，占地最小。
- **拖动吸附**：松手自动吸附到最近的参照线（输入框卡片边 / 窗口边）；窗口尺寸变化、右侧栏开合、对话宽度调整时都按锚线跟随，不会跑位。
- **长宽恒定**：任何状态下浮窗尺寸都不变（反馈层是绝对定位叠加层，不参与布局）。

**通用**

- **零依赖**：纯原生 JS，**无构建步骤、无第三方运行时依赖**（只 `require('react')`，由宿主提供）。
- **中英双语**：全部界面文案走客户端 locale 字典，随 DSH 语言设置即时切换（浮窗、设置页、菜单名与各项操作提示）。
- **主题自适应**：颜色只取宿主主题令牌 `--dsw-alias-*`，明暗主题自动跟随；开关 / 按钮 / 输入框 / 徽章照抄宿主组件原文（只改类名前缀）。
- **自带图标**：插件列表用彩色三环图标，设置导航里用自己的量程环图标（不再是默认齿轮）。

## 安装

**前置**：DeepSeek Harness 桌面版（应用自带 node / pnpm，无需另装）。本插件按 DSH 官方插件规范编写，**不需要**手写 profile 的 `package.json` / `cordis.patch.yml`，也不要在 profile 目录里跑 pnpm。

在 DSH 里打开 **插件管理页 → 「安装插件」对话框 → 粘贴下面任一 spec → 安装**（对话框调用 pnpm，一次只能装一个）：

| 方式                     | 粘贴的 spec                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| **GitHub 直装**（推荐）      | `github:verneuil/dsh-opencode-go-usage`                                                                      |
| **固定某个版本**             | `github:verneuil/dsh-opencode-go-usage#v2.15.4`（换成任意已发布 tag）                                                  |
| **Release 包**          | `https://github.com/verneuil/dsh-opencode-go-usage/releases/download/v2.15.4/dsh-opencode-go-usage-2.15.4.tgz` |
| **Release 直链（始终最新）**   | `https://github.com/verneuil/dsh-opencode-go-usage/releases/latest/download/dsh-opencode-go-usage.tgz`        |
| **离线 tgz**             | `file:D:/你的路径/dsh-opencode-go-usage-2.15.4.tgz`                                                               |

命令行等价写法（`dsh plugin` 会把声明了 `dsh.bundle` 的依赖自动加进 profile 的 bundles，无需手写 patch）：

```sh
dsh plugin --profile web add github:verneuil/dsh-opencode-go-usage
```

不带 `#` 的写法装的是**默认分支的最新提交**（pnpm 会把它解析成当时的 commit 写进 lockfile）；带 `#` 则锁定该 tag。

装完按页面提示刷新（替换已安装的 JavaScript 模块代需要重启 DSH）。

- **只受理「组合包」**：插件管理页拒绝没有 bundle patch 的依赖，本包自带 `cordis.patch.yml`，符合要求。
- **升级 = 卸载后重装**：插件管理页不提供版本选择器与升级按钮。卸载会移除依赖记录，重装时才会重新解析，因此**这是拿到新版的方式**；直接覆盖安装同一 spec 不会刷新到新提交。
- 每个版本的改动见 [CHANGELOG.md](CHANGELOG.md)（中英双语）。

## 使用

- **点击浮窗** = 立即刷新余额 + 用量（也可以等自动刷新）。
- **拖动浮窗** = 移动位置，松手自动吸附；「重置位置」按钮可一键回到默认位置（窗口左上角）。
- **设置页** = `设置 → 插件 → OCG 余量查询`。

## 设置页

- **手动刷新**按钮挂在「OpenCode Go 用量详情」标题行右侧，刷新时间 / 结果提示在按钮左边（成功后显示「已更新（时间）」，**3 秒后自动回落**成「上次更新：…」）。
- **用量详情**：三个窗口的进度条、百分比（口径可选）、重置倒计时与接口 status。
- **进度口径二选一**（用量详情卡片右上角）：**已使用** / **剩余**，浮窗与设置页同时跟随；默认**已使用**。
- **自动刷新间隔**（分钟，0.5 ~ 1440）。
- **悬浮窗**：一行四件事 —— 「极简模式」复选框、「官方余额」复选框（关掉后浮窗只留三组圆环、自动变窄）、「重置位置」按钮、总开关（默认：极简模式开、官方余额关）。
- **一键恢复默认设置**（设置页最底部右下角）：一次写回「已使用 / 5 分钟 / 极简模式 / 不显示余额 / 左上角默认位置」—— 新装默认形态就是这一套。
- **切换动效**：极简模式、进度口径、余额显隐切换时内容淡入放大，环心数字与弧长带过渡，不生硬跳变。
- **两把 Key 的覆盖输入**（留空即用 DSH 凭据库；可随时清空改回自动）。
- **每个操作的提示就地出现在该行**（改间隔的提示在「自动刷新」行、开关窗的提示在「悬浮窗」行……），失败红色、成功绿色；提示放在标题行的槽位里，**出现与消失都不顶动排版**（实测同结构字段 `delta = 0`），**停留 3 秒后自动消失**。

因为自带设置页，宿主侧调用了官方的 `settings.configure({ auto: false })` 关掉自动生成的表单页，避免出现两个重复的配置界面。

## 截图

> 五张均为**界面示意渲染**：按插件的真实样式与宿主主题令牌生成。

| 浮窗 · 浅色                                    | 浮窗 · 深色                                   |
| ------------------------------------------ | ----------------------------------------- |
| ![浮窗 · 浅色](screenshots/float-light.png)   | ![浮窗 · 深色](screenshots/float-dark.png)   |
| **设置页 · 浅色**                               | **设置页 · 深色**                              |
| ![设置页 · 浅色](screenshots/settings-light.png) | ![设置页 · 深色](screenshots/settings-dark.png) |

**形态与配色总览**（更新中 / 成功 / 失败 / 三档配色 / 极简模式 / 最精简形态 / 关掉余额后变窄）

![形态与配色总览](screenshots/states-light.png)

## 目标：极简

- 尝试尽量融入现有的 DeepSeek Harness UI 设计，不突兀，不抢眼，但是又能方便地看到目前的用量，从长条进度条一路升级到现在的三个圆环。
- 目前暂时只支持 OpenCode Go，其他 Coding 套餐暂时还没时间弄。

## 数据来源

```
GET https://opencode.ai/zen/go/v1/usage                    # OpenCode Go 用量
Authorization: Bearer <OpenCode Go API Key>

GET https://api.deepseek.com/user/balance                  # DeepSeek 官方余额
Authorization: Bearer <DeepSeek API Key>
```

用量接口返回 `{ usage: { rolling, weekly, monthly } }`，每个窗口含 `status` / `percent`（**已用**百分比）/ `resetsAt`；余额接口返回 `balance_infos[]`（优先取 CNY 行）。**插件界面默认显示「已使用」，可切换为「剩余」；内部始终以「已用」为基准。**
宿主半侧负责拉取与解析（两把 Key 都不出宿主进程），客户端只读宿主写入的配置投影。

**Key 来源**（两侧各自独立，按优先级）：

1. 插件设置页里的「手动 Key」（写入本行配置持久化，客户端视图自动脱敏）；
2. DSH 凭据库 —— OpenCode Go 取 `OPENCODE_GO_API_KEY`（其次 `OPENCODE_API_KEY`），DeepSeek 取 `DEEPSEEK_API_KEY`。

## 构型

| 部分            | 位置                 | 说明                                                                                                   |
| ------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| Bundle 清单     | `package.json`     | `dsh.bundle.patch` + `dsh.client`（platform web、immediately）+ `icon` + `locale/*.json` 显示元数据          |
| Loader patch  | `cordis.patch.yml` | 插入一行 `id: opencode-go-usage`（本行 id 同时是设置表单的 ns）                                                      |
| 宿主半侧          | `index.js`         | `export const Config`（schemastery）+ `apply(ctx, config)`；拉取、解析、写回快照、自动刷新                             |
| 客户端半侧         | `client.js`        | `window.__ModuleLoader__` 惰性工厂；只 `require('react')`，注册进 `shell.overlay`（浮窗）与 `settings.section`（设置页） |

## 配置项

设置页覆盖了常用项；下表中的字段也可以直接改本行 patch 的 `config`。

| 字段                                                           | 说明                                              |
| ------------------------------------------------------------ | ----------------------------------------------- |
| `apiKey`                                                     | OpenCode Go 的手动 API Key（secret）。留空则自动使用 DSH 凭据库 |
| `deepseekApiKey`                                             | DeepSeek 的手动 API Key（secret）。留空则自动使用 DSH 凭据库    |
| `refreshMinutes`                                             | 自动刷新间隔（分钟，默认 5）；一轮同时刷新余额与用量                     |
| `widgetVisible`                                              | 浮窗显示开关                                          |
| `showBalance`                                                | 浮窗上是否显示 DeepSeek 官方余额（默认关）                      |
| `percentMode`                                                | 用量进度口径：`used` 已使用（默认）/ `left` 剩余                 |
| `widgetAnchorX/Y`、`widgetOffsetX/Y`                          | 浮窗锚定（拖动时由客户端写入；默认窗口左上角 11 / 50）                  |
| `refreshRequest`                                             | 手动刷新计数（点击浮窗时由客户端递增）                             |
| `refreshTick`                                                | 宿主每轮拉取前自增的「更新中」信号（客户端只读，用来点亮边框反馈）               |
| `minimalMode`                                                | 极简模式：三环嵌套（余额取整显示在环旁，默认开）                        |
| `keyStatus`、`keyHint`、`usageError`、`lastUpdated`、`usage`     | OCG 用量的派生快照（宿主写入，客户端读取）                         |
| `balanceKeyStatus`、`balanceKeyHint`、`balanceError`、`balance` | DeepSeek 余额的派生快照（宿主写入，客户端读取）                    |

## 稳健性设计

- **只占官方为浮层保留的席位** `shell.overlay`（`replaceRisk: none`，点击穿透层，条目自行 opt-in 指针事件）；用自有 `id` 注册，属于「加在既有条目旁边」，不替换任何官方条目。
- **不遮蔽任何官方 UI**：不注册 `conversation.composer.dock`，不复刻官方组件。
- **样式只用主题令牌** `--dsw-alias-*`：令牌改名最多让外观退化，不会让渲染崩溃；无字面色值。
- **不引入任何 Harness 客户端包**（如 `dsh-client-ui-primitives`）：这类包随时会变，且普通 JS 插件没有类型检查；浮窗的控件全部自写。
- **宿主 API 契约自检**：启动时校验本插件实际用到的宿主契约，不匹配时打印可读警告并安全跳过，而不是抛 `TypeError` 让整条目静默不激活。
- **配置即通道**：宿主把派生快照写进本行 Config 的 volatile 字段，客户端经 `remote.settings.describe()` 读取；写回在 HMR 事务之外提交（避免 `HMR transactions cannot be nested`）。
- **失败不清空数据**：拉取失败时保留最后已知用量（并做 3s / 10s 抗抖动重试），不会因为一次网络抖动把进度条清成 `--` 或把空值持久化。
- 未取到 Key 时按阶梯重试（3/8/20/40/60/120 秒），手里有成功快照时容忍三次失手，避免启动瞬间误判「未配置」。

## 已知限制与免责声明

- **非官方插件**：本项目与 DeepSeek、OpenCode 官方**无任何隶属关系**；两个接口都不是官方长期冻结的公开契约，上游结构大改时可能失效（解析器已对「剩余百分比 / 已用金额与额度 / 距重置秒数」等常见变体做容错，失败时宿主会在 `usageError` 里给出可读文本）。
- **Key 只在本机使用**：宿主半侧直接请求上述两个接口，不经过任何第三方；设置页里填写的手动 Key 存在本机插件配置中，界面上只显示脱敏掩码（如 `sk-****5590`）。
- **网络抖动**：跨境 HTTPS 偶发超时属正常，此时浮窗保持**最后已知数值**、边框转告警色，宿主按 3/8/20/40 秒重试，成功后自动恢复。
- **界面语言**：浮窗与设置页支持**中英双语**，随 DSH 语言设置切换；接口层返回的**错误详情**（如 401/403、返回结构异常）目前仍为中文。
- **使用风险自负**：本软件按 MIT 许可「原样」提供，不附带任何担保。

## 许可

[MIT](LICENSE) © 2026 verneuil

## 反馈

问题与建议请开 [Issue](https://github.com/verneuil/dsh-opencode-go-usage/issues)，欢迎 PR。版本变更见 [CHANGELOG.md](CHANGELOG.md)。
