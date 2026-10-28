## 3.1.2

### 改进
- 更新内置兜底数据：模型表按 10 月 28 日官方文档重新抓取（30 个官方模型，配额同步刷新）；汇率快照更新到 28 Oct 2026（1 USD = 6.681042 CNY）；

*插件行为无变化，无任何功能改动。*

---

### Improvements
- Refreshed the bundled fallback data: the model table was re-fetched from the official docs on 28 Oct 2026 (30 official models, quotas included); the exchange-rate snapshot is updated to 28 Oct 2026 (1 USD = 6.681042 CNY);

*No behavioural change — no functional change.*

## 3.1.1

### 修复
- 修复在无法解析宿主包 @deepseek-ai/schemastery 的环境（如隔离沙箱、纯 CLI profile）中插件加载失败、导致整棵插件树无法加载的问题：改为 createRequire → ESM 动态 import 两段式解析，两段均失败时导出 Config = undefined 并让插件照常运行；桌面端仍走原有解析路径，行为不变；
- 侧栏整页与宿主官方页面保持同一版式，切换三个标签时宽度不再跳变。

---

### Fixes
- Fixed the plugin failing to load in environments where the host package @deepseek-ai/schemastery cannot be resolved (isolated sandboxes, plain CLI profiles), which took the whole plugin tree down: the schema factory is now resolved in two stages (createRequire → dynamic ESM import), and when both fail Config is exported as undefined while the plugin keeps running; the desktop path is unchanged;
- The sidebar page now follows the host’s official page layout, and its width no longer jumps when switching between the three tabs.

## 3.1.0

### 新功能
- 悬停浮层优化：鼠标从浮窗移到浮层上时浮层不再消失、点击行为与浮窗点击效果相同（手动刷新）、刷新闪烁效果与浮窗相同；
- 侧栏入口：设置页新增「侧栏入口」开关（默认关闭）。开启后侧栏出现本插件菜单入口，点击直接打开本插件设置页面。

### 修复
- 修复松开鼠标后浮窗自行漂移、部分位置无法固定于目标点的问题：落点改为仅按窗口边沿记录位置，并保留窗口缩放时的相对位置；位置精度提高到 0.1px，旧配置中的位置仍照常渲染；
- 修复浮层面板被窗口裁切的问题：浮窗贴近窗口边缘时，浮层自动判断展开方向，向软件内部展开，避免显示不全。

---

### New features
- The hover popover is now interactive: moving the pointer from the pill onto the popover keeps it open, clicking it behaves like clicking the pill (a manual refresh), and its border flashes together with the pill on refresh;
- Sidebar entry: a new “Sidebar entry” switch in the settings page (off by default). When enabled the plugin gets a row in the sidebar that opens its settings page directly.

### Fixes
- Fixed the pill drifting after release and being unable to stay at some positions: the drop position is now recorded against the window edges only (relative positions still hold when the window resizes), with 0.1px precision; positions from older configs keep rendering as before;
- Fixed the hover popover being clipped: near a window edge the popover now picks its opening direction and expands inwards so it stays fully visible.

## 3.0.5

### 改进
- 更新内置兜底数据：模型表 29 → 30 个（新增 Kimi K3.1 Pro；替换 Gemini 4 Argon Contributor、MiniMax M3.1 Flash Free 为 Gemini 4 Argon、MiniMax M3.1 Flash 并带配额）；汇率快照更新到 24 Oct 2026；

*插件行为无变化，无任何功能改动。*

---

### Improvements
- Refreshed the bundled fallback data: the model table grew from 29 to 30 (adds Kimi K3.1 Pro; replaces Gemini 4 Argon Contributor and MiniMax M3.1 Flash Free with Gemini 4 Argon and MiniMax M3.1 Flash, now with quotas); the exchange-rate snapshot is updated to 24 Oct 2026;

*No behavioural change — no functional change.*

## 3.0.4

### 改进
- 把「安全与隐私」小节同步进 npm 包（README 中英两版，内容与仓库一致）；
- 截图更新为当前版本；

*插件行为无任何改动。*

---

### Improvements
- Synced the “Security & privacy” section into the npm package (both READMEs, identical to the repository);
- Screenshots updated to the current version;

*No functional change.*

## 3.0.3

