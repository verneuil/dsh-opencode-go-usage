# 更新日志 · Changelog

记录每个版本相对上一版的变更，最新在最上。版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。
Every release's changes, newest first. Versioning follows [Semantic Versioning](https://semver.org/).

## 3.0.5
- 更新内置兜底数据到最新：模型表 29 → 30 个（新增 Kimi K3.1 Pro；替换Gemini 4 Argon Contributor、
  MiniMax M3.1 Flash Free 为 Gemini 4 Argon、MiniMax M3.1 Flash 并带配额）汇率快照更新到24 Oct 2026；
- 插件行为无变化，无任何功能改动。

**English**
- Refreshed the bundled fallback data: the model table grew from 29 to 30 (adds Kimi K3.1 Pro; replaces
  Gemini 4 Argon Contributor and MiniMax M3.1 Flash Free with Gemini 4 Argon and MiniMax M3.1 Flash, now
  with quotas); the exchange-rate snapshot is updated to 24 Oct 2026;
- No behavioural change — no functional change.

## 3.0.4
- 把「安全与隐私」小节同步进 npm 包（README 中英两版，内容与仓库一致）；
- 截图更新为当前版本；
- 插件行为无任何改动。

**English**
- Synced the "Security & privacy" section into the npm package (both READMEs, identical to the repository);
- Screenshots updated to the current version;
- No functional change.

## 3.0.3
- npm 侧重新发布（内容与 3.0.2 一致，另含 README 中 npm 安装命令的补全）；
- 插件行为无任何改动。

**English**
- Republished the npm package (same content as 3.0.2, plus the completed npm install command in the README);
- No functional change.

## 3.0.2
- 把文档与截图同步进 npm 包（README 补上 npm 安装方式与徽章；截图中的版本号更新为当前版本）；
- 插件行为与 3.0.1 一致，无功能改动。

**English**
- Synced the docs and screenshots into the npm package (npm install hint and badge in the README;
  the version shown in the screenshots updated to the current release);
- Behaviour is identical to 3.0.1 — no functional change.

## 3.0.1
- 包名改为 `@verneuil/dsh-opencode-go-usage`，以便发布到 npm（GitHub 直装方式完全不变）；
- 插件行为与 3.0.0 一致，无功能改动。

**English**
- Renamed the package to `@verneuil/dsh-opencode-go-usage` so it can be published to npm (the GitHub install path is unchanged);
- Behaviour is identical to 3.0.0 — no functional change.

## 3.0.0
新功能：
- 新增OpenCode Go模型配额金额显示。提供「配额参考模型选择」，按 OpenCode Go 各模型的月度配额折算该模型的已消耗与剩余金额，可选全部官方模型（默认 DeepSeek V4.1 Flash），模型清单随官方文档定时抓取更新，也可以手动刷新，获取失败时回退内置列表和配额数据；
- 新增「金额显示计价币种」切换。所有金额（DS余额与OCG配额）可切换 ¥人民币 / $美元 / 自动（中文¥、英文$）。汇率自动获取，获取失败时回退内置汇率；
- 「浮窗」可自主选择显示DS官方余额或OCG配额。具体功能菜单细化：「在浮窗左侧显示余额」总开关、「浮窗左侧余额数据」（DS余额 / OCG配额剩余二选一）、「鼠标悬停浮层余额数据」下拉多选（支持同时或单独显示DS、OCG的数据或都不显示）；
改进和修复：
- 数据获取失败时有更明确的提示信息。明确提示是 OCG 用量、DeepSeek 官方余额、汇率还是模型列表及配额获取出错；
- 悬停浮层动效优化，文本显示效果精简与修正；
- 设置菜单的文本描述、图标、按钮和控件优化了使用体验；
- 数据刷新说明：OpenCode Go模型清单、配额与汇率自动刷新周期：模型表 24 小时、汇率 1 小时，均复用缓存；手动刷新（菜单按钮 / 点击浮窗）均触发强制重抓，设置菜单小字如实显示各自的更新时刻与刷新结果。

**English**