### 改进
- npm 侧重新发布（内容与 3.0.2 一致，另含 README 中 npm 安装命令的补全）；

*插件行为无任何改动。*

---

### Improvements
- Republished the npm package (same content as 3.0.2, plus the completed npm install command in the README);

*No functional change.*

## 3.0.2

### 改进
- 把文档与截图同步进 npm 包（README 补上 npm 安装方式与徽章；截图中的版本号更新为当前版本）；

*插件行为与 3.0.1 一致，无功能改动。*

---

### Improvements
- Synced the docs and screenshots into the npm package (npm install hint and badge in the README;
  the version shown in the screenshots updated to the current release);

*Behaviour is identical to 3.0.1 — no functional change.*

## 3.0.1

### 改进
- 包名改为 `@verneuil/dsh-opencode-go-usage`，以便发布到 npm（GitHub 直装方式完全不变）；

*插件行为与 3.0.0 一致，无功能改动。*

---

### Improvements
- Renamed the package to `@verneuil/dsh-opencode-go-usage` so it can be published to npm (the GitHub install path is unchanged);

*Behaviour is identical to 3.0.0 — no functional change.*

## 3.0.0

### 新功能
- 新增 OpenCode Go 模型配额金额显示。提供「配额参考模型选择」，按 OpenCode Go 各模型的月度配额折算该模型的已消耗与剩余金额，可选全部官方模型（默认 DeepSeek V4.1 Flash），模型清单随官方文档定时抓取更新，也可以手动刷新，获取失败时回退内置列表和配额数据；
- 新增「金额显示计价币种」切换。所有金额（DS 余额与 OCG 配额）可切换 人民币 / 美元 / 自动（中文界面人民币、英文界面美元）。汇率自动获取，获取失败时回退内置汇率；
- 「浮窗」可自主选择显示 DS 官方余额或 OCG 配额。具体功能菜单细化：「在浮窗左侧显示余额」总开关、「浮窗左侧余额数据」（DS 余额 / OCG 配额剩余二选一）、「鼠标悬停浮层余额数据」下拉多选（支持同时或单独显示 DS、OCG 的数据或都不显示）；

### 改进
- 数据获取失败时有更明确的提示信息，明确提示是 OCG 用量、DeepSeek 官方余额、汇率还是模型列表及配额获取出错；
- 悬停浮层动效优化，文本显示效果精简与修正；
- 设置菜单的文本描述、图标、按钮和控件优化了使用体验；
- 数据刷新说明：模型表 24 小时、汇率 1 小时自动刷新并复用缓存；手动刷新（菜单按钮 / 点击浮窗）均触发强制重抓，设置菜单小字如实显示各自的更新时刻与刷新结果。

---

### New features
- Added OpenCode Go model quota amounts: a “quota reference model” selector converts each OpenCode Go model’s monthly quota into that model’s used and remaining amounts; every official model is available (DeepSeek V4.1 Flash by default), the list is refreshed from the official docs on a schedule or by manual refresh, and a failed fetch falls back to the bundled list and quota data;
- Added an “amount display currency” switch: every amount (the DS balance and the OCG quota) can be shown in CNY / USD / auto (CNY in Chinese, USD in English). The rate is fetched automatically and falls back to the bundled rate on failure;
- The pill can now show either the DS balance or the OCG quota by choice, with a finer set of settings rows: a “show a balance on the pill’s left” master switch, “pill left-side balance data” (DS balance / OCG quota left, pick one) and a “hover popover balance data” checkbox dropdown (show the DS and OCG data together, separately, or neither);

### Improvements
- Fetch failures are reported more explicitly, stating whether OCG usage, the DeepSeek balance, the exchange rate or the model list & quota failed;
- The hover popover’s animation was improved and its text display was tightened and corrected;
- The settings page’s wording, icons, buttons and controls were refined for a better experience;
- Refresh behaviour: the model table and the exchange rate refresh automatically on a 24 h and 1 h cycle, reusing the cache; manual refresh (the settings button or a pill click) always forces a refetch, and the settings footnotes report each one’s own update time and result.

## 2.16.0

### 新功能
- 设置页新增一键跳转 OpenCode 官方控制台的图标按钮。

### 改进
- 设置页 UI 更新；
- 悬停浮层 UI 更新优化；
- 优化若干文案说明的准确性；
- 针对部分插件安装环境做定向优化，提升插件稳定性。