**New features**
- Added OpenCode Go model quota amounts: a “quota reference model” selector converts each OpenCode Go model’s monthly quota into that model’s used and remaining amounts; every official model is available (DeepSeek V4.1 Flash by default), the list is refreshed from the official docs on a schedule or by manual refresh, and a failed fetch falls back to the bundled list and quota data;
- Added an “amount display currency” switch: every amount (the DS balance and the OCG quota) can be shown in ¥ CNY / $ USD / auto (¥ in Chinese, $ in English). The rate is fetched automatically and falls back to the bundled rate on failure;
- The pill can now show either the DS balance or the OCG quota by choice, with a finer set of settings rows: a “show a balance on the pill's left” master switch, “pill left-side balance data” (DS balance / OCG quota left, pick one) and a “hover popover balance data” checkbox dropdown (show the DS and OCG data together, separately, or neither);

**Improvements & fixes**
- Fetch failures are reported more explicitly, stating whether OCG usage, the DeepSeek balance, the exchange rate or the model list & quota failed;
- The hover popover’s animation was improved and its text display was tightened and corrected;
- The settings page’s wording, icons, buttons and controls were refined for a better experience;
- Refresh behaviour: the OpenCode Go model list, the quota and the exchange rate refresh automatically on a 24 h (model table) and 1 h (rate) cycle, reusing the cache; manual refresh (the settings button or a pill click) always forces a refetch, and the settings footnotes report each one’s own update time and result.

## 2.16.0
- 设置页UI更新；
- 设置增加一键跳转Opencode官方控制台的图标按钮；
- 浮窗的鼠标悬停浮层UI更新优化；
- 优化一些文案说明的准确性；
- 对部分插件安装环境进行针对性优化，提升插件稳定性。

**English**
- Settings page UI updated;
- Settings gained an icon button that jumps straight to the OpenCode console;
- The pill's hover popover got a UI refresh;
- Improved the accuracy of several strings;
- Targeted optimisations for some plugin install environments, improving stability.

## 2.15.4
- 修复切到英文界面后插件文案仍显示中文的问题；
- 优化部分中英文描述文案的准确性；
- 插件图标换新、设置导航的菜单图标换新；
- 悬停浮层样式换新。

**English**
- Fixed the plugin copy staying Chinese after switching the UI to English;
- Improved the accuracy of several Chinese and English strings;
- New plugin icon and a new settings-navigation glyph;
- New hover-popover styling.

## 2.15.3
- 修正了一些文本上的描述；
- 提交了插件市场并增加了一些合规性声明；
- 无任何功能性更新。

**English**
- Fixed a few text descriptions;
- Submitted to the plugin market and added some compliance declarations;
- No functional changes.

## 2.15.2
- 把 `@deepseek-ai/schemastery` 声明为 `peerDependencies`（并标 `optional`，由宿主运行时提供，不会多装副本）

**English**
- Declared `@deepseek-ai/schemastery` as a `peerDependencies` entry (marked `optional`: the host runtime provides it, so no second copy is installed)

## 2.15.1
- 补齐 `package.json` 的 `main` 字段；描述里的「边框光轨」改为现行的边框闪烁（行为无变化）

**English**
- Added the missing `main` field to `package.json`; corrected the description from the retired light rail to the current border flash (no behaviour change)

## 2.15.0
- 新增「恢复默认设置」：一键写回已使用 / 5 分钟 / 极简模式 / 不显示余额 / 默认位置
- 默认位置改为窗口左上角；「重置到右下角」更名「重置位置」
- 新装默认即这套组合；三处开关切换加入过渡动效

**English**
- Added “Restore defaults”: one click writes back Used / 5 min / Minimal mode / balance hidden / default position
- Default position is now the window's top-left corner; “Reset to bottom-right” became “Reset position”
- A fresh install starts from that same combination; the three toggles now animate instead of cutting

## 2.14.0
- 更新反馈改为边框闪烁：更新中呼吸闪、成功长亮、失败闪三下红
- 新增极简模式：三环嵌套 + 环旁取整余额；悬停浮层加重置倒计时
- 浮窗收紧：三环更粗、环心数字更小、胶囊更矮

**English**
- Refresh feedback became a border flash: a breathing border while loading, a solid green hold on success, three red blinks on failure
- Added Minimal mode: nested rings with the rounded balance beside them; the hover popover gained reset countdowns
- The pill got tighter: thicker rings, smaller in-ring numbers, a shorter capsule

## 2.13.0
- 浮窗悬停显示临时浮层：余额 + 三条进度条，贴底时向上展开
- 浮窗整体再窄约 14px

**English**
- Hovering the pill shows a temporary popover: balance plus three progress bars, flipping upwards near the bottom edge
- The pill became about 14px narrower

## 2.12.0
- 新增进度口径二选一：已使用 / 剩余，浮窗与设置页同时跟随
- 配色阈值随口径自动切换

**English**
- Added a choice of progress basis: Used or Left, followed by both the pill and the settings page
- Colour thresholds switch automatically with the basis

## 2.11.0
- 用量口径改为「剩余」：三环弧长与数字、设置页进度条同步
- 配色阈值反转：剩余 ≤20% 转橙、≤5% 转红

**English**
- Usage basis switched to “Left”: ring arcs, in-ring numbers and the settings-page bars all follow
- Colour thresholds inverted: amber at ≤20% left, red at ≤5% left

## 2.10.0
- 界面支持**中英双语**：浮窗与设置页的全部文案接入客户端 locale 字典（`ctx.locale.register` + 框架注入的 `t` 席位），随 DSH 语言设置切换；设置页菜单名与各操作提示同步切换
- 提示的红/绿语气改由调用方显式指定（原来按中文关键词判断，英文提示会被误判为「成功」）
- 已知限制：接口层返回的错误详情（未配置 Key、401/403、返回结构异常等）仍为中文

**English**
- Bilingual UI: every string in the pill and the settings page goes through the client locale dictionaries (`ctx.locale.register` plus the framework-injected `t` seat) and follows the DSH language setting, including the settings menu entry and all inline messages
- Message tone (success/error) is now passed explicitly by the caller instead of being guessed from Chinese keywords, which mislabelled English errors as successes
- Known limitation: error details raised by the API layer (missing key, 401/403, unexpected payloads) are still Chinese

## 2.9.6
- 客户端装配改为官方模板写法：插件对象显式声明 `inject: ['slots']`，席位注册统一走 `ctx.slots.inject()`（对外行为不变）
- 新增英文版 README（`README.en.md`），中英互链

**English**
- Client wiring now follows the official template: the plugin object declares `inject: ['slots']` and every seat is registered through `ctx.slots.inject()` (no visible change)
- Added an English README (`README.en.md`), cross-linked with the Chinese one

## 2.9.5
- 悬浮窗的余额开关文案改为「显示DS官方余额」，鼠标提示与无障碍标签同步更新

**English**
- The pill's balance toggle is now labelled “显示DS官方余额”, with matching tooltip and accessible label

## 2.9.4
- 浮窗四边内边距改为一致（4px），圆环到边框的留白处处相等
- 胶囊尺寸 139.2×30 → 131.2×30px（不显示余额时 84px）
- 移除设置页顶部多余的「（浮窗上三颗圆环依次对应）」

**English**
- Even padding on all four sides of the pill (4px), so the rings keep equal clearance from the border
- Capsule 139.2×30 → 131.2×30px (84px with the balance hidden)
- Removed the redundant “(the three rings map in order)” line from the settings page header

## 2.9.3
- 收紧浮窗内边距（5px 10px → 4px 8px），胶囊 143.2×32 → 139.2×30px

**English**
- Tightened the pill padding (5px 10px → 4px 8px); capsule 143.2×32 → 139.2×30px

## 2.9.2
- 去掉圆环外侧的 H / W / M 字母标签，已用百分比继续显示在环心
- 胶囊宽度 183.2 → 143.2px（不显示余额时 96px）

**English**
- Removed the H / W / M labels outside the rings; the used percentage stays in the ring centre
- Capsule width 183.2 → 143.2px (96px with the balance hidden)

## 2.9.1
- 代码整理：移除无用标识符与冗余注释，补齐包元数据（无行为变更）

**English**
- Code tidy-up: dropped unused identifiers and redundant comments, completed the package metadata (no behaviour change)

## 2.9.0
- 「手动刷新」按钮移到「OpenCode Go 用量详情」标题行右侧
- 新增「显示余额」开关（配置字段 `showBalance`，默认开启），关闭后浮窗只留三颗圆环并自动变窄
- 悬浮窗行的控件顺序统一为：是否显示余额 → 重置位置 → 总开关