---

### New features
- Added an icon button in settings that jumps straight to the OpenCode console.

### Improvements
- Settings page UI updated;
- The pill’s hover popover got a UI refresh;
- Improved the accuracy of several strings;
- Targeted optimisations for some plugin install environments, improving stability.

## 2.15.4

### 改进
- 优化部分中英文描述文案的准确性；
- 插件图标换新、设置导航的菜单图标换新；
- 悬停浮层样式换新。

### 修复
- 修复切到英文界面后插件文案仍显示中文的问题。

---

### Improvements
- Improved the accuracy of several Chinese and English strings;
- New plugin icon and a new settings-navigation glyph;
- New hover-popover styling.

### Fixes
- Fixed the plugin copy staying Chinese after switching the UI to English.

## 2.15.3

### 改进
- 提交插件市场并增加若干合规性声明；

### 修复
- 修正若干文本描述。

*无任何功能性更新。*

---

### Improvements
- Submitted to the plugin market and added some compliance declarations;

### Fixes
- Fixed a few text descriptions.

*No functional changes.*

## 2.15.2

### 修复
- 把 @deepseek-ai/schemastery 声明为 peerDependencies（并标记 optional：由宿主运行时提供，不会多装副本）。

---

### Fixes
- Declared @deepseek-ai/schemastery as a peerDependencies entry (marked optional: the host runtime provides it, so no second copy is installed).

## 2.15.1

### 修复
- 补齐 package.json 的 main 字段；
- 描述里的「边框光轨」改为现行的边框闪烁（行为无变化）。

---

### Fixes
- Added the missing main field to package.json;
- Corrected the description from the retired light rail to the current border flash (no behaviour change).

## 2.15.0

### 新功能
- 新增「恢复默认设置」：一键写回已使用 / 5 分钟 / 极简模式 / 不显示余额 / 默认位置。

### 改进
- 默认位置改为窗口左上角；「重置到右下角」更名为「重置位置」；
- 新装默认即这套组合；三处开关切换加入过渡动效。

---

### New features
- Added “Restore defaults”: one click writes back Used / 5 min / Minimal mode / balance hidden / default position.

### Improvements
- Default position is now the window’s top-left corner; “Reset to bottom-right” became “Reset position”;
- A fresh install starts from that same combination; the three toggles now animate instead of cutting.

## 2.14.0

### 新功能
- 新增极简模式：三环嵌套 + 环旁取整余额；悬停浮层加重置倒计时。

### 改进
- 更新反馈改为边框闪烁：更新中呼吸闪、成功长亮、失败闪三下红；
- 浮窗收紧：三环更粗、环心数字更小、胶囊更矮。

---

### New features
- Added Minimal mode: nested rings with the rounded balance beside them; the hover popover gained reset countdowns.

### Improvements
- Refresh feedback became a border flash: a breathing border while loading, a solid green hold on success, three red blinks on failure;
- The pill got tighter: thicker rings, smaller in-ring numbers, a shorter capsule.

## 2.13.0

### 新功能
- 浮窗悬停显示临时浮层：余额 + 三条进度条，贴底时向上展开

### 改进
- 浮窗整体再窄约 14px

---

### New features
- Hovering the pill shows a temporary popover: balance plus three progress bars, flipping upwards near the bottom edge

### Improvements
- The pill became about 14px narrower

## 2.12.0

### 新功能
- 新增进度口径二选一：已使用 / 剩余，浮窗与设置页同时跟随。

### 改进
- 配色阈值随口径自动切换。

---

### New features
- Added a choice of progress basis: Used or Left, followed by both the pill and the settings page.

### Improvements
- Colour thresholds switch automatically with the basis.

## 2.11.0

### 改进
- 用量口径改为「剩余」：三环弧长与数字、设置页进度条同步；
- 配色阈值反转：剩余 ≤20% 转橙、≤5% 转红。

---

### Improvements
- Usage basis switched to “Left”: ring arcs, in-ring numbers and the settings-page bars all follow;
- Colour thresholds inverted: amber at ≤20% left, red at ≤5% left.

## 2.10.0

### 新功能
- 界面支持中英双语：浮窗与设置页的全部文案接入客户端 locale 字典（ctx.locale.register + 框架注入的 t 席位），随 DSH 语言设置切换；设置页菜单名与各操作提示同步切换。