**English**
- The “Refresh now” button moved to the right of the “OpenCode Go usage” title row
- Added a “Show balance” toggle (`showBalance`, on by default); turning it off leaves only the three rings and narrows the pill
- The pill row's controls are ordered: show balance → reset position → master switch

## 2.8.9
- 「悬浮窗」与「浮窗位置」合并为一行，开关与「重置到右下角」并排
- 行内提示文案压短，减少省略号截断

**English**
- Merged the “Floating pill” and “Pill position” rows into one, with the switch beside “Reset to bottom-right”
- Shortened the inline hints so fewer of them get truncated

## 2.8.8
- 三个用量行的重置倒计时并入标题行、位于百分比左侧，每行高度 50 → 32.4px
- 百分比改为定宽右对齐，三行数字成列

**English**
- Each usage row's reset countdown moved into the title row, left of the percentage; row height 50 → 32.4px
- Percentages are right-aligned in a fixed-width column, so the three rows line up

## 2.8.7
- 两把 API Key 改为通栏布局：输入框左到头、右到按钮
- 输入框高度 34 → 28px，与按钮等高
- 结果提示移到标题行，出现与消失不再改变行高

**English**
- Both API key fields became full-width rows: the input spans from the left edge to the buttons
- Input height 34 → 28px, matching the buttons
- Result messages moved to the title row, so appearing and disappearing no longer shifts the layout

## 2.8.6
- 标题层级对齐官方设置页：页面标题 20px、分组标题 15px 并加粗
- 所有字段控件贴右对齐，状态徽章紧跟标题
- 修复顶部「上次更新」文字被截断

**English**
- Heading levels aligned with the official settings page: page title 20px, group titles 15px bold
- Every field control is right-aligned; status badges sit right after the title
- Fixed the truncated “Last updated” text at the top

## 2.8.5
- 去掉顶部重复的「手动刷新」标题，按钮本身即入口，结果提示贴在按钮右侧

**English**
- Removed the duplicated “Refresh now” heading; the button is the entry point and its result message sits to its right

## 2.8.4
- 两把 Key 的「保存 / 清空」与输入框固定在同一行，窄面板下也不换行
- 压缩设置页顶部说明与用量卡片说明

**English**
- The Save / Clear buttons stay on the same line as each key input, even in a narrow panel
- Condensed the settings page header and the usage card copy

## 2.8.3
- 设置页控件按宿主组件样式重做（字段、输入框、按钮、徽章）
- 行内提示改放标题行槽位：出现与消失不再顶动排版，并停留 3 秒后自动消失

**English**
- Settings controls rebuilt on the host component styles (fields, inputs, buttons, badges)
- Inline messages moved into the title-row slot: they no longer push the layout around and fade after 3 seconds

## 2.8.2
- 开关改为照搬宿主组件实现（36×20 圆角轨道 + 圆形手柄），修复深色主题下手柄不可见
- 控件补齐悬停、按下与键盘焦点态，颜色统一走主题令牌

**English**
- The switch now mirrors the host component (36×20 rounded track with a round handle), fixing the invisible handle in dark themes
- Controls gained hover, pressed and keyboard-focus states, all coloured from theme tokens

## 2.8.1
- 修复刷新结束时「封环」最后一帧未闭合的问题

**English**
- Fixed the closing ring failing to seal on its final frame

## 2.8.0
- 浮窗加高：胶囊 26 → 30px，圆环 18 → 24px，环心数字 8 → 9.5px
- 圆环外侧短标签由 5h / 周 / 月 改为 H / W / M
- 修复刷新后半段出现长线、绿色底色重复两次
- 设置页重做观感，结果提示就地显示在对应操作行

**English**
- Taller pill: capsule 26 → 30px, rings 18 → 24px, in-ring numbers 8 → 9.5px
- Short labels outside the rings changed from 5h / 周 / 月 to H / W / M
- Fixed a long line appearing late in the refresh animation and the green backdrop flashing twice
- Settings page restyled, with result messages shown inline on the row that triggered them

## 2.7.0
- 更新动效由渐变光带改为 SVG 描边光轨：等弧长匀速，线宽 2 → 1.15px
- 完成 / 失败时在光带当前位置收束成整圈「封环」
- 新增 `prefers-reduced-motion` 降级

**English**
- The refresh animation moved from a gradient sweep to an SVG stroke rail: constant arc-length speed, stroke width 2 → 1.15px
- On success or failure the light seals into a full ring from its current position
- Added a `prefers-reduced-motion` fallback

## 2.6.1
- 光带宽度 3 → 2px（外沿位置不变）

**English**
- Light band width 3 → 2px (outer edge unchanged)

## 2.6.0
- 边框光芒加厚至 3px，更新中改为双彗尾并增加外发光呼吸
- 完成 / 失败时增加一次爆闪

**English**
- Border glow thickened to 3px, with twin comet tails and a breathing outer glow while refreshing
- Added a single bloom flash on success or failure

## 2.5.0
- 自动刷新也会亮起与手动点击一致的边框流光，25 秒兜底收回
- 修复自动刷新流光期间浮窗点击无响应

**English**
- Automatic refreshes light up the same border flow as a manual click, with a 25-second safety timeout
- Fixed the pill ignoring clicks while the automatic-refresh flow was running

## 2.4.1
- 圆环配色重做：< 80% 绿、≥ 80% 琥珀、≥ 95% 红；未用底盘为同色 32% 透明

**English**
- Ring colours reworked: green below 80%, amber from 80%, red from 95%; the unused track is the same colour at 32% opacity

## 2.4.0
- 三组迷你进度条改为迷你圆环（SVG），已用百分比收进环心
- 胶囊宽度减少约 75px

**English**
- The three mini bars became mini SVG rings, with the used percentage moved into each ring centre
- Capsule width dropped by about 75px

## 2.3.2
- 设置页的刷新按钮与结果消息移到标题下方；失败消息改为红色

**English**
- The settings refresh button and its result message moved below the title; failures are shown in red

## 2.3.1
- 仅两把 API Key 使用上下布局，其余字段恢复左右布局

**English**
- Only the two API key fields stack vertically; every other field is back to a left/right layout

## 2.3.0
- 设置页改版：去掉余额卡片，余额错误改为显示在 DeepSeek Key 行下方
- 修复 Key 提示出现重复括号，只保留掩码

**English**
- Settings page reworked: the balance card is gone and balance errors now appear under the DeepSeek key row
- Fixed duplicated parentheses in the key hint, leaving only the mask

## 2.2.2
- 源码与打包产物迁至统一目录（无行为变更）

**English**
- Source and packaged artefacts moved into one directory (no behaviour change)

## 2.2.1
- 网络错误信息带上真实内因，两个请求补上 `User-Agent`
- 单请求超时 15 → 20 秒，失败重试改为 3/8/20/40 秒
- 余额只在自身出错时转为告警色，用量失败不再影响余额显示

**English**
- Network errors now carry their real cause, and both requests send a `User-Agent`
- Per-request timeout 15 → 20s; retries now back off at 3/8/20/40s
- The balance only turns amber when the balance itself fails; a usage failure no longer affects it

## 2.2.0
- 更新反馈改为边框光芒效果

**English**
- Refresh feedback became a border-glow effect

## 2.1.1
- 收紧字号与间距，胶囊高度恢复 24px

**English**
- Tightened the type scale and spacing; capsule height back to 24px

## 2.1.0
- 浮窗回归单行胶囊：点击不再展开卡片，改为在左侧滑出刷新状态提示（3 秒收回）

**English**
- The pill is a single line again: clicking no longer expands a card, and the refresh status slides out on the left for 3 seconds

## 2.0.0
- 融合版：同一个浮窗同时显示 DeepSeek 官方余额与 OpenCode Go 三个窗口的用量
- 新增「OCG 余量查询」设置页（刷新、用量详情、自动刷新、浮窗开关、位置重置、双 Key 覆盖）

**English**
- Merged release: one pill showing both the DeepSeek balance and the OpenCode Go usage across three windows
- Added the “OCG 余量查询” settings page (refresh, usage details, auto-refresh, pill toggle, position reset, both key overrides)

## 1.0.1
- 清单补 `dsh.client.inject`；安装方式改为分发 tarball

**English**
- Added `dsh.client.inject` to the manifest; distribution switched to a tarball

## 1.0.0
- 首个版本：`shell.overlay` 迷你进度浮窗 + 点击刷新 + 锚线吸附

**English**
- First release: a mini progress pill in `shell.overlay`, click to refresh, anchor-line snapping