### 改进
- 提示的红/绿语气改由调用方显式指定（原来按中文关键词判断，英文提示会被误判为「成功」）；
- 已知限制：接口层返回的错误详情（未配置 Key、401/403、返回结构异常等）仍为中文。

---

### New features
- Bilingual UI: every string in the pill and the settings page goes through the client locale dictionaries (ctx.locale.register plus the framework-injected t seat) and follows the DSH language setting, including the settings menu entry and all inline messages.

### Improvements
- Message tone (success/error) is now passed explicitly by the caller instead of being guessed from Chinese keywords, which mislabelled English errors as successes;
- Known limitation: error details raised by the API layer (missing key, 401/403, unexpected payloads) are still Chinese.

## 2.9.6

### 改进
- 客户端装配改为官方模板写法：插件对象显式声明 inject 与 slots，席位注册统一走 ctx.slots.inject()（对外行为不变）；
- 新增英文版 README（README.en.md），中英互链。

---

### Improvements
- Client wiring now follows the official template: the plugin declares its slots injection and every seat is registered through ctx.slots.inject() (no visible change);
- Added an English README (README.en.md), cross-linked with the Chinese one.

## 2.9.5

### 改进
- 悬浮窗的余额开关文案改为「显示 DS 官方余额」，鼠标提示与无障碍标签同步更新。

---

### Improvements
- The pill’s balance toggle is now labelled “显示 DS 官方余额”, with matching tooltip and accessible label.

## 2.9.4

### 改进
- 浮窗四边内边距改为一致（4px），圆环到边框的留白处处相等
- 胶囊尺寸 139.2×30 → 131.2×30px（不显示余额时 84px）
- 移除设置页顶部多余的「（浮窗上三颗圆环依次对应）」

---

### Improvements
- Even padding on all four sides of the pill (4px), so the rings keep equal clearance from the border
- Capsule 139.2×30 → 131.2×30px (84px with the balance hidden)
- Removed the redundant “(the three rings map in order)” line from the settings page header

## 2.9.3

### 改进
- 收紧浮窗内边距（5px 10px → 4px 8px），胶囊 143.2×32 → 139.2×30px

---

### Improvements
- Tightened the pill padding (5px 10px → 4px 8px); capsule 143.2×32 → 139.2×30px

## 2.9.2

### 改进
- 去掉圆环外侧的 H / W / M 字母标签，已用百分比继续显示在环心
- 胶囊宽度 183.2 → 143.2px（不显示余额时 96px）

---

### Improvements
- Removed the H / W / M labels outside the rings; the used percentage stays in the ring centre
- Capsule width 183.2 → 143.2px (96px with the balance hidden)

## 2.9.1

### 改进
- 代码整理：移除无用标识符与冗余注释，补齐包元数据（无行为变更）

---

### Improvements
- Code tidy-up: dropped unused identifiers and redundant comments, completed the package metadata (no behaviour change)

## 2.9.0

### 新功能
- 新增「显示余额」开关（配置字段 `showBalance`，默认开启），关闭后浮窗只留三颗圆环并自动变窄

### 改进
- 「手动刷新」按钮移到「OpenCode Go 用量详情」标题行右侧
- 悬浮窗行的控件顺序统一为：是否显示余额 → 重置位置 → 总开关

---

### New features
- Added a “Show balance” toggle (`showBalance`, on by default); turning it off leaves only the three rings and narrows the pill

### Improvements
- The “Refresh now” button moved to the right of the “OpenCode Go usage” title row
- The pill row's controls are ordered: show balance → reset position → master switch

## 2.8.9

### 改进
- 「悬浮窗」与「浮窗位置」合并为一行，开关与「重置到右下角」并排
- 行内提示文案压短，减少省略号截断

---

### Improvements
- Merged the “Floating pill” and “Pill position” rows into one, with the switch beside “Reset to bottom-right”
- Shortened the inline hints so fewer of them get truncated

## 2.8.8

### 改进
- 三个用量行的重置倒计时并入标题行、位于百分比左侧，每行高度 50 → 32.4px
- 百分比改为定宽右对齐，三行数字成列

---

### Improvements
- Each usage row's reset countdown moved into the title row, left of the percentage; row height 50 → 32.4px
- Percentages are right-aligned in a fixed-width column, so the three rows line up

## 2.8.7

### 改进
- 两把 API Key 改为通栏布局：输入框左到头、右到按钮
- 输入框高度 34 → 28px，与按钮等高
- 结果提示移到标题行，出现与消失不再改变行高

---

### Improvements
- Both API key fields became full-width rows: the input spans from the left edge to the buttons
- Input height 34 → 28px, matching the buttons
- Result messages moved to the title row, so appearing and disappearing no longer shifts the layout

## 2.8.6

### 改进
- 标题层级对齐官方设置页：页面标题 20px、分组标题 15px 并加粗
- 所有字段控件贴右对齐，状态徽章紧跟标题

### 修复
- 修复顶部「上次更新」文字被截断

---

### Improvements
- Heading levels aligned with the official settings page: page title 20px, group titles 15px bold
- Every field control is right-aligned; status badges sit right after the title

### Fixes
- Fixed the truncated “Last updated” text at the top

## 2.8.5

### 改进
- 去掉顶部重复的「手动刷新」标题，按钮本身即入口，结果提示贴在按钮右侧

---

### Improvements
- Removed the duplicated “Refresh now” heading; the button is the entry point and its result message sits to its right

## 2.8.4

### 改进
- 两把 Key 的「保存 / 清空」与输入框固定在同一行，窄面板下也不换行
- 压缩设置页顶部说明与用量卡片说明

---

### Improvements
- The Save / Clear buttons stay on the same line as each key input, even in a narrow panel
- Condensed the settings page header and the usage card copy

## 2.8.3

### 改进
- 设置页控件按宿主组件样式重做（字段、输入框、按钮、徽章）
- 行内提示改放标题行槽位：出现与消失不再顶动排版，并停留 3 秒后自动消失

---

### Improvements
- Settings controls rebuilt on the host component styles (fields, inputs, buttons, badges)
- Inline messages moved into the title-row slot: they no longer push the layout around and fade after 3 seconds

## 2.8.2

### 改进
- 控件补齐悬停、按下与键盘焦点态，颜色统一走主题令牌

### 修复
- 开关改为照搬宿主组件实现（36×20 圆角轨道 + 圆形手柄），修复深色主题下手柄不可见

---

### Improvements
- Controls gained hover, pressed and keyboard-focus states, all coloured from theme tokens

### Fixes
- The switch now mirrors the host component (36×20 rounded track with a round handle), fixing the invisible handle in dark themes

## 2.8.1

### 修复
- 修复刷新结束时「封环」最后一帧未闭合的问题

---

### Fixes
- Fixed the closing ring failing to seal on its final frame

## 2.8.0

### 改进
- 浮窗加高：胶囊 26 → 30px，圆环 18 → 24px，环心数字 8 → 9.5px
- 圆环外侧短标签由 5h / 周 / 月 改为 H / W / M
- 设置页重做观感，结果提示就地显示在对应操作行

### 修复
- 修复刷新后半段出现长线、绿色底色重复两次

---

### Improvements
- Taller pill: capsule 26 → 30px, rings 18 → 24px, in-ring numbers 8 → 9.5px
- Short labels outside the rings changed from 5h / 周 / 月 to H / W / M
- Settings page restyled, with result messages shown inline on the row that triggered them

### Fixes
- Fixed a long line appearing late in the refresh animation and the green backdrop flashing twice

## 2.7.0

### 新功能
- 新增 `prefers-reduced-motion` 降级

### 改进
- 更新动效由渐变光带改为 SVG 描边光轨：等弧长匀速，线宽 2 → 1.15px
- 完成 / 失败时在光带当前位置收束成整圈「封环」

---

### New features
- Added a `prefers-reduced-motion` fallback

### Improvements
- The refresh animation moved from a gradient sweep to an SVG stroke rail: constant arc-length speed, stroke width 2 → 1.15px
- On success or failure the light seals into a full ring from its current position

## 2.6.1

### 改进
- 光带宽度 3 → 2px（外沿位置不变）

---

### Improvements
- Light band width 3 → 2px (outer edge unchanged)

## 2.6.0

### 改进
- 边框光芒加厚至 3px，更新中改为双彗尾并增加外发光呼吸
- 完成 / 失败时增加一次爆闪

---

### Improvements
- Border glow thickened to 3px, with twin comet tails and a breathing outer glow while refreshing
- Added a single bloom flash on success or failure

## 2.5.0

### 改进
- 自动刷新也会亮起与手动点击一致的边框流光，25 秒兜底收回

### 修复
- 修复自动刷新流光期间浮窗点击无响应

---

### Improvements
- Automatic refreshes light up the same border flow as a manual click, with a 25-second safety timeout

### Fixes
- Fixed the pill ignoring clicks while the automatic-refresh flow was running

## 2.4.1

### 改进
- 圆环配色重做：< 80% 绿、≥ 80% 琥珀、≥ 95% 红；未用底盘为同色 32% 透明

---

### Improvements
- Ring colours reworked: green below 80%, amber from 80%, red from 95%; the unused track is the same colour at 32% opacity

## 2.4.0

### 改进
- 三组迷你进度条改为迷你圆环（SVG），已用百分比收进环心
- 胶囊宽度减少约 75px

---

### Improvements
- The three mini bars became mini SVG rings, with the used percentage moved into each ring centre
- Capsule width dropped by about 75px

## 2.3.2

### 改进
- 设置页的刷新按钮与结果消息移到标题下方；失败消息改为红色

---

### Improvements
- The settings refresh button and its result message moved below the title; failures are shown in red

## 2.3.1

### 改进
- 仅两把 API Key 使用上下布局，其余字段恢复左右布局

---

### Improvements
- Only the two API key fields stack vertically; every other field is back to a left/right layout

## 2.3.0

### 改进
- 设置页改版：去掉余额卡片，余额错误改为显示在 DeepSeek Key 行下方

### 修复
- 修复 Key 提示出现重复括号，只保留掩码

---

### Improvements
- Settings page reworked: the balance card is gone and balance errors now appear under the DeepSeek key row

### Fixes
- Fixed duplicated parentheses in the key hint, leaving only the mask

## 2.2.2

### 改进
- 源码与打包产物迁至统一目录（无行为变更）

---

### Improvements
- Source and packaged artefacts moved into one directory (no behaviour change)

## 2.2.1

### 改进
- 单请求超时 15 → 20 秒，失败重试改为 3/8/20/40 秒
- 余额只在自身出错时转为告警色，用量失败不再影响余额显示

### 修复
- 网络错误信息带上真实内因，两个请求补上 `User-Agent`

---

### Improvements
- Per-request timeout 15 → 20s; retries now back off at 3/8/20/40s
- The balance only turns amber when the balance itself fails; a usage failure no longer affects it

### Fixes
- Network errors now carry their real cause, and both requests send a `User-Agent`

## 2.2.0

### 改进
- 更新反馈改为边框光芒效果

---

### Improvements
- Refresh feedback became a border-glow effect

## 2.1.1

### 改进
- 收紧字号与间距，胶囊高度恢复 24px

---

### Improvements
- Tightened the type scale and spacing; capsule height back to 24px

## 2.1.0

### 改进
- 浮窗回归单行胶囊：点击不再展开卡片，改为在左侧滑出刷新状态提示（3 秒收回）

---

### Improvements
- The pill is a single line again: clicking no longer expands a card, and the refresh status slides out on the left for 3 seconds

## 2.0.0

### 新功能
- 融合版：同一个浮窗同时显示 DeepSeek 官方余额与 OpenCode Go 三个窗口的用量
- 新增「OCG 余量查询」设置页（刷新、用量详情、自动刷新、浮窗开关、位置重置、双 Key 覆盖）

---

### New features
- Merged release: one pill showing both the DeepSeek balance and the OpenCode Go usage across three windows
- Added the “OCG 余量查询” settings page (refresh, usage details, auto-refresh, pill toggle, position reset, both key overrides)

## 1.0.1

### 改进
- 清单补 `dsh.client.inject`；安装方式改为分发 tarball

---

### Improvements
- Added `dsh.client.inject` to the manifest; distribution switched to a tarball

## 1.0.0

### 新功能
- 首个版本：`shell.overlay` 迷你进度浮窗 + 点击刷新 + 锚线吸附

---

### New features
- First release: a mini progress pill in `shell.overlay`, click to refresh, anchor-line snapping
