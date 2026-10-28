window.__ModuleLoader__.load({ id: '@verneuil/dsh-opencode-go-usage', factory: (require) => {
  var module = { exports: {} };
  var exports = module.exports;
  var React = require('react');

  // 配置表单的 ns = 本插件 patch 行的 id（宿主侧 settings.describe() 按 entry id 投影）
  var NS = 'opencode-go-usage';
  // 读取时按 schema 认出本插件，仅在 id 被改名时兜底（写入仍用实际识别到的 ns）
  var nsRef = NS;

  // 悬浮窗（挂在 shell.overlay：官方「Frame-wide floating layer」，replaceRisk none）。
  // 视觉：主题实色底 + 1px 细边框，只用 --dsw-alias-* 主题令牌；胶囊本体无阴影无模糊
  // （只有刷新反馈的边框光芒带外发光，那层不参与布局）。
  // 形态：常态 = 单行迷你胶囊（DeepSeek 余额 + OCG 三组「标签 + 圆环 + 环心百分比」）；
  // 点击 / 自动刷新 = 同一套反馈：**边框光芒**（更新中 2px 双彗尾光带流转 → 完成整圈爆闪 → 3 秒淡出），
  // 浮窗长宽恒定不变。完整明细在设置页。

  // 设置导航图标用的 CSS mask（16×16 单色：量程环 + 中心点）——官方导航图标是单色随主题着色，
  // 所以这里画成纯黑 mask，可见颜色由 currentColor 给。
  var NAV_MASK = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
    '<path d="M8 2.4a5.6 5.6 0 1 1-3.96 1.64" fill="none" stroke="#000" stroke-width="1.7" stroke-linecap="round"/>' +
    '<circle cx="8" cy="8" r="1.8" fill="#000"/></svg>');

  var CSS =
    // 胶囊高度 26px → 30px（行高 16 → 18、上下内边距 4 → 5）：环盒 16 → 20、视觉环 18 → 24，
    // 两位数百分比在环心不拥挤；长宽恒定，任何状态下都不变。
    // 四边净空一致：环视觉 24px（环盒 20px，四向各溢出 2px），padding 4px ⇒ 环到边框处处 2px。
    // border-radius:999px 不是随手写的：胶囊端头是半径 15px 的圆弧，圆心与圆环同心
    // （内缘半径 14px vs 环外缘 12px），所以圆角与圆环弧度平行、整圈间隙均匀 —— 换小圆角反而会啃掉环的净空
    '.ocgu-float{position:fixed;right:24px;bottom:24px;pointer-events:auto;display:inline-flex;align-items:center;gap:0;padding:3px;border-radius:999px;font-size:10.5px;line-height:16px;color:var(--dsw-alias-label-primary);user-select:none;-webkit-user-select:none;touch-action:none;cursor:pointer;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);transition:border-color .2s ease}' +
    // 悬停提亮不用 --dsw-alias-border-l3（同样不在官方令牌表里），由 border-l2 掺二级文字色派生
    '.ocgu-float:hover{border-color:color-mix(in srgb,var(--dsw-alias-border-l2) 40%,var(--dsw-alias-label-secondary))}' +
    '.ocgu-float[data-dragging="true"]{cursor:grabbing;border-color:var(--dsw-alias-brand-primary)}' +
    '.ocgu-float[data-warn="true"]{border-color:var(--dsw-alias-state-warn-primary)}' +
    // ---------- 更新反馈：细光轨已移除 ----------
    // 早先是「SVG 描边光带沿胶囊周长跑」的跑马灯（含彗尾分层、封环、冻结相位等一整套几何与动画）。
    // 但胶囊是「圆角 + 1px 边框」，描边路径与真实边框在圆角处必然有偏差，很难处处对齐；
    // 现改为直接闪边框本身（见下方 .ocgu-float[data-state] 的动画），路径即边框，零对齐问题。
    '.ocgu-glow{--ocgu-glow:var(--dsw-alias-state-success-primary);position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;background-color:transparent;transition:opacity .38s ease}' +
    // 结果相位：内壁极轻染色（边框本身的闪烁由 .ocgu-float[data-state] 的动画负责）
    '.ocgu-glow[data-phase="ok"]{opacity:1;background-color:color-mix(in srgb,var(--ocgu-glow) 6%,transparent)}' +
    '.ocgu-glow[data-phase="error"]{--ocgu-glow:var(--dsw-alias-state-error-primary);opacity:1;background-color:color-mix(in srgb,var(--ocgu-glow) 6%,transparent)}' +
    // ---------- 更新反馈：直接闪浮窗自己的边框 ----------
    // 早先的「跑马灯光点」是沿 SVG 描边路径跑的光带，但胶囊是「圆角 + 1px 边框」，
    // 描边路径与真实边框很难处处对齐（圆角处的偏差尤其明显）。改成直接闪边框：路径就是边框本身，零对齐问题。
    '.ocgu-float[data-state="loading"]{animation:ocgu-blink 1s ease-in-out infinite}' +
    '.ocgu-float[data-state="ok"]{animation:ocgu-flash-ok 2.8s ease-out 1}' +
    '.ocgu-float[data-state="error"]{animation:ocgu-flash-err .5s ease-out 3}' +
    '@keyframes ocgu-blink{0%,100%{border-color:var(--dsw-alias-border-l2)}50%{border-color:var(--dsw-alias-state-success-primary)}}' +
    '@keyframes ocgu-flash-ok{0%{border-color:var(--dsw-alias-state-success-primary)}65%{border-color:var(--dsw-alias-state-success-primary)}100%{border-color:var(--dsw-alias-border-l2)}}' +
    '@keyframes ocgu-flash-err{0%,100%{border-color:var(--dsw-alias-border-l2)}50%{border-color:var(--dsw-alias-state-error-primary)}}' +
    // 切换动效：形态切换（极简 ↔ 常规、余额显隐）时内容淡入并轻微放大；数字变化时淡入，避免生硬跳变
    '@keyframes ocgu-swap{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}' +
    '@keyframes ocgu-num{from{opacity:.2;transform:translate(-50%,-50%) scale(.78)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}' +
    '@keyframes ocgu-fade{from{opacity:.25}to{opacity:1}}' +
    // 系统开了「减少动态效果」：不闪，直接给出静态结果色
    '@media (prefers-reduced-motion:reduce){.ocgu-float[data-state="loading"]{animation:none;border-color:var(--dsw-alias-state-success-primary)}.ocgu-float[data-state="ok"]{animation:none;border-color:var(--dsw-alias-state-success-primary)}.ocgu-float[data-state="error"]{animation:none;border-color:var(--dsw-alias-state-error-primary)}}' +
    // 余额：跟胶囊行高对齐（11px / 18px），不参与顶高
    '.ocgu-bal{font-size:10.5px;line-height:16px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:.2px;white-space:nowrap;margin-right:3px;animation:ocgu-swap .3s cubic-bezier(.22,.9,.28,1)}' +
    // 余额只在「余额自己」出错时才转黄：用量侧的失败不该把健康的余额也染黄（两路互相独立）
    '.ocgu-bal[data-balwarn="true"]{color:var(--dsw-alias-state-warn-primary)}' +
    '.ocgu-sep{flex:none;width:1px;height:13px;background:var(--dsw-alias-border-l2);margin-right:3px}' +
    // 悬停临时浮层：余额 + 三条进度（窗口名与重置倒计时同一行、左名右时）；百分比做成贴在进度位置的圆形数字钮
    '.ocgu-tip{position:absolute;left:0;z-index:6;pointer-events:auto;display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:14px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);font-size:11.5px;line-height:1.3;white-space:nowrap;width:232px;animation:ocgu-tip-in .12s ease-out}' +
    '.ocgu-tip[data-pos="down"]{top:calc(100% + 8px)}' +
    '.ocgu-tip[data-pos="up"]{bottom:calc(100% + 8px)}' +
    // 水平方向：默认与浮窗左对齐、向右展开；浮窗靠近窗口右缘时改为右对齐、向左展开，
    // 否则 232px 宽的浮层会被视口右缘裁掉（与悬停时的 setTipRight 判定对应）。
    '.ocgu-tip[data-align="right"]{left:auto;right:0}' +
    '@keyframes ocgu-tip-in{from{opacity:0}to{opacity:1}}' +
    '.ocgu-tip[data-state="loading"]{animation:ocgu-tip-in .12s ease-out,ocgu-blink 1s ease-in-out infinite}' +
    '.ocgu-tip[data-state="ok"]{animation:ocgu-tip-in .12s ease-out,ocgu-flash-ok 2.8s ease-out 1}' +
    '.ocgu-tip[data-state="error"]{animation:ocgu-tip-in .12s ease-out,ocgu-flash-err .5s ease-out 3}' +
    // 仅浮层：余额行与「OCG配额剩余」行同款（12px，整行常规字重，金额单独加粗）
    // 标签在左、金额在右（金额右端与下方重置时间、进度条右端严格对齐）
    '.ocgu-tip-bal{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:12px;font-weight:400;font-variant-numeric:tabular-nums}' +
    '.ocgu-tip-lb{font-weight:400}' +
    '.ocgu-tip-amt{font-weight:600}' +
    // 下拉多选（悬停浮层余额数据）：details + summary，原生无状态，点面板外再点一次收起
    '.ocgu-dd{position:relative;display:inline-block;min-width:158px}' +
    '.ocgu-dd>summary{list-style:none;cursor:pointer;box-sizing:border-box;height:26px;line-height:24px;padding:0 24px 0 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.ocgu-dd>summary::-webkit-details-marker{display:none}' +
    '.ocgu-dd>summary::after{content:"";position:absolute;right:9px;top:10px;width:6px;height:6px;border-right:1.5px solid var(--dsw-alias-label-tertiary);border-bottom:1.5px solid var(--dsw-alias-label-tertiary);transform:rotate(45deg)}' +
    '.ocgu-dd[open]>summary{border-color:var(--dsw-alias-state-business-primary)}' +
    '.ocgu-dd-panel{position:absolute;right:0;top:calc(100% + 4px);z-index:30;min-width:100%;padding:4px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-base);box-shadow:0 8px 24px rgba(0,0,0,.16)}' +
    '.ocgu-dd-item{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap}' +
    '.ocgu-dd-item:hover{background:var(--dsw-alias-interactive-bg-hover)}' +
    // 配额四行：标题用深色（primary），其余三行用浅色（secondary）；设置页那版字号更大
    '.ocgu-quota{display:flex;flex-direction:column;gap:1px;font-size:10.5px;font-weight:600;line-height:1.45;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}' +
    '.ocgu-quota-h{color:var(--dsw-alias-label-primary)}' +
    '.ocgu-quota-sub{font-weight:400}' +
    // 设置页配额块：标题用字段标题样式（照搬），下面两行用小字样式并居中（由渲染层加 textAlign）
    '.ocgu-qset{display:flex;flex-direction:column;gap:2px;margin-top:10px}' +
    // 抓取失败点名报错：单行出品，浮层底部与设置页共用
    '.ocgu-errline{display:flex;align-items:baseline;gap:6px;font-size:9.5px;line-height:1.45;color:var(--dsw-alias-state-error-primary)}' +
    '.ocgu-errline svg{flex:none;transform:translateY(1px)}' +
    // 说明：金额显示计价币种 / 浮窗左侧余额数据 两个控件现在直接用标准 .ocgu-seg，
    // 与用量卡片里的「已使用 / 剩余」严格同高（同一套 padding 与字号）。
    // 配额参考模型下拉框
    '.ocgu-select{box-sizing:border-box;height:26px;padding:0 6px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px;cursor:pointer;max-width:260px}' +
    '.ocgu-select:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}' +
    // 余额与下方用量之间的区隔：通栏细线（负边距抵消浮层左右内边距）+ 用量小标题
    '.ocgu-tip-sep{height:1px;margin:0 -14px;background:var(--dsw-alias-border-l2)}' +
    '.ocgu-tip-row{display:flex;flex-direction:column;gap:4px}' +
    // 窗口名与重置时间同一行：名字左对齐、倒计时右对齐；不再占左侧字母列，进度条得以整幅拉长
    '.ocgu-tip-meta{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:10px}' +
    '.ocgu-tip-win{color:var(--dsw-alias-label-secondary)}' +
    // 进度条：240×10，宽度即浮层内容宽（左右留白＝浮层内边距，与边框等距）；数字钮绝对定位不被裁掉
    // 进度条不再定宽：随浮层（= 上半部分最长那行文本 + 左右等宽内边距）自适应；
    // 窗口名与倒计时在同一行 100% 宽里左右对齐，于是与进度条两端严格齐平。
    '.ocgu-tip-line{position:relative;display:flex;align-items:center;width:100%;height:18px}' +
    '.ocgu-tip-track{position:relative;flex:none;width:100%;height:12px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-tertiary) 22%,transparent);overflow:hidden}' +
    '.ocgu-tip-fill{position:absolute;left:0;top:0;bottom:0;overflow:hidden;border-radius:999px;background:var(--dsw-alias-state-success-primary);transition:width .45s cubic-bezier(.22,.9,.28,1)}' +
    '.ocgu-tip-fill[data-level="warn"]{background:var(--dsw-alias-state-warn-primary)}' +
    '.ocgu-tip-fill[data-level="danger"]{background:var(--dsw-alias-state-error-primary)}' +
    '.ocgu-tip-fill[data-level="empty"]{background:var(--dsw-alias-label-tertiary)}' +
    // 流动高光：一点点动效（系统开了「减少动态效果」时自动关闭）
    // 光带宽度按「整条轨道」算（--ocgu-pct 是本条百分比），故三条扫过的距离与速度一致；
    // 早先用 inset:0 时宽度=已填充部分，7% 的短条只扫一小段，看起来像卡住。
    // 光带宽度按「整条轨道」算（--ocgu-pct 是本条百分比），故三条扫过的距离与速度一致；
    // 早先用 inset:0 时宽度=已填充部分，7% 的短条只扫一小段，看起来像卡住。
    '.ocgu-tip-fill::after{content:"";position:absolute;top:0;bottom:0;left:0;width:calc(100% * 100 / var(--ocgu-pct,100));background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--dsw-alias-label-primary-foreground) 40%,transparent),transparent);transform:translateX(-100%);animation:ocgu-shine 2.8s ease-in-out infinite}' +
    '@keyframes ocgu-shine{0%{transform:translateX(-100%)}55%,100%{transform:translateX(220%)}}' +
    // 圆形数字钮：贴住进度当前位置；轻薄质感 —— 半透明底 + 细描边 + 极轻投影，
    // 数字用主题前景色（浅色主题即黑色，深色主题自动变浅），不再随危险等级变色（等级由进度条本身表达）
    '.ocgu-tip-knob{position:absolute;top:50%;transform:translate(-50%,-50%);display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:999px;font-size:8.5px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.2px;color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 86%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 72%,transparent);box-shadow:0 .5px 1.5px color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent);transition:left .45s cubic-bezier(.22,.9,.28,1);animation:ocgu-knob 3.6s ease-in-out infinite}' +
    '@keyframes ocgu-knob{0%,100%{box-shadow:0 .5px 1.5px color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent)}50%{box-shadow:0 1px 3px color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent)}}' +
    '.ocgu-tip-cd{font-size:10px;color:var(--dsw-alias-label-tertiary)}' +
    '@media (prefers-reduced-motion:reduce){.ocgu-tip-fill::after,.ocgu-tip-knob{animation:none}.ocgu-tip[data-state="loading"],.ocgu-tip[data-state="ok"]{animation:none;border-color:var(--dsw-alias-state-success-primary)}.ocgu-tip[data-state="error"]{animation:none;border-color:var(--dsw-alias-state-error-primary)}}' +
    // 极简模式：三环嵌套（外 M / 中 W / 内 R），只比常规三环略大；余额取整后显示在环旁
    '.ocgu-nest{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;animation:ocgu-swap .3s cubic-bezier(.22,.9,.28,1)}' +
    '.ocgu-nest svg{position:absolute;inset:0;width:26px;height:26px;overflow:visible}' +
    '.ocgu-nest-track{fill:none;stroke-width:2.6;stroke:color-mix(in srgb,var(--dsw-alias-label-tertiary) 26%,transparent)}' +
    '.ocgu-nest-arc{fill:none;stroke-width:2.6;stroke-linecap:round;stroke:var(--dsw-alias-state-success-primary);transition:stroke-dashoffset .35s cubic-bezier(.22,.9,.28,1),stroke .2s ease}' +
    '.ocgu-nest-arc[data-level="warn"]{stroke:var(--dsw-alias-state-warn-primary)}' +
    '.ocgu-nest-arc[data-level="danger"]{stroke:var(--dsw-alias-state-error-primary)}' +
    '.ocgu-nest-arc[data-level="empty"]{stroke:var(--dsw-alias-label-tertiary)}' +
    // 设置导航图标：官方 settings.section 契约只投影 id/order/label，第三方分区一律戴默认齿轮；
    // 这里照官方同款做法（dshmarket 与 Claude Style 均如此）：给自己的导航行打标记 →
    // 隐藏行内默认齿轮（它是 <svg>）→ 用 CSS mask 画自己的标记（背景取 currentColor，随主题着色）。
    '[data-ocgu-nav] > svg{display:none}' +
    '[data-ocgu-nav]::before{content:"";flex:none;width:16px;height:16px;background-color:currentColor;-webkit-mask-image:url("' + NAV_MASK + '");mask-image:url("' + NAV_MASK + '");-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:16px 16px;mask-size:16px 16px}' +
    // OCG 三组迷你圆环：环盒 20px（视觉环 24px，上下各溢出 2px，落在 5px 内边距里）、环心数字 9.5px ——
    // 两位数百分比在环心也不拥挤；环外不再单列 R/W/M 标签（省掉三个字母位，浮窗更短）。
    // 完整口径仍在 aria-label / title / 设置页。
    '.ocgu-mini-group{display:inline-flex;align-items:center;margin-right:3px;animation:ocgu-swap .3s cubic-bezier(.22,.9,.28,1)}' +
    '.ocgu-mini-group:last-child{margin-right:0}' +
    '.ocgu-mini-ring{position:relative;flex:none;display:inline-flex;width:18px;height:18px}' +
    '.ocgu-mini-ring svg{position:absolute;left:50%;top:50%;width:21px;height:21px;transform:translate(-50%,-50%);overflow:visible}' +
    '.ocgu-mini-ring-track{fill:none;stroke:color-mix(in srgb,var(--ocgu-ring) 32%,transparent);stroke-width:3.2;transition:stroke .2s ease}' +
    '.ocgu-mini-ring-arc{fill:none;stroke:var(--ocgu-ring);stroke-width:3.2;stroke-linecap:round;transition:stroke-dashoffset .35s cubic-bezier(.22,.9,.28,1),stroke .2s ease}' +
    // 环心数字：绝对定位不参与行高；tabular-nums 让数值变化时不抖；颜色跟环同色（一眼成套）。
    // 9.5px/-.3px 是环内径(≈17.8px)的上限，两位数百分比正好放得下
    '.ocgu-mini-ring-val{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:8.5px;line-height:1;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.3px;white-space:nowrap;color:var(--ocgu-ring);animation:ocgu-num .28s ease}' +
    // 用量分级配色（红绿灯，一色两用）：剩余 >20% 绿、<=20% 琥珀、<=5% 红。
    // 剩余弧 = 该色满不透明；底盘（已消耗部分）= 同色 32% 透明。
    '.ocgu-mini-ring[data-level="ok"]{--ocgu-ring:var(--dsw-alias-state-success-primary)}' +
    '.ocgu-mini-ring[data-level="warn"]{--ocgu-ring:var(--dsw-alias-state-warn-primary)}' +
    '.ocgu-mini-ring[data-level="danger"]{--ocgu-ring:var(--dsw-alias-state-error-primary)}' +
    '.ocgu-mini-ring[data-level="empty"]{--ocgu-ring:color-mix(in srgb,var(--dsw-alias-label-secondary) 78%,transparent)}' +
    // 设置页的横向进度条继续用 .ocgu-fill（同一套分级配色）
    '.ocgu-fill[data-level="ok"]{background:var(--dsw-alias-state-success-primary)}' +
    '.ocgu-fill[data-level="warn"]{background:var(--dsw-alias-state-warn-primary)}' +
    '.ocgu-fill[data-level="danger"]{background:var(--dsw-alias-state-error-primary)}' +
    // ---------- 设置页：用量行 ----------
    '.ocgu-row{display:flex;flex-direction:column;gap:6px}' +
    '.ocgu-row-top{display:flex;align-items:baseline;gap:10px}' +
    '.ocgu-row-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}' +
    // 百分比定宽右对齐 + tabular-nums：三行的数字成列
    '.ocgu-row-pct{flex:none;min-width:38px;text-align:right;font-size:13px;line-height:18px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);animation:ocgu-fade .26s ease}' +
    // 进度槽 6 → 8px：槽底比纯 border-l1 更有「槽」感，又不抢眼
    '.ocgu-row-track{position:relative;height:8px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-border-l1) 82%,var(--dsw-alias-bg-base));overflow:hidden}' +
    // 设置页进度条：与浮层同款（绿色填充 + 常驻光带，一直循环）
    '.ocgu-row-fill{position:absolute;left:0;top:0;bottom:0;overflow:hidden;border-radius:999px;background:var(--dsw-alias-state-success-primary);transition:width .45s cubic-bezier(.22,.9,.28,1)}' +
    '.ocgu-row-fill[data-level="warn"]{background:var(--dsw-alias-state-warn-primary)}' +
    '.ocgu-row-fill[data-level="danger"]{background:var(--dsw-alias-state-error-primary)}' +
    '.ocgu-row-fill[data-level="empty"]{background:var(--dsw-alias-label-tertiary)}' +
    '.ocgu-row-fill::after{content:"";position:absolute;top:0;bottom:0;left:0;width:calc(100% * 100 / var(--ocgu-pct,100));background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--dsw-alias-label-primary-foreground) 40%,transparent),transparent);transform:translateX(-100%);animation:ocgu-shine 2.8s ease-in-out infinite}' +
    // 倒计时在标题行、百分比左侧：不换行、随标签挤压让位
    '.ocgu-row-reset{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}' +
    // ---------- 设置页：开关 —— 逐行照抄宿主控件 ----------
    // DSH 官方对插件的指引原文：插件自绘控件应「copy markup, CSS, and behavior from the primitive」，
    // 类名换成自己的前缀、只保留 --dsw-alias-* 令牌，并保留 role="switch" + aria-checked 等行为。
    // 开关尺寸与配色只能取宿主的这几个令牌：brand-primary 是高对比中性色（浅色＝近黑 / 深色＝近白），
    // 若拿它当 OFF 轨道、再把手柄写死成白色，深色主题下就是白底白柄（手柄隐形）。正解是：
    //   ON  轨道 = brand-primary（浅色＝近黑 / 深色＝近白），手柄 = label-primary-foreground（与轨道反色）
    //   OFF 轨道 = border-l3（浅色 #0000001f / 深色 #ffffff29），手柄 = switch-thumb
    '.ocgu-switch{box-sizing:border-box;position:relative;flex:0 0 auto;width:36px;height:20px;padding:2px;border:0;border-radius:999px;corner-shape:round;background:var(--dsw-alias-border-l3);cursor:pointer;-webkit-appearance:none;appearance:none}' +
    '.ocgu-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}' +
    '.ocgu-switch:disabled{cursor:default;opacity:.5}' +
    '.ocgu-switch:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}' +
    '.ocgu-thumb{display:block;width:16px;height:16px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-label-primary-foreground);transition:transform .12s ease}' +
    '.ocgu-switch[aria-checked="false"] .ocgu-thumb{background:var(--dsw-alias-switch-thumb)}' +
    '.ocgu-switch[aria-checked="true"] .ocgu-thumb{transform:translate(16px)}' +
    // ---------- 设置页：字段 / 控件（逐个照抄宿主 CSS-module 原文，类名前缀换成 ocgu-）----------
    // 字段版式：**左侧 = 「标题(+徽章) + 描述」紧凑块（标题→描述仅 2px）**，**右侧 = 控件贴右**，
    // 整行用 align-items:center 让左右两块垂直居中对齐 —— 一行就是一行。
    // 提示放在右侧组里、控件之前：行高由控件(28px)决定，提示(18px)不改变行高 → 零位移。
    // 窄面板（右侧组放不下）时右侧组整体换行，margin-left:auto 仍保持贴右。
    '.ocgu-field{display:flex;align-items:center;flex-wrap:wrap;gap:10px 16px;padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}' +
    '.ocgu-field-main{display:flex;flex-direction:column;gap:2px;flex:1 1 220px;min-width:0}' +
    '.ocgu-field-titlerow{display:flex;align-items:center;gap:8px;min-width:0}' +
    '.ocgu-field-title{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;line-height:1.5;color:var(--dsw-alias-label-primary)}' +
    '.ocgu-field-right{display:flex;align-items:center;gap:10px;flex:none;margin-left:auto}' +
    // 二选一分段控件（用量进度口径：已使用 / 剩余）
    '.ocgu-seg{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:9px;background:var(--dsw-alias-interactive-bg-hover)}' +
    '.ocgu-seg-item{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12.5px;line-height:1;padding:5px 10px;border-radius:7px;cursor:pointer;transition:background-color .18s ease,color .18s ease}' +
    '.ocgu-seg-item[data-on="1"]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-weight:500}' +
    '.ocgu-field-control{display:flex;align-items:center;flex-wrap:wrap;gap:8px}' +
    // 块布局（两把 Key 用）：标题/描述独占一行，控件行**通栏** —— 输入框左到头、右到按钮（自己撑满）
    '.ocgu-field[data-layout="block"] .ocgu-field-main{flex:1 1 100%}' +
    '.ocgu-field[data-layout="block"] .ocgu-field-right{flex:1 1 100%;margin-left:0}' +
    '.ocgu-field[data-layout="block"] .ocgu-field-control{flex:1 1 auto;min-width:0}' +
    '.ocgu-field[data-layout="block"] .ocgu-input{flex:1 1 auto;min-width:120px}' +
    // 分组标题行（标题在左；右侧 = 时间/提示 + 操作按钮，如「OpenCode Go 用量详情」那一行）
    '.ocgu-subrow{display:flex;align-items:center;gap:12px;margin:24px 0 2px}' +
    '.ocgu-subrow .ocgu-sub{margin:0;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.ocgu-subrow-right{display:flex;align-items:center;gap:10px;flex:none}' +
    '.ocgu-subrow-right .ocgu-msg{max-width:none}' +
    // 标签栏：左侧三个标签（复用 .ocgu-seg 分段控件），右侧常驻「恢复默认设置」+ 结果提示
    '.ocgu-tabs{display:flex;align-items:center;gap:12px;margin:18px 0 2px}' +
    '.ocgu-tabs .ocgu-seg{flex:0 0 auto;gap:4px;padding:2px}' +
    // 标签：更宽、高度压到与「恢复默认设置」按钮等高（按钮 28px = 24px 标签 + 上下各 2px 容器内边距）
    '.ocgu-tabs .ocgu-seg-item{height:24px;padding:0 22px;font-size:13px;line-height:1;border-radius:7px}' +
    '.ocgu-tabs .ocgu-msg{margin-left:auto}' +    // 侧栏入口开关：位于三个标签与「恢复默认设置」之间，靠左紧凑排布
    '.ocgu-tabs-toggle{display:inline-flex;align-items:center;gap:8px;margin-left:4px}' +
    '.ocgu-tabs-label{font-size:12.5px;line-height:1;color:var(--dsw-alias-label-secondary);white-space:nowrap}' +
    // 侧栏入口打开后的整页面板：居中单列、与设置页同宽
    // 整页容器：逐条对齐宿主官方页面骨架（asar 内 .V7pFBG_page / .pageHead）：
    //   官方 = 外层 flex 列 + align-items:center + 左右 padding clamp(24px,4vw,48px)，子项 width:100%/max-width:960px，
    //   页头 padding-top:28px。这样侧栏页与其他官方页（插件 / 自动化任务）左右边界、留白完全一致。
    '.ocgu-page{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;width:100%;padding:28px clamp(24px,4vw,48px) 48px;overflow:auto}' +
    '.ocgu-page>*{box-sizing:border-box;width:100%;max-width:960px;min-width:0}' +
    // 标题行（标题 + 右侧图标按钮）
    '.ocgu-title-row{display:flex;align-items:center;gap:10px}' +
    // 标题右侧的版本号小字
    '.ocgu-ver{font-size:10.5px;font-weight:400;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;letter-spacing:.2px}' +
    // 无边框图标按钮（标题右侧）：默认透明无框，hover 只给一点底色
    '.ocgu-iconbtn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:6px;transition:background-color .18s ease,color .18s ease}' +
    '.ocgu-iconbtn:hover{background:color-mix(in srgb,var(--dsw-alias-label-tertiary) 12%,transparent);color:var(--dsw-alias-label-primary)}' +
    '.ocgu-iconbtn svg{display:block}' +
    // 悬浮窗总开关关闭时：下辖条目整行变灰且不可操作
    '.ocgu-field[data-disabled="1"]{opacity:.45}' +
    '.ocgu-field[data-disabled="1"] .ocgu-field-control{pointer-events:none}' +
    // 宿主 checkbox 模块原文：checkbox{inline-flex;gap:6px;cursor:pointer}
    //   input{flex:0 0 auto;width:16px;height:16px;margin:0;accent-color:brand-primary}
    //   input:focus-visible{outline:focus-ring;outline-offset:2px}  :has(input:disabled){opacity:.5}
    //   （字号跟本行控件对齐用 12px，其余照抄）
    '.ocgu-check{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap}' +
    '.ocgu-check input{flex:0 0 auto;width:16px;height:16px;margin:0;accent-color:var(--dsw-alias-brand-primary);cursor:inherit}' +
    '.ocgu-check input:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}' +
    '.ocgu-check:has(input:disabled){cursor:default;opacity:.5}' +
    // 宿主 button 模块原文：base{gap:4px;border:none;border-radius:radius-md;font-size:14px;line-height:22px;padding:0 14px}
    //   sm{height:28px;font-size:12px;line-height:18px;padding:0 10px;border-radius:radius-sm}
    //   primary{background:button-primary-fill;color:label-primary-foreground} outline{border:.5px solid border-l3}
    //   ghost:hover{background:interactive-bg-hover}     （设置页用 sm 尺寸）
    '.ocgu-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;padding:0 10px;border:none;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px;line-height:18px;font-weight:500;white-space:nowrap;cursor:pointer;transition:background-color .12s ease,opacity .12s ease}' +
    '.ocgu-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}' +
    '.ocgu-btn:disabled{opacity:.5;cursor:default}' +
    '.ocgu-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}' +
    '.ocgu-btn[data-kind="primary"]{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}' +
    '.ocgu-btn[data-kind="primary"]:hover:not(:disabled){background:var(--dsw-alias-button-primary-fill);opacity:.9}' +
    '.ocgu-btn[data-kind="outline"]{border:.5px solid var(--dsw-alias-border-l3)}' +
    // 宿主把「清空 / 重置」这类次要动作做成无边框小字（原文：_reset_{border:none;background:none;padding:0;font-size:12px;color:label-secondary}）
    '.ocgu-btn[data-kind="link"]{height:auto;padding:0;border:none;background:none;font-size:12px;color:var(--dsw-alias-label-secondary)}' +
    '.ocgu-btn[data-kind="link"]:hover:not(:disabled){background:none;color:var(--dsw-alias-label-primary)}' +
    // 用量页的「手动刷新」：链接样式 + 重点色（品牌蓝，与进度条同色；带兜底值防令牌缺失）
    '.ocgu-btn[data-kind="link"][data-accent="1"]{color:var(--dsw-alias-brand-primary,#4d6bfe);font-weight:500}' +
    '.ocgu-btn[data-kind="link"][data-accent="1"]:hover:not(:disabled){color:var(--dsw-alias-brand-primary,#4d6bfe);opacity:.82;text-decoration:underline}' +
    '.ocgu-btn[data-kind="link"][data-accent="1"]:disabled{opacity:.5}' +
    '.ocgu-input{box-sizing:border-box;height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:1.5;outline:none;transition:border-color .12s ease}' +
    '.ocgu-input::placeholder{color:var(--dsw-alias-label-tertiary)}' +
    '.ocgu-input:focus{border-color:var(--dsw-alias-border-l3);outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}' +
    // 结果提示：单行、超长省略号截断（不换行、不挤压控件），出现时轻微淡入
    '.ocgu-msg{flex:0 1 auto;min-width:0;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-success-primary);animation:ocgu-msg-in .22s ease-out}' +
    '.ocgu-msg[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}' +
    '.ocgu-msg[data-tone="muted"]{color:var(--dsw-alias-label-tertiary)}' +
    '@keyframes ocgu-msg-in{from{opacity:0}to{opacity:1}}' +
    '.ocgu-err{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary)}' +
    '.ocgu-hint{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}' +
    // 页面标题：对齐官方「Agent 预设」那页的标题层级（大字号 + 加粗）
    '.ocgu-sec{font-size:20px;line-height:28px;font-weight:600;color:var(--dsw-alias-label-primary)}' +
    // 分组小标题（「OpenCode Go 用量详情」「设置」）：比字段标题(13/500)明显大一档且加粗
    '.ocgu-sub{font-size:15px;line-height:24px;font-weight:600;color:var(--dsw-alias-label-primary);margin:24px 0 2px}' +
    '.ocgu-card{border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md,12px);padding:14px 16px;background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-2))}' +
    // 宿主胶囊原文：_pill_{height:24px;padding:0 8px;border:none;border-radius:999px;corner-shape:round;font-size:12px;line-height:18px;color:label-secondary;background:bg-layer-2}
    '.ocgu-badge{display:inline-flex;align-items:center;flex:none;height:24px;padding:0 8px;border:none;border-radius:999px;corner-shape:round;font-size:12px;line-height:18px;white-space:nowrap;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2)}' +
    '.ocgu-badge[data-tone="ok"]{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,var(--dsw-alias-bg-layer-2))}' +
    '.ocgu-badge[data-tone="warn"]{color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,var(--dsw-alias-bg-layer-2))}';

  // ---------- 通用工具 ----------
  // 读取本插件在 Loader 里的配置投影（宿主写入的派生快照也在这里）
  function readNs(remote) {
    if (!remote || !remote.settings) return Promise.resolve(null);
    return remote.settings.describe().then(function (res) {
      if (!res || !res.ok) return null;
      var nss = (res.value && res.value.namespaces) || [];
      var i;
      for (i = 0; i < nss.length; i++) {
        if (nss[i] && nss[i].ns === NS) { nsRef = NS; return nss[i]; }
      }
      // 兜底：patch 行 id 与本文件声明不一致时，按 schema 特征认出自己
      for (i = 0; i < nss.length; i++) {
        var sc = nss[i] && nss[i].schema;
        var props = sc && sc.properties;
        if (props && props.usage && props.balance && props.keyStatus) {
          nsRef = nss[i].ns;
          return nss[i];
        }
      }
      return null;
    });
  }
  function nsValue(view) {
    return view && view.value && typeof view.value === 'object' ? view.value : {};
  }
  function updateNs(remote, view, patch, cb) {
    var rev = view && view.revision;
    remote.settings.update(nsRef, patch, rev).then(function (res) {
      if (res && res.ok) { cb(null, res.value); return; }
      var msg = (res && res.error && res.error.message) || '';
      var conflict = /revision|conflict/i.test(msg);
      if (!conflict) { cb(msg, null); return; }
      readNs(remote).then(function (nv) {
        if (!nv) { cb(msg, null); return; }
        remote.settings.update(nsRef, patch, nv.revision).then(function (res2) {
          if (res2 && res2.ok) cb(null, res2.value);
          else cb((res2 && res2.error && res2.error.message) || '', null);
        }).catch(function (e) { cb(String((e && e.message) || e), null); });
      }).catch(function () { cb(msg, null); });
    }).catch(function (e) { cb(String((e && e.message) || e), null); });
  }
  function fmtTime(iso) {
    if (!iso) return '';
    // 语言无关的固定格式（与原先 zh-CN 数值格式一致），避免硬编码语言
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' '
      + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }
  function fmtRelative(iso, t) {
    t = t || tZh;
    if (!iso) return '--';
    var ts = Date.parse(iso);
    if (!isFinite(ts)) return t('rel.justNow');
    var diff = Date.now() - ts;
    if (diff < 60000) return t('rel.justNow');
    var mins = Math.floor(diff / 60000);
    if (mins < 60) return t('rel.min', { n: mins });
    var hours = Math.floor(mins / 60);
    if (hours < 24) return t('rel.hour', { n: hours });
    return t('rel.day', { n: Math.floor(hours / 24) });
  }
  // 重置倒计时：由 resetsAt 现算，不依赖宿主再刷新
  function fmtCountdown(iso, t) {
    t = t || tZh;
    if (!iso) return '';
    var ts = Date.parse(iso);
    if (!isFinite(ts)) return '';
    var ms = ts - Date.now();
    if (ms <= 0) return t('cd.soon');
    var mins = Math.floor(ms / 60000);
    if (mins < 60) return t('cd.min', { n: mins });
    var hours = Math.floor(mins / 60);
    if (hours < 24) {
      return mins % 60 ? t('cd.hourMin', { h: hours, m: mins % 60 }) : t('cd.hour', { h: hours });
    }
    var days = Math.floor(hours / 24);
    return hours % 24 ? t('cd.dayHour', { d: days, h: hours % 24 }) : t('cd.day', { d: days });
  }
  function clampNum(v, min, max) {
    if (!isFinite(v)) return min;
    if (v < min) return min;
    if (v > max) return max;
    return v;
  }
  // 进度口径（设置页可切换）：left = 剩余（默认），used = 已使用。
  // 内部数据始终是「已用」，这里只在显示层换算成当前口径的值与风险等级。
  function modeOf(value) {
    return value && value.percentMode === 'used' ? 'used' : 'left';
  }
  function dispOf(used, mode) {
    var u = clampNum(Number(used), 0, 100);
    if (mode === 'used') {
      return { value: Math.round(u), level: u >= 95 ? 'danger' : (u >= 80 ? 'warn' : 'ok') };
    }
    var l = Math.round(100 - u);
    return { value: l, level: l <= 5 ? 'danger' : (l <= 20 ? 'warn' : 'ok') };
  }

  // ---------- 配额参考 / 计价币种（浮层与设置页共用） ----------
  // 当前界面语言：用插件自己的字典反查（中文字典的取值含汉字），不依赖宿主暴露 locale id，
  // 也不绑定具体文案（改名不会踩坑）。
  function isZhLocale(t) {
    try { return /[\u4e00-\u9fa5]/.test(String(t('tab.usage'))); } catch (e) { return true; }
  }
  // 计价币种：auto = 中文 ¥ / 英文 ＄；cny / usd 为强制
  function currencyOf(value, t) {
    var m = String((value && value.currencyMode) || 'auto');
    if (m === 'cny' || m === 'usd') return m;
    return isZhLocale(t) ? 'cny' : 'usd';
  }
  function fxRateOf(value) {
    var r = Number(value && value.fxUsdCny);
    return r > 0 ? r : 6.69;
  }
  // 美元金额 → 当前显示币种文本
  function usdText(value, t, usd) {
    if (!isFinite(usd)) return '--';
    var cur = currencyOf(value, t);
    var n = cur === 'cny' ? usd * fxRateOf(value) : usd;
    return (cur === 'cny' ? '¥' : '$') + n.toFixed(2);
  }
  // 人民币金额 → 当前显示币种文本
  function cnyText(value, t, cny) {
    if (!isFinite(cny)) return '--';
    var cur = currencyOf(value, t);
    var n = cur === 'usd' ? cny / fxRateOf(value) : cny;
    return (cur === 'cny' ? '¥' : '$') + n.toFixed(2);
  }
  // 余额文本：接口给的是 ¥，按显示币种换算（非 CNY 币种原样显示，避免二次换算）
  function curBalanceText(value, t) {
    var b = (value && value.balance) || {};
    var n = Number(b.totalBalance);
    var cur = String(b.currency || 'CNY').toUpperCase();
    if (cur !== 'CNY') return currencySymbol(b.currency || 'CNY') + (isFinite(n) ? n : '--');
    return isFinite(n) ? cnyText(value, t, n) : '¥--';
  }
  function goModelList(value) {
    var list = value && Array.isArray(value.goModels) ? value.goModels : [];
    return list.filter(function (m) { return m && m.id; });
  }
  // 月度「已使用」百分比：官方接口的 percent 恒为「已用」（进度口径只影响面板显示，不改数据）
  function monthlyUsedPct(value) {
    var u = (value && value.usage && value.usage.monthly) || {};
    var pct = Number(u.percent);
    if (!isFinite(pct)) pct = 0;
    return clampNum(pct, 0, 100);
  }
  // 配额折算：Go 档月度配额（美元）× 月度已用百分比
  function quotaOf(value) {
    var list = goModelList(value);
    var id = String((value && value.quotaRefModel) || 'deepseek-v4.1-flash');
    var m = null;
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { m = list[i]; break; } }
    if (!m && list.length) { m = list[0]; id = m.id; }   // 选中模型已下架 → 退到列表第一个
    var q = m ? Number(m.go) : NaN;
    var used = monthlyUsedPct(value);
    var hasQuota = isFinite(q) && q > 0;
    return {
      model: m, id: id, quota: q, usedPct: used,
      used: hasQuota ? q * used / 100 : NaN,
      left: hasQuota ? q * (1 - used / 100) : NaN
    };
  }
  // 抓取失败清单：点名到具体数据源（用量 / 余额 / 汇率 / 模型表）
  function fetchErrors(value, t) {
    var out = [];
    if (!value) return out;
    if (value.usageError) out.push(t('err.usage'));
    if (value.balanceError) out.push(t('err.balance'));
    if (value.fxError) out.push(t('err.fx'));
    if (value.goModelsError) out.push(t('err.models'));
    return out;
  }
  // 数据来源说明（用于 tooltip）：实时值 / 内置快照 + 时间
  function quotaSrcHint(value, t) {
    var live = String((value && value.goModelsSource) || '') === 'live';
    var at = String((value && value.goModelsAt) || '');
    var shown = at ? (live ? fmtTime(at) : at) : '';
    var m = live ? t('quota.srcLive') : t('quota.srcSnapshot', { date: shown });
    var fxLive = String((value && value.fxSource) || '') === 'live';
    var rd = String((value && value.fxRateDate) || '');
    var fx = (fxLive ? t('quota.srcLive') : t('quota.srcSnapshot', { date: shown }))
      + (rd ? (isZhLocale(t) ? '，' : ', ') + t('quota.fxRateDate', { d: rd }) : '');
    return t('quota.monthSrc', { models: m, fx: fx, rate: fxRateOf(value).toFixed(4) });
  }
  // 配额四行文本（浮层与设置页共用同一份内容）：标题 / 参考模型 / 月配额 / 已消耗·剩余
  // 短时间戳：26/10/22 17:03:45（设置页小字用）
  function fmtStampShort(iso) {
    var d = new Date(iso);
    if (!iso || isNaN(d.getTime())) return '';
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return String(d.getFullYear()).slice(2) + '/' + p(d.getMonth() + 1) + '/' + p(d.getDate())
      + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }
  // 抓取状态后缀：成功 / 失败（沿用兜底）
  function srcStatus(value, which, t) {
    var live = String((which === 'models' ? value.goModelsSource : value.fxSource) || '') === 'live';
    if (live) return t('quota.ok');
    return t(which === 'models' ? 'quota.staleModels' : 'quota.staleFx');
  }
  // 模型表 / 汇率小字（各自只讲自己，带更新时间与刷新结果）
  function quotaModelHint(value, t) {
    var at = String((value && value.goModelsAt) || '');
    if (!at) return t('quota.loading');
    return t('quota.hintModels', { t: fmtStampShort(at), rel: fmtRelative(at, t), status: srcStatus(value, 'models', t) });
  }
  function fxHint(value, t) {
    var at = String((value && value.fxAt) || '');
    return t('quota.hintFx', {
      rate: fxRateOf(value).toFixed(4),
      t: at ? fmtStampShort(at) : '--',
      rel: at ? fmtRelative(at, t) : '',
      status: at ? srcStatus(value, 'fx', t) : ''
    });
  }
  // 配额金额三态：正常 / 免费 / 无限制
  function quotaAmounts(value, t) {
    var q = quotaOf(value);
    var usable = isFinite(q.quota) && q.quota > 0;
    var quotaStr = q.quota === -1 ? t('quota.unlimited') : (q.quota === 0 ? t('quota.free') : usdText(value, t, q.quota));
    return {
      q: q,
      quota: quotaStr,
      used: usable ? usdText(value, t, q.used) : '--',
      left: usable ? usdText(value, t, q.left) : '--'
    };
  }
  // 浮层：配额剩余一行（标签 + 金额两段，金额加粗）；总配额 / 已消耗那行已按要求去掉
  function quotaTipLines(value, t) {
    if (!goModelList(value).length) return [t('quota.loading'), ''];
    var a = quotaAmounts(value, t);
    return [t('quota.tipLeftLabel'), a.left];
  }
  // 设置页配额小字：一行（模型 + 括号内的总配额 / 消耗 / 剩余）
  function quotaSetLine(value, t) {
    if (!goModelList(value).length) return t('quota.loading');
    var a = quotaAmounts(value, t);
    var name = (a.q.model && a.q.model.name) || a.q.id;
    return t('quota.setLine', { name: name, quota: a.quota, used: a.used, left: a.left });
  }
  function currencySymbol(cur) {
    if (!cur || cur === 'CNY') return '¥';
    if (cur === 'USD') return '$';
    return cur + ' ';
  }
  // 手动刷新：递增 refreshRequest 触发宿主重新拉取（余额 + 用量同轮），
  // 然后轮询等待 lastUpdated 变化
  function requestRefresh(remote, view, opts) {
    var before = nsValue(view).lastUpdated || '';
    if (opts.onStart) opts.onStart();
    updateNs(remote, view, { refreshRequest: (nsValue(view).refreshRequest || 0) + 1 }, function (err, newView) {
      if (err || !newView) {
        if (opts.onDone) opts.onDone(false, err || '', null);
        return;
      }
      if (opts.onView) opts.onView(newView);
      var tries = 0;
      var iv = setInterval(function () {
        tries++;
        readNs(remote).then(function (nv) {
          if (!nv) return;
          var val = nsValue(nv);
          if (val.lastUpdated && val.lastUpdated !== before) {
            clearInterval(iv);
            if (opts.onView) opts.onView(nv);
            if (opts.onDone) opts.onDone(!(val.usageError || val.balanceError), val.usageError || val.balanceError || '', nv);
          } else if (tries >= 12) {
            clearInterval(iv);
            if (opts.onView) opts.onView(nv);
            if (opts.onDone) opts.onDone(false, ERR_TIMEOUT, nv);
          }
        }).catch(function () {});
      }, 600);
    });
  }

  // ---------- 位置锚定引擎 ----------
  // 不记绝对坐标。松手时比较浮窗四边到各候选锚线的距离，取最近者，只记「锚线 + 偏移」；
  // 窗口或输入框尺寸变化时按锚线重算像素位置。
  // 水平锚线：输入框卡片左/右边（官方 InputBar 的 data-composer-card）、窗口左/右边
  // 垂直锚线：输入框卡片上/下边、窗口顶/底边
  function findComposerCard() {
    try {
      var el = document.querySelector('[data-composer-card]');
      if (!el || !el.getBoundingClientRect) return null;
      var r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return r;
    } catch (e) { /* 查询失败则视为无卡片，退化为视口锚定 */ }
    return null;
  }
  // 拖放专用：只允许视口锚线。
  // 为什么不用卡片锚线：card-* 的偏移是相对「输入框卡片实时 rect」存的，而卡片的
  // 高度/位置会随聚焦、草稿行、提示行变化 → 松手后浮窗会被反算到别处（看起来像自己跳开）。
  // 视口边沿在一次会话里几乎不变 → 视口锚线才能做到「放哪儿就是哪儿」。
  // 旧配置里已存下的 card-* 仍由 resolvePos 正常渲染（向后兼容），只是不再产生新的。
  function pickViewAnchors(rect, vw, vh) {
    var xs = [
      { a: 'view-left', d: Math.abs(rect.left), o: rect.left },
      { a: 'view-right', d: Math.abs(vw - rect.right), o: rect.right - vw }
    ];
    var ys = [
      { a: 'view-top', d: Math.abs(rect.top), o: rect.top },
      { a: 'view-bottom', d: Math.abs(vh - rect.bottom), o: rect.bottom - vh }
    ];
    var bx = xs[0], by = ys[0], i;
    for (i = 1; i < xs.length; i++) if (xs[i].d < bx.d) bx = xs[i];
    for (i = 1; i < ys.length; i++) if (ys[i].d < by.d) by = ys[i];
    // 0.1px 精度：整数化会在松手后引入最多 0.5px 的位移（放大后可见的"抖一下"）
    var r1 = function (v) { return Math.round(v * 10) / 10; };
    return { widgetAnchorX: bx.a, widgetOffsetX: r1(bx.o), widgetAnchorY: by.a, widgetOffsetY: r1(by.o) };
  }
  function resolvePos(cfg, cardRect, node) {
    var vw = window.innerWidth || 0;
    var vh = window.innerHeight || 0;
    var w = node ? (node.offsetWidth || 0) : 0;
    var h = node ? (node.offsetHeight || 0) : 0;
    var ax = cfg.widgetAnchorX, ox = cfg.widgetOffsetX;
    var ay = cfg.widgetAnchorY, oy = cfg.widgetOffsetY;
    var x, y;
    // 卡片缺失（非会话面板）时退化为同名视口边缘
    if (ax === 'card-left') x = (cardRect ? cardRect.left : 0) + ox;
    else if (ax === 'card-right') x = (cardRect ? cardRect.right : vw) + ox - w;
    else if (ax === 'view-left') x = ox;
    else x = vw + ox - w;
    if (ay === 'card-top') y = (cardRect ? cardRect.top : 0) + oy - h;
    else if (ay === 'card-bottom') y = (cardRect ? cardRect.bottom : vh) + oy;
    else if (ay === 'view-top') y = oy;
    else y = vh + oy - h;
    return {
      x: clampNum(x, 4, Math.max(4, vw - w - 4)),
      y: clampNum(y, 4, Math.max(4, vh - h - 4))
    };
  }
  function anchorLabel(ax, ay, t) {
    t = t || tZh;
    var x = t('anchor.' + (typeof ax === 'string' && ax ? ax : 'view-right'));
    var y = t('anchor.' + (typeof ay === 'string' && ay ? ay : 'view-bottom'));
    return x + ' · ' + y;
  }
  // 默认位置 = 窗口左上角（贴左边 11px、距顶 50px）；「重置位置」与「恢复默认设置」都回到这里
  var DEFAULT_ANCHORS = { widgetAnchorX: 'view-left', widgetOffsetX: 11, widgetAnchorY: 'view-top', widgetOffsetY: 50 };
  var REVEAL_MS = 3000;
  // 刷新超时的哨兵值：文案交给界面层按语言生成，helper 里不放中文（否则英文界面会中英混排）
  var ERR_TIMEOUT = '@timeout';
  // 设置页行内提示的停留时长：3 秒后自动消失（不留着占位、也不用用户手动清）
  var MSG_MS = 3000;
  // 自动刷新「更新中」相位的兜底时长：宿主单请求超时 20s（两个请求并行），超过这个时间说明
  // 这一轮不会回结果了（宿主提前返回 / 连接挂起），把流光收回，不能让一直转。
  var AUTO_LOADING_MAX_MS = 25000;
  // 迷你圆环几何：viewBox 24×24、r=10（描边 2.2 → 外径 22.2），周长即 dash 总长；
  // 弧长按剩余百分比取：strokeDashoffset = C × (1 - left/100)，剩余 0% 时偏移全长 = 不画。
  // （原 viewBox 18×18、r=8：环小、环心 8px 数字放两位数很挤，故整体放大）
  var RING_BOX = 24;
  var RING_MID = RING_BOX / 2;
  var RING_R = 10;
  var RING_C = 2 * Math.PI * RING_R;
  // 三个窗口的展示口径：浮窗只放得下 1 个字符的短标签（R = Rolling / 5 小时、W = 本周、M = 本月），
  // 完整口径在 aria-label / 浮窗 title / 设置页标题里
  // 浮窗只在环心显示剩余百分比（不再在环外单列 R/W/M 标签，浮窗更短）
  var WINDOWS = [
    { key: 'rolling', mini: 'R' },
    { key: 'weekly', mini: 'W' },
    { key: 'monthly', mini: 'M' }
  ];

  // ---------- 文案（中英双语）----------
  // 官方「外部客户端插件」写法：注册 slot 时带 locale: NS，组件即从框架拿到 t 席位；
  // 字典用 ctx.locale.register(NS, localeId, dict) 注册（挂载时做，见 apply 末尾）；
  // label 用 () => locale.bind(NS)(key) 以便跟随语言切换重新求值。
  var LOCALE_NS = 'opencode-go-usage';
  var I18N = {
    zh: {
      'win.rolling': '5 小时',
      'win.weekly': '本周',
      'win.monthly': '本月',
      'unit.minute': '分钟',
      'btn.save': '保存',
      'btn.clear': '清空',
      'btn.resetPos': '重置位置',
      'btn.atDefault': '已在默认位置',
      'title.resetPos': '把浮窗放回默认位置（窗口左上角）',
      'btn.resetAll': '恢复默认设置',
      'title.resetAll': '一键恢复：已使用 / 5 分钟 / 极简模式 / 不显示余额 / 默认位置',
      'aria.widget': '显示浮窗',
      'label.minimal': '极简模式',
      'title.minimal': '三环嵌套（R / W / M），余额取整显示在环旁',
      'tip.balanceLabel': 'DeepSeek账户余额：',
      // ── 配额参考（按 Go 档月度配额 × 月度已用百分比折算）──
      'msg.keyTooLong': 'Key 过长（最多 512 个字符）',
      'quota.title': 'OpenCode Go 套餐配额',
      'quota.setLine': '模型：{name}（总配额：{quota}，消耗：{used}，剩余：{left}）',
      'quota.tipLeftLabel': 'OpenCode Go配额剩余：',
      'quota.unlimited': '无限制',
      'quota.free': '免费',
      'quota.loading': '配额数据获取中…',
      'quota.pick': '配额参考模型选择',
      'quota.hintModels': '模型表更新时间：{t}（{rel}）{status}',
      'quota.hintFx': '1 USD = {rate} CNY，{t}（{rel}）{status}',
      'quota.ok': '，刷新成功',
      'quota.staleModels': '，刷新失败（沿用内置快照）',
      'quota.staleFx': '，刷新失败（沿用内置汇率）',
      'quota.srcLive': '实时数据',
      'quota.srcSnapshot': '内置快照 {date}',
      'quota.monthSrc': '模型表：{models}；汇率：{fx}（1 USD = {rate} CNY）',
      'quota.fxRateDate': '汇率数据日期 {d}',
      'field.currency': '金额显示计价币种',
      'cur.auto': '自动',
      'cur.cny': '¥ 人民币',
      'cur.usd': '$ 美元',
      'cur.autoHint': '自动：中文界面 ¥ / 英文界面 ＄',
      // ── 抓取失败点名报错（浮层底部 / 设置页手动刷新左侧）──
      'err.prefix': '数据获取失败：',
      'err.usage': 'OCG 用量',
      'err.balance': 'DeepSeek 官方余额',
      'err.fx': '汇率（已用内置汇率）',
      'err.models': '模型列表及配额（已用内置快照）',
      'float.groupTitle': 'OpenCode Go · {win}（{mini}）',
      'float.ring': 'OpenCode Go {win} {mode} {pct}%',
      'float.ringEmpty': 'OpenCode Go {win}（暂无数据）',
      'float.noKey': '未配置 API Key：可在设置 → OCG 余量查询 里填写，或写入 DSH 凭据库（点击刷新，拖动可移动位置）',
      'float.failed': '刷新失败：{err}（点击重试，拖动可移动位置）',
      'rel.justNow': '刚刚更新',
      'rel.min': '{n} 分钟前',
      'rel.hour': '{n} 小时前',
      'rel.day': '{n} 天前',
      'cd.soon': '即将重置',
      'cd.min': '{n} 分钟后重置',
      'cd.hour': '{h} 小时后重置',
      'cd.hourMin': '{h} 小时 {m} 分后重置',
      'cd.day': '{d} 天后重置',
      'cd.dayHour': '{d} 天 {h} 小时后重置',
      'cd.unknown': '重置时间未知',
      'cd.status': ' · 状态：{s}',
      'anchor.card-left': '输入框左侧',
      'anchor.card-right': '输入框右侧',
      'anchor.view-left': '窗口左边',
      'anchor.view-right': '窗口右边',
      'anchor.card-top': '输入框上方',
      'anchor.card-bottom': '输入框下方',
      'anchor.view-top': '窗口顶部',
      'anchor.view-bottom': '窗口底部',
      'settings.title': 'OCG 余量查询',
      'settings.intro': 'OpenCode Go 的 5 小时 / 本周 / 本月用量。点击浮窗即刷新，拖动可移动位置。',
      'tab.usage': '用量数据',
      'tab.widget': '浮窗管理',
      'tab.general': 'API Key',
      'aria.tabs': '设置分组',
      'title.console': '打开 OpenCode 账户页（opencode.ai/console）',      'field.widget.master': '浮窗总开关',
      'field.pillBalance': '在浮窗左侧显示余额',
      'field.pillBalance.hint': '在浮窗胶囊左侧显示一行余额；关闭后下一项一并收起',
      'field.pillBalanceSrc': '浮窗左侧余额数据',
      'field.pillBalanceSrc.hint': 'DS余额包含赠金',
      'pill.srcDeepseek': 'DS余额',
      'pill.srcQuota': 'OCG配额剩余',
      'field.tipBalanceSrc': '鼠标悬停浮层余额数据',
      'field.tipBalanceSrc.hint': '两个都不勾选时，浮层只显示三条进度条（DS余额包含赠金）',
      'tip.chkDeepseek': 'DS余额',
      'tip.chkQuota': 'OCG配额剩余',
      'tip.ddNone': '都不显示',
      'msg.pillSrcDeepseek': '浮窗左侧已显示 DS 余额',
      'msg.pillSrcQuota': '浮窗左侧已显示 OCG 配额剩余',
      'msg.tipData': '浮层余额数据：{list}',
      'msg.tipDataNone': '浮层余额数据：无（只显示进度条）',
      'field.minimal': '极简模式',
      'field.pos': '重置浮窗位置',
      'msg.minimalOn': '已开启极简模式',
      'msg.minimalOff': '已关闭极简模式',
      'aria.github': '打开 GitHub 项目主页',
      'settings.usageTitle': 'OpenCode Go 用量详情',
      'settings.lastUpdated': '上次更新：{time}（{rel}）',
      'settings.lastUpdatedEmpty': '上次更新：--',
      'settings.manualRefresh': '手动刷新',
      'settings.refreshTitle': '立即刷新余额与用量',
      'settings.refreshing': '刷新中…',
      'settings.updated': '已更新（{time}）',
      'settings.failed': '刷新失败：{err}',
      'settings.cardHint': '百分比为「剩余」：剩余 ≤20% 转橙、≤5% 转红。',
      'settings.cardHintUsed': '百分比为「已使用」：进度条 ≥80% 转橙、≥95% 转红。',
      'mode.used': '已使用',
      'mode.left': '剩余',
      'aria.mode': '用量进度口径',
      'settings.section': '设置',
      'field.interval': '自动刷新',
      'field.interval.hint': '自动刷新间隔（当前 {n} 分钟，0.5 ~ 1440）；手动刷新不受此限。',
      'field.interval.aria': '自动刷新间隔（分钟）',
      'field.widget.shown': '显示中（{anchor}）',
      'field.widget.hidden': '已隐藏（后台仍按间隔刷新）',
      'field.dsKey': 'DeepSeek API Key（可选覆盖）',
      'field.dsKey.hint': '留空 = 使用 DSH 凭据库的 DEEPSEEK_API_KEY · 当前 {mask}。余额明细见 DSH 官方账号菜单。',
      'field.ocgKey': 'OpenCode Go API Key（可选覆盖）',
      'field.ocgKey.hint': '留空 = 使用 DSH 凭据库的 OPENCODE_GO_API_KEY · 当前 {mask}',
      'ph.key': 'sk-...（留空则不覆盖）',
      'msg.saveFailed': '保存失败：{err}',
      'msg.unknownErr': '未知错误',
      'msg.needKey': '请输入 Key 后再保存',
      'msg.keySaved': '{which} Key 已保存',
      'msg.cleared': '已清空，改用 DSH 凭据库',
      'msg.invalidMinutes': '请输入有效的分钟数（0.5 ~ 1440）',
      'msg.timeout': '刷新超时',
      'msg.intervalSet': '自动刷新间隔已设为 {n} 分钟',
      'msg.widgetShown': '浮窗已显示',
      'msg.widgetHidden': '浮窗已隐藏',
      'msg.balanceShown': '浮窗已显示余额',
      'msg.balanceHidden': '浮窗已隐藏余额',
      'msg.posReset': '浮窗已回到默认位置',
      'msg.resetAllDone': '已恢复默认设置',
      'field.sidebarEntry': '侧栏入口',
      'title.sidebarEntry': '在侧栏加一个入口，点它直接打开本插件的设置页（等同 dshmarket 的做法）',
      'msg.sidebarOn': '侧栏入口已开启',
      'msg.sidebarOff': '侧栏入口已关闭',
      'status.auto': '已自动读取',
      'status.manual': '手动配置',
      'status.loading': '检测中',
      'status.missing': '未配置',
      'label.float': 'OCG 余量浮窗'
    },
    en: {
      'win.rolling': 'Rolling',
      'win.weekly': 'Weekly',
      'win.monthly': 'Monthly',
      'unit.minute': 'min',
      'btn.save': 'Save',
      'btn.clear': 'Clear',
      'btn.resetPos': 'Reset position',
      'btn.atDefault': 'At default',
      'title.resetPos': 'Move the pill back to its default position (top-left of the window)',
      'btn.resetAll': 'Restore defaults',
      'title.resetAll': 'One-click defaults: Used / 5 min / Minimal / no balance / default position',
      'aria.widget': 'Show floating pill',
      'label.minimal': 'Minimal',
      'title.minimal': 'Nested rings (R / W / M) with the rounded balance beside them',
      'tip.balanceLabel': 'DeepSeek account balance: ',
      // ── Quota reference (Go-tier monthly quota × monthly used percentage) ──
      'msg.keyTooLong': 'Key too long (512 characters max)',
      'quota.title': 'OpenCode Go plan quota',
      'quota.setLine': 'Model: {name} (total: {quota}, used: {used}, left: {left})',
      'quota.tipLeftLabel': 'OpenCode Go quota left: ',
      'quota.unlimited': 'Unlimited',
      'quota.free': 'Free',
      'quota.loading': 'Loading quota data…',
      'quota.pick': 'Quota reference model',
      'quota.hintModels': 'Model table updated: {t} ({rel}){status}',
      'quota.hintFx': '1 USD = {rate} CNY, {t} ({rel}){status}',
      'quota.ok': ', refresh ok',
      'quota.staleModels': ', refresh failed (bundled snapshot in use)',
      'quota.staleFx': ', refresh failed (bundled rate in use)',
      'quota.srcLive': 'live data',
      'quota.srcSnapshot': 'bundled snapshot {date}',
      'quota.monthSrc': 'Model table: {models}; rate: {fx} (1 USD = {rate} CNY)',
      'quota.fxRateDate': 'FX data date {d}',
      'field.currency': 'Amount display currency',
      'cur.auto': 'Auto',
      'cur.cny': '¥ CNY',
      'cur.usd': '$ USD',
      'cur.autoHint': 'Auto: ¥ in Chinese, $ in English',
      // ── Per-source fetch failures (popover footer / left of the manual refresh button) ──
      'err.prefix': 'Fetch failed: ',
      'err.usage': 'OCG usage',
      'err.balance': 'DeepSeek balance',
      'err.fx': 'exchange rate (bundled rate in use)',
      'err.models': 'model list & quota (bundled snapshot in use)',
      'float.groupTitle': 'OpenCode Go · {win} ({mini})',
      'float.ring': 'OpenCode Go {win} {mode} {pct}%',
      'float.ringEmpty': 'OpenCode Go {win} (no data)',
      'float.noKey': 'No API key configured: add one in Settings → OCG Usage, or put it in the DSH credential store (click to refresh, drag to move)',
      'float.failed': 'Refresh failed: {err} (click to retry, drag to move)',
      'rel.justNow': 'just now',
      'rel.min': '{n} min ago',
      'rel.hour': '{n} h ago',
      'rel.day': '{n} d ago',
      'cd.soon': 'resets soon',
      'cd.min': 'resets in {n} min',
      'cd.hour': 'resets in {h} h',
      'cd.hourMin': 'resets in {h} h {m} min',
      'cd.day': 'resets in {d} d',
      'cd.dayHour': 'resets in {d} d {h} h',
      'cd.unknown': 'reset time unknown',
      'cd.status': ' · status: {s}',
      'anchor.card-left': 'left of the composer',
      'anchor.card-right': 'right of the composer',
      'anchor.view-left': 'window left',
      'anchor.view-right': 'window right',
      'anchor.card-top': 'above the composer',
      'anchor.card-bottom': 'below the composer',
      'anchor.view-top': 'window top',
      'anchor.view-bottom': 'window bottom',
      'settings.title': 'OCG Usage',
      'settings.intro': 'OpenCode Go usage for the Rolling, weekly and monthly windows. Click the pill to refresh; drag it to move.',
      'tab.usage': 'Usage data',
      'tab.widget': 'Floating pill',
      'tab.general': 'API Key',
      'aria.tabs': 'Settings groups',
      'title.console': 'Open the OpenCode account page (opencode.ai/console)',
      'field.widget.master': 'Floating pill',
      'field.pillBalance': "Show a balance on the pill's left",
      'field.pillBalance.hint': 'One balance line on the left of the pill; turning it off also collapses the row below',
      'field.pillBalanceSrc': 'Pill left-side balance data',
      'field.pillBalanceSrc.hint': 'The DS balance includes bonus credit',
      'pill.srcDeepseek': 'DS balance',
      'pill.srcQuota': 'OCG quota left',
      'field.tipBalanceSrc': 'Hover popover balance data',
      'field.tipBalanceSrc.hint': 'With neither box ticked the popover shows only the three progress bars (the DS balance includes bonus credit)',
      'tip.chkDeepseek': 'DS balance',
      'tip.chkQuota': 'OCG quota',
      'tip.ddNone': 'None',
      'msg.pillSrcDeepseek': 'Pill left now shows the DS balance',
      'msg.pillSrcQuota': 'Pill left now shows the OCG quota left',
      'msg.tipData': 'Popover balance data: {list}',
      'msg.tipDataNone': 'Popover balance data: none (progress bars only)',
      'field.minimal': 'Minimal mode',
      'field.pos': 'Reset the pill position',
      'msg.minimalOn': 'Minimal mode on',
      'msg.minimalOff': 'Minimal mode off',
      'aria.github': 'Open the GitHub project page',
      'settings.usageTitle': 'OpenCode Go usage details',
      'settings.lastUpdated': 'Last updated: {time} ({rel})',
      'settings.lastUpdatedEmpty': 'Last updated: --',
      'settings.manualRefresh': 'Refresh now',
      'settings.refreshTitle': 'Refresh balance and usage now',
      'settings.refreshing': 'Refreshing…',
      'settings.updated': 'Updated ({time})',
      'settings.failed': 'Refresh failed: {err}',
      'settings.cardHint': 'Percentages are “left”: amber at ≤20%, red at ≤5%.',
      'settings.cardHintUsed': 'Percentages are “used”: amber at ≥80%, red at ≥95%.',
      'mode.used': 'Used',
      'mode.left': 'Left',
      'aria.mode': 'Usage progress basis',
      'settings.section': 'Settings',
      'field.interval': 'Auto-refresh',
      'field.interval.hint': 'Auto-refresh interval (currently {n} min, 0.5–1440); manual refresh is not limited by this.',
      'field.interval.aria': 'Auto-refresh interval (minutes)',
      'field.widget.shown': 'Shown ({anchor})',
      'field.widget.hidden': 'Hidden (still refreshing on schedule)',
      'field.dsKey': 'DeepSeek API key (optional override)',
      'field.dsKey.hint': 'Empty = use DEEPSEEK_API_KEY from the DSH credential store · current {mask}. Balance details are in the DSH account menu.',
      'field.ocgKey': 'OpenCode Go API key (optional override)',
      'field.ocgKey.hint': 'Empty = use OPENCODE_GO_API_KEY from the DSH credential store · current {mask}',
      'ph.key': 'sk-... (empty = keep current)',
      'msg.saveFailed': 'Save failed: {err}',
      'msg.unknownErr': 'unknown error',
      'msg.needKey': 'Enter a key before saving',
      'msg.keySaved': '{which} key saved',
      'msg.cleared': 'Cleared — using the DSH credential store',
      'msg.invalidMinutes': 'Enter a valid number of minutes (0.5–1440)',
      'msg.timeout': 'refresh timed out',
      'msg.intervalSet': 'Auto-refresh interval set to {n} min',
      'msg.widgetShown': 'Floating pill shown',
      'msg.widgetHidden': 'Floating pill hidden',
      'msg.balanceShown': 'Balance shown on the pill',
      'msg.balanceHidden': 'Balance hidden from the pill',
      'msg.posReset': 'Pill moved back to its default position',
      'msg.resetAllDone': 'Defaults restored',
      'field.sidebarEntry': 'Sidebar entry',
      'title.sidebarEntry': 'Add a row to the sidebar that opens this plugin\'s settings page directly',
      'msg.sidebarOn': 'Sidebar entry enabled',
      'msg.sidebarOff': 'Sidebar entry disabled',
      'status.auto': 'Read automatically',
      'status.manual': 'Set manually',
      'status.loading': 'Checking',
      'status.missing': 'Not configured',
      'label.float': 'OCG usage pill'
    }
  };
  // 极简模板翻译：{name} 占位；取不到键时回落中文，再取不到就返回键名
  function makeT(dict) {
    return function (key, params) {
      var s = dict[key];
      if (s === undefined) s = I18N.zh[key];
      if (s === undefined) return key;
      if (params) {
        s = s.replace(/\{(\w+)\}/g, function (m, k) {
          return params[k] === undefined || params[k] === null ? m : String(params[k]);
        });
      }
      return s;
    };
  }
  var tZh = makeT(I18N.zh);
  function winName(w, t) { return t('win.' + w.key); }
  var EMPTY_WINDOW = { status: '', percent: 0, resetsAt: '' };
  function windowOf(usage, key) {
    var w = usage && typeof usage === 'object' ? usage[key] : null;
    if (!w || typeof w !== 'object') return EMPTY_WINDOW;
    return {
      status: typeof w.status === 'string' ? w.status : '',
      percent: isFinite(w.percent) ? Math.min(100, Math.max(0, w.percent)) : 0,
      resetsAt: typeof w.resetsAt === 'string' ? w.resetsAt : ''
    };
  }
  function balanceOf(value) {
    var b = value && typeof value.balance === 'object' && value.balance ? value.balance : null;
    return b && b.totalBalance ? b : null;
  }
  function floatWarn(value) {
    return value.keyStatus === 'missing' || value.balanceKeyStatus === 'missing'
      || !!value.usageError || !!value.balanceError;
  }
  // 浮窗左侧那一行余额：按「浮窗左侧余额数据」取 DeepSeek 余额或 OCG 配额剩余
  // 两路都先换算成当前「金额显示计价币种」；rounded = true 用于极简模式（去掉小数）
  function pillBalanceText(value, t, rounded) {
    var s = String((value && value.pillBalanceSource) || 'deepseek') === 'quota'
      ? quotaAmounts(value, t).left        // 形如 ¥305.03 / $45.60 / --
      : curBalanceText(value, t);          // DeepSeek 余额（接口给的是 ¥，按币种换算）
    if (s === '--') return s;
    return rounded ? s.replace(/\.\d+$/, '') : s;
  }
  // 浮窗左侧余额的告警态：跟着当前来源走
  function pillBalanceWarn(value) {
    if (String((value && value.pillBalanceSource) || 'deepseek') === 'quota') return !!value.goModelsError;
    return !!(value.balanceError || value.balanceKeyStatus === 'missing');
  }

  // ---------- 悬浮窗（余额 + OCG 用量 + 刷新状态提示） ----------
  // 单行胶囊：点击 = 原位刷新 + 左侧滑出状态提示，出结果后再停留 3 秒收回。
  // 自动刷新同款反馈：宿主开始拉取前先写 refreshTick，客户端据此点亮「更新中」流光，
  // 出结果后转全绿/全红并 3 秒淡出（最长 25 秒兜底收回）—— 每次更新都看得见。
  function UsageFloat(props) {
    var t = props.t || tZh;
    var remote = props.remote;
    var viewState = React.useState(null);
    var view = viewState[0];
    var setView = viewState[1];
    var rsState = React.useState('idle');
    var refreshState = rsState[0];
    var setRefreshState = rsState[1];
    var rminState = React.useState(5);
    var refreshMinutes = rminState[0];
    var setRefreshMinutes = rminState[1];
    var tickState = React.useState(0);
    var setTick = tickState[1];
    // 悬停临时浮层（余额 + 三条精简进度）：hovering 控制显隐，tipUp 决定向上/向下展开
    var hoverState = React.useState(false);
    var hovering = hoverState[0];
    var setHovering = hoverState[1];
    // 悬停意图：指针离开浮窗后延迟 220ms 再关浮层 —— 浮层与浮窗之间有 8px 间隙，
    // 期间指针既不在浮窗也不在浮层，立即关闭会让「移到浮层上」根本走不到。
    var hoverTimerRef = React.useRef(null);
    function holdHover() {
      if (hoverTimerRef.current !== null) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
      setHovering(true);
    }
    function releaseHover() {
      if (hoverTimerRef.current !== null) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(function () {
        hoverTimerRef.current = null;
        setHovering(false);
      }, 220);
    }
    React.useEffect(function () {
      return function () { if (hoverTimerRef.current !== null) clearTimeout(hoverTimerRef.current); };
    }, []);
    var tipUpState = React.useState(false);
    var tipUp = tipUpState[0];
    var setTipUp = tipUpState[1];
    // 浮层水平展开方向：true = 右对齐向左展开（浮窗贴近窗口右侧时使用）
    var tipRightState = React.useState(false);
    var tipRight = tipRightState[0];
    var setTipRight = tipRightState[1];
    var TIP_W = 232; // 与 CSS 中 .ocgu-tip 的 width 保持一致

    var rootRef = React.useRef(null);
    var dragRef = React.useRef(null);
    var viewRef = React.useRef(null);
    var revertRef = React.useRef(null);
    var hideTimerRef = React.useRef(null);
    var loadingTimerRef = React.useRef(null);
    var manualBusyRef = React.useRef(false);
    var revealRef = React.useRef(null);
    var cardElRef = React.useRef(null);
    var cfgRef = React.useRef(DEFAULT_ANCHORS);
    // 刷新反馈：跟踪宿主写入的 lastUpdated（出结果）/ refreshRequest（手动触发）/ refreshTick（开始拉取）
    var seenUpdatedRef = React.useRef(null);
    var seenRequestRef = React.useRef(null);
    var seenTickRef = React.useRef(null);
    var autoRevealRef = React.useRef(null);
    var autoLoadingRef = React.useRef(null);

    var bump = function () { setTick(function (n) { return n + 1; }); };

    // 自动刷新的「更新中」相位：宿主拉取前自增 refreshTick，客户端见到变化就点亮与手动点击
    // 同一套边框流光；出结果时由 autoReveal 接手（转全绿/全红 + 3 秒淡出）。
    var stopAutoLoading = function () {
      if (loadingTimerRef.current) { clearTimeout(loadingTimerRef.current); loadingTimerRef.current = null; }
    };
    var autoLoading = function () {
      if (dragRef.current) return; // 拖动中不打扰（与 autoReveal 同规矩）
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      stopAutoLoading();
      setRefreshState('loading');
      // 兜底收回：只在仍处于 loading 时归零，别把已经亮起的结果色盖掉
      loadingTimerRef.current = setTimeout(function () {
        loadingTimerRef.current = null;
        setRefreshState(function (prev) { return prev === 'loading' ? 'idle' : prev; });
      }, AUTO_LOADING_MAX_MS);
    };
    autoLoadingRef.current = autoLoading;

    // 数据：事件订阅 + 启动阶梯补读 + 30s 稳定轮询（describe 为本地 RPC，不触碰官方接口）
    React.useEffect(function () {
      var alive = true;
      var offRemote = null;
      var applyView = function (nv) {
        if (!alive || !nv) return;
        var v = nsValue(nv);
        var upd = v.lastUpdated || '';
        var req = typeof v.refreshRequest === 'number' ? v.refreshRequest : 0;
        var tick = typeof v.refreshTick === 'number' ? v.refreshTick : 0;
        if (seenUpdatedRef.current === null) {
          // 首次读取只建基线：刷新页面时安静显示，不弹提示
          seenUpdatedRef.current = upd;
          seenRequestRef.current = req;
          seenTickRef.current = tick;
        } else {
          // lastUpdated 变了 = 刚出结果；refreshTick 变了 = 宿主刚开始拉取（自动刷新也有流光）；
          // req 变了 = 是我们点击触发的（已由点击流程反馈）
          var updChanged = !!upd && upd !== seenUpdatedRef.current;
          var tickChanged = tick !== seenTickRef.current;
          var manual = req !== seenRequestRef.current;
          seenUpdatedRef.current = upd;
          seenRequestRef.current = req;
          seenTickRef.current = tick;
          if (updChanged) {
            // 「开始」与「结果」两次异步读可能并进同一份快照：此时按结果优先，不进流光
            // 未配置 Key 时的重试阶梯会连续刷新，不重复弹提示打扰
            var keyGone = v.keyStatus === 'missing' || v.balanceKeyStatus === 'missing';
            if (!manual && !keyGone && autoRevealRef.current) {
              autoRevealRef.current(!!(v.usageError || v.balanceError));
            }
          } else if (tickChanged && !manual && autoLoadingRef.current) {
            autoLoadingRef.current();
          }
        }
        setView(nv);
        viewRef.current = nv;
        if (v.refreshMinutes) setRefreshMinutes(v.refreshMinutes);
      };
      if (remote) {
        offRemote = remote.$on('settings/document-updated', function (ns) {
          if (ns !== nsRef) return;
          readNs(remote).then(applyView).catch(function () {});
        });
      }
      // 启动快速补读：宿主可能在组合后期才解析到 Key，按阶梯重读直到拿到快照
      var ladder = [2000, 5000, 10000, 20000, 40000];
      var ladderTimer = null;
      var readCatchUp = function () {
        var retryLater = function () {
          if (alive && ladder.length) ladderTimer = setTimeout(readCatchUp, ladder.shift());
        };
        readNs(remote).then(function (nv) {
          if (!alive || !nv) return;
          applyView(nv);
          var v = nsValue(nv);
          var ready = v.keyStatus !== 'missing' && v.keyStatus !== 'loading' && !!v.lastUpdated;
          if (!ready) retryLater();
        }).catch(function () {
          // 页面刚加载时 RPC 可能尚未就绪：失败不能吞掉后停摆
          retryLater();
        });
      };
      readCatchUp();
      var iv = setInterval(function () {
        readNs(remote).then(applyView).catch(function () {});
      }, 30000);
      return function () {
        alive = false;
        if (offRemote) offRemote();
        if (ladderTimer) clearTimeout(ladderTimer);
        clearInterval(iv);
      };
    }, []);

    var value = nsValue(view);
    var usage = value.usage && typeof value.usage === 'object' ? value.usage : {};
    cfgRef.current = {
      widgetAnchorX: typeof value.widgetAnchorX === 'string' ? value.widgetAnchorX : DEFAULT_ANCHORS.widgetAnchorX,
      widgetOffsetX: typeof value.widgetOffsetX === 'number' ? value.widgetOffsetX : DEFAULT_ANCHORS.widgetOffsetX,
      widgetAnchorY: typeof value.widgetAnchorY === 'string' ? value.widgetAnchorY : DEFAULT_ANCHORS.widgetAnchorY,
      widgetOffsetY: typeof value.widgetOffsetY === 'number' ? value.widgetOffsetY : DEFAULT_ANCHORS.widgetOffsetY
    };

    // 位置声明式解析：配置、提示滑出/收回、视口与卡片尺寸任一变化都重算（无依赖数组 =
    // 每次渲染都重算；开销仅一次 rect 读取 + 两次样式写入）
    React.useLayoutEffect(function () {
      var node = rootRef.current;
      if (!node) return;
      if (dragRef.current) return; // 拖动中由 pointermove 直接控制，勿覆盖
      var p = resolvePos(cfgRef.current, findComposerCard(), node);
      node.style.left = p.x + 'px';
      node.style.top = p.y + 'px';
      node.style.right = 'auto';
      node.style.bottom = 'auto';
    });

    // 视口尺寸 / 输入框卡片尺寸变化 → 重算（右侧栏开合、对话宽度调整都会改卡片宽度）
    React.useEffect(function () {
      var onResize = function () { bump(); };
      window.addEventListener('resize', onResize);
      var ro = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(function () {
          var el = document.querySelector('[data-composer-card]');
          if (el && el !== cardElRef.current) {
            cardElRef.current = el;
            try { ro.disconnect(); ro.observe(el); } catch (e) { /* 忽略 */ }
          }
          bump();
        });
        var initial = document.querySelector('[data-composer-card]');
        cardElRef.current = initial || null;
        try { ro.observe(initial || document.body); } catch (e) { /* 忽略 */ }
      }
      return function () {
        window.removeEventListener('resize', onResize);
        if (ro) { try { ro.disconnect(); } catch (e) { /* 忽略 */ } }
      };
    }, []);

    React.useEffect(function () {
      return function () {
        if (revertRef.current) clearTimeout(revertRef.current);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      };
    }, []);

    var refresh = function () {
      // 防连点只拦「手动刷新还在飞」这一种情况：自动刷新的流光期间也必须能点
      // （按 refreshState==='loading' 拦会把流光那 1~2 秒里的点击一起吞掉）
      if (manualBusyRef.current) return;
      manualBusyRef.current = true;
      // 看门狗：宿主 settings.update 若既不 resolve 也不 reject（极端挂起），30 秒后强制解锁，
      // 否则「手动刷新」会永久点不动。
      var busyWatchdog = setTimeout(function () { manualBusyRef.current = false; }, 30000);
      stopAutoLoading();
      if (revertRef.current) { clearTimeout(revertRef.current); revertRef.current = null; }
      requestRefresh(remote, viewRef.current, {
        onStart: function () { setRefreshState('loading'); },
        onView: function (nv) {
          setView(nv);
          viewRef.current = nv;
          var v = nsValue(nv);
          if (v.refreshMinutes) setRefreshMinutes(v.refreshMinutes);
        },
        onDone: function (ok) {
          clearTimeout(busyWatchdog);
          manualBusyRef.current = false;
          stopAutoLoading();
          setRefreshState(ok ? 'ok' : 'error');
          // 全绿（或全红）后再停留 3 秒淡出（刷新耗时不计入，慢网络下也一定看得到结果）
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(function () {
            setRefreshState('idle');
          }, REVEAL_MS);
        }
      });
    };

    // 点击：亮起边框光芒（loading 态）+ 立即刷新。重复点击会重新计时并再刷一次。
    var reveal = function () {
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      refresh();
    };
    revealRef.current = reveal;

    // 宿主刷新出结果后的可见反馈：先由 refreshTick 点亮「更新中」流光（见 autoLoading），
    // 这里接手收尾 —— 全绿（或全红）+ 3 秒淡出。
    var autoReveal = function (failed) {
      if (dragRef.current) return; // 拖动中不打扰
      stopAutoLoading();
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      setRefreshState(failed ? 'error' : 'ok');
      hideTimerRef.current = setTimeout(function () {
        setRefreshState('idle');
      }, REVEAL_MS);
    };
    autoRevealRef.current = autoReveal;

    // 拖动：pointerdown 记起点，document 级 move/up 区分「拖动」与「点击」。
    // 拖动过程直接写 DOM 样式（零重渲染零 RPC），落点才判定锚线并持久化一次。
    React.useEffect(function () {
      var onMove = function (e) {
        var d = dragRef.current;
        if (!d) return;
        var node = rootRef.current;
        if (!node) return;
        var dx = e.clientX - d.startX;
        var dy = e.clientY - d.startY;
        if (!d.moved) {
          if (Math.abs(dx) + Math.abs(dy) < 4) return;
          d.moved = true;
          node.setAttribute('data-dragging', 'true');
        }
        var nx = clampNum(e.clientX - d.offsetX, 4, Math.max(4, window.innerWidth - d.width - 4));
        var ny = clampNum(e.clientY - d.offsetY, 4, Math.max(4, window.innerHeight - d.height - 4));
        node.style.left = nx + 'px';
        node.style.top = ny + 'px';
        node.style.right = 'auto';
        node.style.bottom = 'auto';
      };
      var onUp = function () {
        var d = dragRef.current;
        if (!d) return;
        dragRef.current = null;
        var node = rootRef.current;
        if (d.moved) {
          if (node) node.setAttribute('data-dragging', 'false');
          if (!node) return;
          // 落点只按视口锚线记账：松手即最终位置，不会被输入框卡片的变化反算走
          var anchors = pickViewAnchors(
            node.getBoundingClientRect(),
            window.innerWidth || 0,
            window.innerHeight || 0
          );
          updateNs(remote, viewRef.current, anchors, function (err, nv) {
            if (!err && nv) { setView(nv); viewRef.current = nv; }
            bump();
          });
          return;
        }
        // 未位移 = 点击：滑出提示并立即刷新
        if (revealRef.current) revealRef.current();
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
      return function () {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
      };
    }, []);

    if (value.widgetVisible === false) return null;

    var missingKey = value.keyStatus === 'missing' || value.balanceKeyStatus === 'missing';
    var warn = floatWarn(value);
    var hasData = !!value.lastUpdated;

    var onPointerDown = function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var node = rootRef.current;
      if (!node) return;
      var rect = node.getBoundingClientRect();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height,
        moved: false
      };
      if (e.preventDefault) e.preventDefault();
    };

    // 更新反馈 = 绝对定位的光轨层（不占布局），phase 直接取自 refreshState。
    // 单行内容：余额 + 分隔线 + 三组迷你圆环 —— 长宽恒定，任何状态下都不改变尺寸。
    var children = [
      // 反馈层：结果相位的极轻内壁染色（边框闪烁由 .ocgu-float[data-state] 的动画负责）
      React.createElement('span', {
        key: 'glow', className: 'ocgu-glow', 'data-phase': refreshState, 'aria-hidden': 'true'
      })
    ];
    // 余额可关（设置页复选框）：关掉后连同分隔线一起去掉，浮窗自动变窄（光轨几何跟着 ResizeObserver 重算）
    var minimal = value.minimalMode === true;
    if (!minimal && value.showBalance !== false) {
      children.push(
        React.createElement('span', {
          key: 'bal',
          className: 'ocgu-bal',
          'data-balwarn': pillBalanceWarn(value) ? 'true' : 'false'
        }, pillBalanceText(value, t, false)),
        React.createElement('span', { key: 'sep', className: 'ocgu-sep' }));
    }
    var mode = modeOf(value);
    if (!minimal) WINDOWS.forEach(function (w) {
      var win = windowOf(usage, w.key);
      // 该窗口是否真有数据（宿主对缺失窗口给的是 status/resetsAt 皆空）
      var winHas = hasData && !!(win.status || win.resetsAt);
      // 弧长与环心数字按当前口径（剩余口径：满剩余 = 整圈，越用越短）
      var d = dispOf(win.percent, mode);
      var left = d.value;
      // 环心显示百分比（环外不再单列 R/W/M 标签，三颗环紧挨着，浮窗更短）
      children.push(React.createElement('span', {
        key: w.key, className: 'ocgu-mini-group', title: t('float.groupTitle', { win: winName(w, t), mini: w.mini })
      },
        React.createElement('span', {
          className: 'ocgu-mini-ring',
          'data-level': winHas ? d.level : 'empty',
          role: 'progressbar',
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': winHas ? left : 0,
          'aria-label': winHas ? t('float.ring', { win: winName(w, t), mode: t(mode === 'used' ? 'mode.used' : 'mode.left'), pct: left }) : t('float.ringEmpty', { win: winName(w, t) })
        },
          React.createElement('svg', { viewBox: '0 0 ' + RING_BOX + ' ' + RING_BOX, 'aria-hidden': 'true', focusable: 'false' },
            React.createElement('circle', { className: 'ocgu-mini-ring-track', cx: RING_MID, cy: RING_MID, r: RING_R }),
            // 只旋转图形组（-90° 让进度从 12 点起走），环心文字保持正立
            React.createElement('g', { transform: 'rotate(-90 ' + RING_MID + ' ' + RING_MID + ')' },
              React.createElement('circle', {
                className: 'ocgu-mini-ring-arc', cx: RING_MID, cy: RING_MID, r: RING_R,
                style: {
                  strokeDasharray: String(RING_C),
                  strokeDashoffset: String(winHas ? RING_C * (1 - left / 100) : RING_C)
                }
              }))),
          React.createElement('span', { key: 'v' + (winHas ? left : '-'), className: 'ocgu-mini-ring-val' }, winHas ? left : '--'))));
    });

    // 极简模式：三环嵌套（外 M / 中 W / 内 R），只比常规三环略大；余额取整后显示在环旁
    if (minimal) {
      if (value.showBalance !== false) {
        children.push(
          React.createElement('span', {
            key: 'bal', className: 'ocgu-bal',
            'data-balwarn': pillBalanceWarn(value) ? 'true' : 'false'
          }, pillBalanceText(value, t, true)),
          React.createElement('span', { key: 'sep', className: 'ocgu-sep' }));
      }
      var NEST = 26, NC = NEST / 2;
      var NEST_RINGS = [
        { w: WINDOWS[2], r: 11.5 },
        { w: WINDOWS[1], r: 7.5 },
        { w: WINDOWS[0], r: 3.5 }
      ];
      var nestKids = [];
      var nestAria = [];
      NEST_RINGS.forEach(function (rg, i) {
        var nw = windowOf(usage, rg.w.key);
        var nHas = hasData && !!(nw.status || nw.resetsAt);
        var nd = dispOf(nw.percent, mode);
        var nc = 2 * Math.PI * rg.r;
        nestKids.push(React.createElement('circle', { key: 't' + i, className: 'ocgu-nest-track', cx: NC, cy: NC, r: rg.r }));
        nestKids.push(React.createElement('circle', {
          key: 'a' + i, className: 'ocgu-nest-arc', cx: NC, cy: NC, r: rg.r,
          'data-level': nHas ? nd.level : 'empty',
          transform: 'rotate(-90 ' + NC + ' ' + NC + ')',
          style: { strokeDasharray: String(nc), strokeDashoffset: String(nHas ? nc * (1 - nd.value / 100) : nc) }
        }));
        nestAria.push(t('float.ring', {
          win: winName(rg.w, t), mode: t(mode === 'used' ? 'mode.used' : 'mode.left'), pct: nHas ? nd.value : 0
        }));
      });
      children.push(React.createElement('span', {
        key: 'nest', className: 'ocgu-nest', role: 'img', 'aria-label': nestAria.join(' · ')
      }, React.createElement('svg', {
        key: 'svg', viewBox: '0 0 ' + NEST + ' ' + NEST, 'aria-hidden': 'true', focusable: 'false'
      }, nestKids)));
    }

    // 悬停浮层取代了原来的长 title（刷新间隔、更新时间、用法说明都在设置页）；只有「缺 Key / 出错」
    // 才保留原生提示 —— 那是需要立刻看到的可读错误。
    var title = missingKey
      ? t('float.noKey')
      : (value.usageError || value.balanceError)
        ? t('float.failed', { err: value.usageError || value.balanceError })
        : '';

    // 悬停临时浮层：余额 + 三条精简进度（口径跟随设置，详情在设置页）
    if (hovering) {
      var tipRows = WINDOWS.map(function (w) {
        var tw = windowOf(usage, w.key);
        var twHas = hasData && !!(tw.status || tw.resetsAt);
        var td = dispOf(tw.percent, mode);
        return React.createElement('div', { key: w.key, className: 'ocgu-tip-row' },
          React.createElement('div', { className: 'ocgu-tip-line' },
            React.createElement('span', { className: 'ocgu-tip-track' },
              React.createElement('span', {
                className: 'ocgu-tip-fill', 'data-level': twHas ? td.level : 'empty',
                style: { width: (twHas ? td.value : 0) + '%', '--ocgu-pct': Math.max(1, twHas ? td.value : 1) }
              })),
            // 圆形数字钮：贴住进度当前位置，保留 % 号（无数据时不出现）
            twHas ? React.createElement('span', {
              className: 'ocgu-tip-knob', 'data-level': td.level, style: { left: td.value + '%' }
            }, td.value + '%') : null),
          // 窗口名与重置倒计时同一行：名字左对齐、倒计时右对齐（不再占左侧字母列）
          React.createElement('div', { className: 'ocgu-tip-meta' },
            React.createElement('span', { className: 'ocgu-tip-win' }, t('win.' + w.key)),
            React.createElement('span', { className: 'ocgu-tip-cd' }, fmtCountdown(tw.resetsAt, t) || t('cd.unknown'))));
      });
      var tipQuota = quotaTipLines(value, t);
      var tipBalText = curBalanceText(value, t);
      var tipErrs = fetchErrors(value, t);
      // 悬停浮层里两段余额各自可关：都不选则只留进度条（分隔线也一起去掉）
      var tipShowBal = value.tipShowBalance !== false;
      var tipShowQuota = value.tipShowQuota !== false;
      children.push(React.createElement('div', {
        key: 'tip', className: 'ocgu-tip', 'data-pos': tipUp ? 'up' : 'down', 'data-align': tipRight ? 'right' : 'left',
        // 与浮窗同相位（loading/ok/error）：刷新时浮层边框与浮窗同步闪烁；鼠标进入浮层续命
        'data-state': refreshState,
        onMouseEnter: holdHover,
        onMouseLeave: releaseHover
      },
        // 余额行与下面「配额剩余」行用**完全相同**的类（字号/字重/颜色逐项一致），避免看起来不一致
        // ① 账户余额：独占一栏（下方跟一条分割线）；标签常规字重，金额加粗并右对齐
        tipShowBal ? React.createElement('div', { className: 'ocgu-tip-bal ocgu-quota-h' },
          React.createElement('span', { className: 'ocgu-tip-lb' }, t('tip.balanceLabel')),
          React.createElement('span', { className: 'ocgu-tip-amt' }, tipBalText)) : null,
        tipShowBal ? React.createElement('div', { className: 'ocgu-tip-sep' }) : null,
        // ② 配额剩余：同样独占一栏（标签 + 右对齐的加粗金额）；下方保留既有分割线
        tipShowQuota ? React.createElement('div', { className: 'ocgu-quota', title: quotaSrcHint(value, t) },
          React.createElement('div', { className: 'ocgu-tip-bal ocgu-quota-h' },
            React.createElement('span', { className: 'ocgu-tip-lb' }, tipQuota[0]),
            React.createElement('span', { className: 'ocgu-tip-amt' }, tipQuota[1]))) : null,
        // 只有「配额剩余」这一段存在时，进度条上方才需要第二条分割线；
        // 仅显示余额时，余额自己那条分隔线已经够了（否则两条会叠在一起）。
        tipShowQuota ? React.createElement('div', { className: 'ocgu-tip-sep' }) : null,
        tipRows,
        // 抓取失败点名报错：浮层最底部（明确是 OCG 用量 / 余额 / 汇率 / 模型表哪一项）
        tipErrs.length ? React.createElement('div', {
          className: 'ocgu-errline', role: 'status', 'aria-live': 'polite'
        }, t('err.prefix') + tipErrs.join(isZhLocale(t) ? '、' : ', ')) : null));
    }

    return React.createElement('div', {
      ref: rootRef,
      className: 'ocgu-float',
      'data-state': refreshState,
      'data-warn': warn ? 'true' : 'false',
      'data-minimal': minimal ? 'true' : 'false',
      title: title,
      onPointerDown: onPointerDown,
      onMouseEnter: function () {
        var el = rootRef.current;
        if (el && typeof el.getBoundingClientRect === 'function') {
          var r = el.getBoundingClientRect();
          // 贴近视口底部时向上展开，避免浮层被裁掉
          setTipUp(r.bottom + 140 > (window.innerHeight || 0));
          // 浮层默认从浮窗左缘向右铺开；右侧放不下 232px 时改为右对齐向左铺开
          setTipRight(r.left + TIP_W + 8 > (window.innerWidth || 0));
        }
        holdHover();
      },
      onMouseLeave: releaseHover
    }, children);
  }

  // ---------- 侧栏入口（main 面板 + sidebar.panellist 行） ----------
  // 与 dshmarket 同样的官方契约：main 面板承载整页内容，sidebar.panellist 提供侧栏行；
  // 设置对话框的打开状态属于宿主私有，无法程序化跳转，因此这里用「整页」这一唯一官方入口。
  // 与设置菜单里的导航标记同一字形（NAV_MASK）：缺口环 + 中心点，16×16 原生尺寸，currentColor 着色
  function SidebarLogo(props) {
    var size = (props && props.size) || 16;
    return React.createElement('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none',
      'aria-hidden': 'true', focusable: 'false', style: { display: 'block' }
    },
      React.createElement('path', {
        d: 'M8 2.4a5.6 5.6 0 1 1-3.96 1.64', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round'
      }),
      React.createElement('circle', { cx: 8, cy: 8, r: 1.8, fill: 'currentColor' }));
  }
  // 整页面板：外层给页面留白与最大宽度，内部直接复用设置页组件（同一套 UI、零重复实现）
  function SidebarPage(props) {
    // 不再自己画标题：设置页内部已有「标题 + ⓘ + 版本号」那一行（在设置对话框里由宿主提供，
    // 独立成页时同样由它自己渲染），这里重复画就是双层标题。
    return React.createElement('div', { className: 'ocgu-page' }, React.createElement(SettingsPage, props));
  }
  // ---------- 设置页（settings.section，菜单名「OCG 余量查询」） ----------
  // 两种布局：
  // · row（默认，左右）：标题 + 短注释在左，控件在右 —— 注释一两行放得下时用（自动刷新 / 悬浮窗 / 浮窗位置）
  // · stack（上下）：标题 + 注释在上，控件在下 —— 注释较长或控件较多时用（两把 API Key：徽章 + 输入框 + 保存 + 清空）
  // 提示语气由调用方显式给出（say(id, text, tone)），不再靠关键词猜 —— 中英双语下都准确
  function FieldRow(props) {
    // 左侧 = 标题(+徽章 +结果提示) / 描述 的紧凑块；右侧 = 控件贴右；整行 align-items:center 垂直居中对齐。
    // 提示放在**标题行**里（徽章之后）：标题行高度由标题(19.5px)/徽章(24px)决定，提示只有 18px，
    // 所以出现与消失既不改变行高，也不挤占控件宽度 → 真正零位移（放右侧组会挤窄块布局的输入框）。
    var msg = props.msg
      ? React.createElement('span', {
        className: 'ocgu-msg', 'data-tone': props.tone || '',
        role: 'status', 'aria-live': 'polite', title: props.msg
      }, props.msg)
      : null;
    return React.createElement('div', {
      className: 'ocgu-field',
      'data-layout': props.layout === 'block' ? 'block' : 'inline',
      'data-disabled': props.disabled ? '1' : '0'
    },
      React.createElement('div', { className: 'ocgu-field-main' },
        React.createElement('div', { className: 'ocgu-field-titlerow' },
          React.createElement('div', { className: 'ocgu-field-title', title: props.title }, props.title),
          props.badge || null,
          msg),
        props.hint ? React.createElement('div', { className: 'ocgu-hint' }, props.hint) : null,
        props.error ? React.createElement('div', { className: 'ocgu-err' }, props.error) : null),
      React.createElement('div', { className: 'ocgu-field-right' },
        React.createElement('div', {
          className: 'ocgu-field-control',
          style: props.nowrap ? { flexWrap: 'nowrap' } : undefined
        }, props.control)));
  }

  function UsageRow(props) {
    var win = props.win;
    var t = props.t || tZh;
    // 无数据的窗口不显示百分比：宿主对缺失窗口给的是 status/resetsAt 皆空，
    // 若按当前口径硬算会得到误导性的 100%
    var winHas = !!(win.status || win.resetsAt);
    var d = dispOf(win.percent, props.mode);
    // 重置倒计时放在标题行、百分比左侧（不独占一行）
    return React.createElement('div', { className: 'ocgu-row', style: { marginBottom: '10px' } },
      React.createElement('div', { className: 'ocgu-row-top' },
        React.createElement('span', { className: 'ocgu-row-label' }, props.label),
        React.createElement('span', { className: 'ocgu-row-reset' },
          (fmtCountdown(win.resetsAt, t) || t('cd.unknown')) + (win.status && win.status !== 'ok' ? t('cd.status', { s: win.status }) : '')),
        React.createElement('span', { key: 'p' + (winHas ? d.value : '-'), className: 'ocgu-row-pct' }, winHas ? d.value + '%' : '--')),
      React.createElement('div', { className: 'ocgu-row-track' },
        React.createElement('div', { className: 'ocgu-row-fill ocgu-fill', 'data-level': winHas ? d.level : 'empty', style: { width: (winHas ? d.value : 0) + '%', '--ocgu-pct': Math.max(1, winHas ? d.value : 1) } })));
  }

  function SettingsPage(props) {
    var remote = props.remote;
    var t = props.t || tZh;
    var viewState = React.useState(null);
    var view = viewState[0];
    var setView = viewState[1];
    var loadState = React.useState(false);
    var loading = loadState[0];
    var setLoading = loadState[1];
    var dsKeyState = React.useState('');
    // 下拉多选（悬停浮层余额数据）：点击其范围之外自动收起（点面板内的复选框不收起）
    var ddRef = React.useRef(null);
    React.useEffect(function () {
      var onDocDown = function (e) {
        var el = ddRef.current;
        if (el && el.open && !el.contains(e.target)) el.open = false;
      };
      document.addEventListener('pointerdown', onDocDown, true);
      return function () { document.removeEventListener('pointerdown', onDocDown, true); };
    }, []);
    var dsKeyDraft = dsKeyState[0];
    var setDsKeyDraft = dsKeyState[1];
    var ocgKeyState = React.useState('');
    var ocgKeyDraft = ocgKeyState[0];
    var setOcgKeyDraft = ocgKeyState[1];
    var rminState = React.useState('');
    var refreshDraft = rminState[0];
    var setRefreshDraft = rminState[1];
    // 每个操作行各自一条提示（键 = 行 id）：谁被操作，提示就出现在谁那里（不集中堆到页面顶部）；
    // 3 秒后自动消失（期间若又来新提示则重新计时，旧定时器只清掉自己那条）
    var msgState = React.useState({});
    var msgs = msgState[0];
    var setMsgs = msgState[1];
    var msgTimers = React.useRef({});
    var say = function (id, text, tone) {
      // 提示按 { text, tone } 存：语气由调用方显式给出，不再靠中文关键词猜
      //（否则英文提示匹配不上 /失败|超时|…/，会被当成「成功绿」）
      var entry = { text: text, tone: tone || '' };
      setMsgs(function (prev) {
        var next = {};
        for (var k in prev) { if (Object.prototype.hasOwnProperty.call(prev, k)) next[k] = prev[k]; }
        next[id] = entry;
        return next;
      });
      if (msgTimers.current[id]) clearTimeout(msgTimers.current[id]);
      msgTimers.current[id] = setTimeout(function () {
        msgTimers.current[id] = null;
        setMsgs(function (prev) {
          if (prev[id] !== entry) return prev; // 期间被新提示替换过 → 不动它
          var next = {};
          for (var k in prev) { if (Object.prototype.hasOwnProperty.call(prev, k) && k !== id) next[k] = prev[k]; }
          return next;
        });
      }, MSG_MS);
    };
    var msgOf = function (id) { return (msgs[id] && msgs[id].text) || ''; };
    var toneOf = function (id) { return (msgs[id] && msgs[id].tone) || ''; };
    var tickState = React.useState(0);
    var setTick = tickState[1];
    var viewRef = React.useRef(null);
    viewRef.current = view;

    React.useEffect(function () {
      var alive = true;
      var load = function () {
        readNs(remote).then(function (nv) {
          if (!alive || !nv) return;
          setView(nv);
          viewRef.current = nv;
          var v = nsValue(nv);
          if (v.refreshMinutes) setRefreshDraft(String(v.refreshMinutes));
        }).catch(function () {});
      };
      load();
      var iv = setInterval(load, 60000);
      var cd = setInterval(function () { setTick(function (n) { return n + 1; }); }, 20000);
      var offRemote = null;
      if (remote) {
        offRemote = remote.$on('settings/document-updated', function (ns) {
          if (ns !== nsRef) return;
          load();
        });
      }
      return function () {
        alive = false;
        clearInterval(iv);
        clearInterval(cd);
        if (offRemote) offRemote();
        // 行内提示的自动消失定时器一并清掉（切页/卸载后不该再 setState）
        for (var k in msgTimers.current) {
          if (Object.prototype.hasOwnProperty.call(msgTimers.current, k) && msgTimers.current[k]) {
            clearTimeout(msgTimers.current[k]);
            msgTimers.current[k] = null;
          }
        }
      };
    }, []);

    var value = nsValue(view);
    var usage = value.usage && typeof value.usage === 'object' ? value.usage : {};

    var apply = function (nv) {
      setView(nv);
      viewRef.current = nv;
      var v = nsValue(nv);
      if (v.refreshMinutes) setRefreshDraft(String(v.refreshMinutes));
    };

    var refresh = function () {
      setLoading(true);
      requestRefresh(remote, viewRef.current, {
        onView: apply,
        onDone: function (ok, m) {
          setLoading(false);
          say('refresh',
            ok ? t('settings.updated', { time: fmtTime(nsValue(viewRef.current).lastUpdated) })
               : t('settings.failed', { err: m === ERR_TIMEOUT ? t('msg.timeout') : (m || t('msg.unknownErr')) }),
            ok ? '' : 'error');
        }
      });
    };

    var saveKey = function (which) {
      var rowId = which === 'ds' ? 'dsKey' : 'ocgKey';
      var draft = (which === 'ds' ? dsKeyDraft : ocgKeyDraft).trim();
      if (!draft) { say(rowId, t('msg.needKey'), 'error'); return; }
      // 长度护栏：API Key 不会有 512 字符以上，防止误粘贴整段文本把配置撑大
      if (draft.length > 512) { say(rowId, t('msg.keyTooLong'), 'error'); return; }
      var patch = which === 'ds' ? { deepseekApiKey: draft } : { apiKey: draft };
      updateNs(remote, viewRef.current, patch, function (err, nv) {
        if (err || !nv) { say(rowId, t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        if (which === 'ds') setDsKeyDraft(''); else setOcgKeyDraft('');
        say(rowId, t('msg.keySaved', { which: which === 'ds' ? 'DeepSeek' : 'OpenCode Go' }));
      });
    };
    var clearKey = function (which) {
      var rowId = which === 'ds' ? 'dsKey' : 'ocgKey';
      var patch = which === 'ds' ? { deepseekApiKey: '' } : { apiKey: '' };
      updateNs(remote, viewRef.current, patch, function (err, nv) {
        if (err || !nv) { say(rowId, t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say(rowId, t('msg.cleared'));
      });
    };

    var saveRefresh = function () {
      var v = Number(refreshDraft);
      if (!isFinite(v) || v <= 0) { say('interval', t('msg.invalidMinutes'), 'error'); return; }
      updateNs(remote, viewRef.current, { refreshMinutes: v }, function (err, nv) {
        if (err || !nv) { say('interval', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('interval', t('msg.intervalSet', { n: nsValue(nv).refreshMinutes }));
      });
    };

    var toggleWidget = function () {
      updateNs(remote, viewRef.current, { widgetVisible: !(!!value.widgetVisible) }, function (err, nv) {
        if (err || !nv) { say('widget', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('widget', nsValue(nv).widgetVisible ? t('msg.widgetShown') : t('msg.widgetHidden'));
      });
    };

    // 浮窗上是否显示 DeepSeek 余额（关掉后只留 OCG 三组环，浮窗变窄）
    // 侧栏入口：开关只控制「侧栏那一行」是否注册；主面板（main）常驻，隐藏行时不影响
    var toggleSidebarEntry = function () {
      var next = !(value.sidebarEntry === true);
      updateNs(remote, viewRef.current, { sidebarEntry: next }, function (err, nv) {
        if (err || !nv) { say('sidebar', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        if (props.sidebarApi && props.sidebarApi.apply) props.sidebarApi.apply(nsValue(nv).sidebarEntry === true);
        say('sidebar', nsValue(nv).sidebarEntry === true ? t('msg.sidebarOn') : t('msg.sidebarOff'));
      });
    };
    var toggleBalance = function () {
      updateNs(remote, viewRef.current, { showBalance: !(value.showBalance !== false) }, function (err, nv) {
        if (err || !nv) { say('balance', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('balance', nsValue(nv).showBalance === false ? t('msg.balanceHidden') : t('msg.balanceShown'));
      });
    };

    // 极简模式：三环嵌套（R/W/M）+ 环心余额；关掉即回「余额 + 三颗独立圆环」
    var toggleMinimal = function () {
      updateNs(remote, viewRef.current, { minimalMode: !(value.minimalMode === true) }, function (err, nv) {
        if (err || !nv) { say('minimal', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('minimal', nsValue(nv).minimalMode === true ? t('msg.minimalOn') : t('msg.minimalOff'));
      });
    };

    // 切换用量进度口径（已使用 / 剩余）：数字即时反转，无需刷新
    var setMode = function (m) {
      if (modeOf(value) === m) return;
      updateNs(remote, viewRef.current, { percentMode: m }, function (err, nv) {
        if (err || !nv) { say('mode', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
      });
    };

    // 切换配额参考模型（只影响折算显示，不触网）
    var setQuotaModel = function (id) {
      var next = String(id || '');
      if (String(value.quotaRefModel || '') === next) return;
      updateNs(remote, viewRef.current, { quotaRefModel: next }, function (err, nv) {
        if (err || !nv) { say('quota', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
      });
    };

    // 切换计价币种（auto / cny / usd）
    var setCurrency = function (m) {
      if (String(value.currencyMode || 'auto') === m) return;
      updateNs(remote, viewRef.current, { currencyMode: m }, function (err, nv) {
        if (err || !nv) { say('currency', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
      });
    };

    // 浮窗左侧余额数据来源（deepseek / quota）
    var setPillSrc = function (v) {
      if (String(value.pillBalanceSource || 'deepseek') === v) return;
      updateNs(remote, viewRef.current, { pillBalanceSource: v }, function (err, nv) {
        if (err || !nv) { say('pillSrc', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('pillSrc', v === 'quota' ? t('msg.pillSrcQuota') : t('msg.pillSrcDeepseek'));
      });
    };
    // 悬停浮层两段余额的显隐（都不选 = 只留进度条）
    var tipDataMsg = function (v) {
      var list = [];
      if (v.tipShowBalance !== false) list.push(t('tip.chkDeepseek'));
      if (v.tipShowQuota !== false) list.push(t('tip.chkQuota'));
      return list.length ? t('msg.tipData', { list: list.join(isZhLocale(t) ? '、' : ', ') }) : t('msg.tipDataNone');
    };
    var toggleTipBalance = function () {
      updateNs(remote, viewRef.current, { tipShowBalance: !(value.tipShowBalance !== false) }, function (err, nv) {
        if (err || !nv) { say('tipData', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('tipData', tipDataMsg(nsValue(nv)));
      });
    };
    var toggleTipQuota = function () {
      updateNs(remote, viewRef.current, { tipShowQuota: !(value.tipShowQuota !== false) }, function (err, nv) {
        if (err || !nv) { say('tipData', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('tipData', tipDataMsg(nsValue(nv)));
      });
    };

    var resetPos = function () {
      updateNs(remote, viewRef.current, DEFAULT_ANCHORS, function (err, nv) {
        if (err || !nv) { say('pos', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('pos', t('msg.posReset'));
      });
    };

    // 一键恢复默认设置（区块右下角按钮）：口径 / 间隔 / 极简 / 余额 / 位置 一次写回
    var resetAll = function () {
      var patch = {
        percentMode: 'used',
        refreshMinutes: 5,
        minimalMode: true,
        showBalance: false,
        widgetVisible: true,
        quotaRefModel: 'deepseek-v4.1-flash',
        currencyMode: 'auto',
        pillBalanceSource: 'deepseek',
        tipShowBalance: true,
        tipShowQuota: true,
        widgetAnchorX: DEFAULT_ANCHORS.widgetAnchorX,
        widgetOffsetX: DEFAULT_ANCHORS.widgetOffsetX,
        widgetAnchorY: DEFAULT_ANCHORS.widgetAnchorY,
        widgetOffsetY: DEFAULT_ANCHORS.widgetOffsetY
      };
      updateNs(remote, viewRef.current, patch, function (err, nv) {
        if (err || !nv) { say('resetAll', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        setRefreshDraft(String(nsValue(nv).refreshMinutes || 5));
        say('resetAll', t('msg.resetAllDone'));
      });
    };

    var statusText = function (s) {
      if (s === 'auto') return t('status.auto');
      if (s === 'manual') return t('status.manual');
      if (s === 'loading') return t('status.loading');
      return t('status.missing');
    };
    var badgeTone = function (s) { return (s === 'auto' || s === 'manual') ? 'ok' : (s === 'loading' ? '' : 'warn'); };
    var dsKeyStatus = value.balanceKeyStatus || 'loading';
    var ocgKeyStatus = value.keyStatus || 'loading';
    var hasData = !!value.lastUpdated;
    var ax = typeof value.widgetAnchorX === 'string' ? value.widgetAnchorX : DEFAULT_ANCHORS.widgetAnchorX;
    var ay = typeof value.widgetAnchorY === 'string' ? value.widgetAnchorY : DEFAULT_ANCHORS.widgetAnchorY;
    var isDefaultPos = DEFAULT_ANCHORS.widgetAnchorX === ax && DEFAULT_ANCHORS.widgetAnchorY === ay
      && value.widgetOffsetX === DEFAULT_ANCHORS.widgetOffsetX && value.widgetOffsetY === DEFAULT_ANCHORS.widgetOffsetY;
    var refreshMinutes = value.refreshMinutes || 5;
    // 当前进度口径：left（剩余，默认）/ used（已使用）
    var mode = modeOf(value);

    // keyHint 形如 "sk-****5590（DEEPSEEK_API_KEY）"，页面里只取掩码本身，避免括号套括号
    var masked = function (h) { return String(h || '').split('（')[0].trim() || t('status.missing'); };
    // 样式表在 CSS 常量里（.ocgu-btn / .ocgu-input / .ocgu-msg / .ocgu-card / .ocgu-badge …），
    // 这里只留必须按状态现算的内联项；hover / active / focus 交给 CSS（内联样式写不了伪类）。
    var refreshMsg = msgOf('refresh');
    var winList = WINDOWS.map(function (w) {
      return React.createElement(UsageRow, {
        key: w.key, label: t('float.groupTitle', { win: winName(w, t), mini: w.mini }), win: windowOf(usage, w.key), mode: mode, t: t
      });
    });

    // ── 标签页与控件助手 ──
    var tabState = React.useState('usage');
    var tab = tabState[0], setTab = tabState[1];
    var tabButton = function (id, key) {
      return React.createElement('button', {
        key: id, type: 'button', className: 'ocgu-seg-item', role: 'tab',
        'aria-selected': tab === id ? 'true' : 'false', 'data-on': tab === id ? '1' : '0',
        onClick: function () { setTab(id); }
      }, t(key));
    };
    // 开关控件（照抄宿主实现）：disabled 时按钮禁用，整行另由 data-disabled 变灰
    var sw = function (on, onToggle, label, disabled) {
      return React.createElement('button', {
        key: 'sw', type: 'button', className: 'ocgu-switch',
        role: 'switch', 'aria-checked': on ? 'true' : 'false', 'aria-label': label,
        disabled: !!disabled, onClick: disabled ? undefined : onToggle
      }, React.createElement('span', { className: 'ocgu-thumb' }));
    };
    var openConsole = function () {
      try { window.open('https://opencode.ai/console', '_blank', 'noopener'); } catch (e) { /* 打不开不影响其它功能 */ }
    };
    // 配额 / 币种：本页与浮层共用同一套计算（quotaSetLine / quotaTipLines 在模块作用域）
    var qSet = quotaSetLine(value, t);
    var qInfo = quotaOf(value);
    var modelList = goModelList(value);
    var errList = fetchErrors(value, t);
    var errText = errList.length ? t('err.prefix') + errList.join(isZhLocale(t) ? '、' : ', ') : '';
    var curButton = function (m, key) {
      var on = String(value.currencyMode || 'auto') === m;
      return React.createElement('button', {
        key: m, type: 'button', className: 'ocgu-seg-item', role: 'radio',
        'aria-checked': on ? 'true' : 'false', 'data-on': on ? '1' : '0',
        onClick: function () { setCurrency(m); }
      }, t(key));
    };
    // 悬停浮层余额数据的下拉摘要（如「DS余额 + OCG配额剩余」/「都不显示」）
    var tipDataNames = [];
    if (value.tipShowBalance !== false) tipDataNames.push(t('pill.srcDeepseek'));
    if (value.tipShowQuota !== false) tipDataNames.push(t('pill.srcQuota'));
    var tipDataSummary = tipDataNames.length ? tipDataNames.join(' + ') : t('tip.ddNone');
    // 浮窗左侧余额数据来源的二选一按钮（同一套小号分段样式）
    var pillSrcButton = function (v, key) {
      var on = String(value.pillBalanceSource || 'deepseek') === v;
      return React.createElement('button', {
        key: v, type: 'button', className: 'ocgu-seg-item', role: 'radio',
        'aria-checked': on ? 'true' : 'false', 'data-on': on ? '1' : '0',
        onClick: function () { setPillSrc(v); }
      }, t(key));
    };
    var openRepo = function () {
      try { window.open('https://github.com/verneuil/dsh-opencode-go-usage', '_blank', 'noopener'); } catch (e) { /* 同上 */ }
    };
    // GitHub 官方 mark（16×16，用 currentColor 跟随主题）
    var githubIcon = function () {
      return React.createElement('svg', {
        width: '16', height: '16', viewBox: '0 0 16 16', 'aria-hidden': 'true', focusable: 'false', fill: 'currentColor'
      }, React.createElement('path', {
        d: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z'
      }));
    };
    // OpenCode 官方 favicon（opencode.ai/favicon.svg，512×512 原样缩到 18×18）
    var opencodeIcon = function () {
      return React.createElement('svg', {
        width: '18', height: '18', viewBox: '0 0 512 512', 'aria-hidden': 'true', focusable: 'false'
      },
        React.createElement('rect', { width: '512', height: '512', fill: '#131010' }),
        React.createElement('path', { d: 'M320 224V352H192V224H320Z', fill: '#5A5858' }),
        React.createElement('path', {
          fillRule: 'evenodd', clipRule: 'evenodd',
          d: 'M384 416H128V96H384V416ZM320 160H192V352H320V160Z', fill: '#ffffff'
        }));
    };

    return React.createElement('div', { style: { padding: '4px 0 20px' } },
      React.createElement('div', { className: 'ocgu-title-row' },
        React.createElement('div', { className: 'ocgu-sec' }, t('settings.title')),
        React.createElement('button', {
          className: 'ocgu-iconbtn', onClick: openRepo,
          title: t('aria.github'), 'aria-label': t('aria.github')
        }, githubIcon()),
        // 版本号：宿主把 UA 里的版本写进配置投影，客户端只读
        value.pluginVersion
          ? React.createElement('span', { className: 'ocgu-ver', title: 'dsh-opencode-go-usage v' + value.pluginVersion },
            'v' + value.pluginVersion)
          : null),
      React.createElement('div', { className: 'ocgu-hint', style: { marginTop: '4px' } },
        t('settings.intro')),
      // ── 标签栏（左：用量 / 通用 / 悬浮窗）＋ 常驻「恢复默认设置」（最右）──
      React.createElement('div', { className: 'ocgu-tabs' },
        React.createElement('div', { className: 'ocgu-seg', role: 'tablist', 'aria-label': t('aria.tabs') },
          tabButton('usage', 'tab.usage'),
          tabButton('widget', 'tab.widget'),
          tabButton('general', 'tab.general')),
        React.createElement('span', {
          className: 'ocgu-msg', 'data-tone': msgOf('resetAll') ? toneOf('resetAll') : 'muted',
          role: 'status', 'aria-live': 'polite', title: msgOf('resetAll') || ''
        }, msgOf('resetAll')),
        // 侧栏入口开关：三个标签右边、「恢复默认设置」左边；宿主不支持该槽位时不显示
        props.sidebarApi && props.sidebarApi.supported ? React.createElement('div', { className: 'ocgu-tabs-toggle' },
          React.createElement('span', { className: 'ocgu-tabs-label' }, t('field.sidebarEntry')),
          sw(value.sidebarEntry === true, toggleSidebarEntry, t('field.sidebarEntry'), false)) : null,
        React.createElement('button', {
          className: 'ocgu-btn', 'data-kind': 'outline', onClick: resetAll, title: t('title.resetAll')
        }, t('btn.resetAll'))),

      // ── 标签一：用量（用量详情 + 官网入口 + 自动刷新间隔 + 手动刷新）──
      tab === 'usage' ? React.createElement('div', null,
      // 标题行：标题 + 紧跟其后的 OpenCode 官方图标（左对齐，不靠右）
      React.createElement('div', { className: 'ocgu-subrow' },
        React.createElement('div', { className: 'ocgu-sub', style: { flex: '0 1 auto' } }, t('settings.usageTitle')),
        React.createElement('button', {
          className: 'ocgu-iconbtn', onClick: openConsole,
          title: t('title.console'), 'aria-label': t('title.console')
        }, opencodeIcon())),
      // 配额参考模型选择（位于「用量详情」标题与进度条卡片之间）
      React.createElement(FieldRow, {
        title: t('quota.pick'),
        hint: quotaModelHint(value, t),
        msg: msgOf('quota'),
        tone: toneOf('quota'),
        nowrap: true,
        control: [
          React.createElement('select', {
            key: 'sel', className: 'ocgu-select', value: qInfo.id,
            onChange: function (e) { setQuotaModel(e.target.value); },
            'aria-label': t('quota.pick')
          }, modelList.length
            ? modelList.map(function (m) {
              return React.createElement('option', { key: m.id, value: m.id }, m.name);
            })
            : [React.createElement('option', { key: 'none', value: qInfo.id }, t('quota.loading'))])
        ]
      }),
      // 金额显示计价币种（紧跟在配额参考模型选择下方）：小号分段控件 = 自动 / ¥ 人民币 / ＄ 美元
      React.createElement(FieldRow, {
        title: t('field.currency'),
        hint: fxHint(value, t),
        msg: msgOf('currency'),
        tone: toneOf('currency'),
        nowrap: true,
        control: [
          React.createElement('span', {
            key: 'seg', className: 'ocgu-seg', role: 'radiogroup',
            'aria-label': t('field.currency'), title: t('cur.autoHint')
          }, curButton('auto', 'cur.auto'), curButton('cny', 'cur.cny'), curButton('usd', 'cur.usd'))
        ]
      }),
      // 套餐配额：标题照搬字段标题样式，下面一行小字
      React.createElement('div', { className: 'ocgu-qset', title: quotaSrcHint(value, t) },
        React.createElement('div', { className: 'ocgu-field-title' }, t('quota.title')),
        React.createElement('div', { className: 'ocgu-hint' }, qSet)),
      React.createElement('div', { className: 'ocgu-card', style: { marginTop: '10px' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
          React.createElement('span', { className: 'ocgu-badge', 'data-tone': badgeTone(ocgKeyStatus) }, statusText(ocgKeyStatus)),
          React.createElement('span', { className: 'ocgu-hint' }, value.keyHint || 'OPENCODE_GO_API_KEY'),
          // 切换失败时的提示落点（隐形提示等于没有提示）
          React.createElement('span', {
            className: 'ocgu-msg', 'data-tone': msgOf('mode') ? toneOf('mode') : 'muted', role: 'status', 'aria-live': 'polite',
            title: msgOf('mode') || '', style: { marginLeft: 'auto' }
          }, msgOf('mode')),
          // 进度口径二选一（已使用 / 剩余）：贴卡片右上角
          React.createElement('span', {
            className: 'ocgu-seg', role: 'radiogroup', 'aria-label': t('aria.mode')
          },
            React.createElement('button', {
              type: 'button', className: 'ocgu-seg-item', role: 'radio',
              'aria-checked': mode === 'used' ? 'true' : 'false', 'data-on': mode === 'used' ? '1' : '0',
              onClick: function () { setMode('used'); }
            }, t('mode.used')),
            React.createElement('button', {
              type: 'button', className: 'ocgu-seg-item', role: 'radio',
              'aria-checked': mode === 'left' ? 'true' : 'false', 'data-on': mode === 'left' ? '1' : '0',
              onClick: function () { setMode('left'); }
            }, t('mode.left')))),
        winList,
        React.createElement('div', { className: 'ocgu-hint', style: { marginTop: '6px' } },
          t(mode === 'used' ? 'settings.cardHintUsed' : 'settings.cardHint')),
        value.usageError ? React.createElement('div', { className: 'ocgu-err' }, value.usageError) : null),
      // 进度条下方第一行：手动刷新 + 更新时间（时间→提示的替换规则不变：3 秒后回落到「上次更新」）
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }
      },
        // 抓取失败点名报错：手动刷新按钮左侧
        errText ? React.createElement('span', {
          className: 'ocgu-errline', role: 'status', 'aria-live': 'polite', title: errText
        }, errText) : null,
        React.createElement('span', {
          className: 'ocgu-msg',
          'data-tone': refreshMsg ? toneOf('refresh') : 'muted',
          role: 'status', 'aria-live': 'polite',
          title: refreshMsg || ''
        }, refreshMsg || (hasData
          ? t('settings.lastUpdated', { time: fmtTime(value.lastUpdated), rel: fmtRelative(value.lastUpdated, t) })
          : t('settings.lastUpdatedEmpty'))),
        React.createElement('button', {
          onClick: refresh, disabled: loading, className: 'ocgu-btn', 'data-kind': 'link', 'data-accent': '1',
          title: t('settings.refreshTitle')
        }, loading ? t('settings.refreshing') : t('settings.manualRefresh'))),
      // 再下面：自动刷新间隔
      React.createElement(FieldRow, {
        title: t('field.interval'),
        hint: t('field.interval.hint', { n: refreshMinutes }),
        msg: msgOf('interval'),
        tone: toneOf('interval'),
        control: [
          React.createElement('input', {
            key: 'n', type: 'number', min: '0.5', step: '0.5', className: 'ocgu-input',
            value: refreshDraft,
            onChange: function (e) { setRefreshDraft(e.target.value); },
            style: { flex: 'none', width: '96px' },
            'aria-label': t('field.interval.aria')
          }),
          React.createElement('span', { key: 'u', className: 'ocgu-hint' }, t('unit.minute')),
          React.createElement('button', {
            key: 'b', onClick: saveRefresh, className: 'ocgu-btn', 'data-kind': 'outline'
          }, t('btn.save'))
        ],
        nowrap: true
      }),

      ) : null,

      // ── 标签三：Key 管理（两把 Key）──
      tab === 'general' ? React.createElement('div', null,
      React.createElement('div', { className: 'ocgu-sub' }, t('settings.section')),
      ) : null,

      // ── 标签三：悬浮窗（总开关 + 三项；总开关关闭后三项变灰且不可操作）──
      tab === 'widget' ? React.createElement('div', null,
        React.createElement('div', { className: 'ocgu-sub' }, t('tab.widget')),
        React.createElement(FieldRow, {
          title: t('field.widget.master'),
          hint: value.widgetVisible
            ? t('field.widget.shown', { anchor: anchorLabel(ax, ay, t) })
            : t('field.widget.hidden'),
          msg: msgOf('widget'),
          tone: toneOf('widget'),
          nowrap: true,
          control: [sw(value.widgetVisible === true, toggleWidget, t('aria.widget'), false)]
        }),
        // ① 浮窗左侧余额总开关：关闭后下一项一并收起
        React.createElement(FieldRow, {
          title: t('field.pillBalance'),
          hint: t('field.pillBalance.hint'),
          msg: msgOf('balance'),
          tone: toneOf('balance'),
          nowrap: true,
          disabled: !value.widgetVisible,
          control: [sw(value.showBalance !== false, toggleBalance, t('field.pillBalance'), !value.widgetVisible)]
        }),
        // ② 浮窗左侧余额数据来源（二选一，样式与「金额显示计价币种」一致）
        React.createElement(FieldRow, {
          title: t('field.pillBalanceSrc'),
          hint: t('field.pillBalanceSrc.hint'),
          msg: msgOf('pillSrc'),
          tone: toneOf('pillSrc'),
          nowrap: true,
          disabled: !value.widgetVisible || value.showBalance === false,
          control: [
            React.createElement('span', {
              key: 'seg', className: 'ocgu-seg', role: 'radiogroup',
              'aria-label': t('field.pillBalanceSrc')
            }, pillSrcButton('deepseek', 'pill.srcDeepseek'), pillSrcButton('quota', 'pill.srcQuota'))
          ]
        }),
        // ③ 鼠标悬停浮层的余额数据：下拉多选（两个都不勾则只留进度条），避免横向占位
        React.createElement(FieldRow, {
          title: t('field.tipBalanceSrc'),
          hint: t('field.tipBalanceSrc.hint'),
          msg: msgOf('tipData'),
          tone: toneOf('tipData'),
          nowrap: true,
          disabled: !value.widgetVisible,
          control: [
            React.createElement('details', { key: 'dd', className: 'ocgu-dd', ref: ddRef },
              React.createElement('summary', { className: 'ocgu-dd-sum' }, tipDataSummary),
              React.createElement('div', { className: 'ocgu-dd-panel' },
                React.createElement('label', {
                  className: 'ocgu-dd-item', title: t('pill.srcDeepseek')
                },
                  React.createElement('input', {
                    type: 'checkbox', checked: value.tipShowBalance !== false,
                    onChange: toggleTipBalance, 'aria-label': t('pill.srcDeepseek')
                  }),
                  t('pill.srcDeepseek')),
                React.createElement('label', {
                  className: 'ocgu-dd-item', title: t('pill.srcQuota')
                },
                  React.createElement('input', {
                    type: 'checkbox', checked: value.tipShowQuota !== false,
                    onChange: toggleTipQuota, 'aria-label': t('pill.srcQuota')
                  }),
                  t('pill.srcQuota'))))
          ]
        }),
        React.createElement(FieldRow, {
          title: t('field.minimal'),
          hint: t('title.minimal'),
          msg: msgOf('minimal'),
          tone: toneOf('minimal'),
          nowrap: true,
          disabled: !value.widgetVisible,
          control: [sw(value.minimalMode === true, toggleMinimal, t('label.minimal'), !value.widgetVisible)]
        }),
        React.createElement(FieldRow, {
          title: t('field.pos'),
          hint: t('title.resetPos'),
          msg: msgOf('pos'),
          tone: toneOf('pos'),
          nowrap: true,
          disabled: !value.widgetVisible,
          control: [React.createElement('button', {
            key: 'pos', onClick: resetPos, disabled: isDefaultPos || !value.widgetVisible,
            className: 'ocgu-btn', 'data-kind': 'outline', title: t('title.resetPos')
          }, isDefaultPos ? t('btn.atDefault') : t('btn.resetPos'))]
        })) : null,

      // 通用标签续（两把 Key 仍属「通用」）
      tab === 'general' ? React.createElement('div', null,
      React.createElement(FieldRow, {
        layout: 'block',
        title: t('field.dsKey'),
        hint: t('field.dsKey.hint', { mask: masked(value.balanceKeyHint) }),
        error: value.balanceError || '',
        msg: msgOf('dsKey'),
        tone: toneOf('dsKey'),
        badge: React.createElement('span', {
          className: 'ocgu-badge', 'data-tone': badgeTone(dsKeyStatus)
        }, statusText(dsKeyStatus)),
        control: [
          React.createElement('input', {
            key: 'i', type: 'password', placeholder: t('ph.key'), className: 'ocgu-input',
            value: dsKeyDraft,
            onChange: function (e) { setDsKeyDraft(e.target.value); },
            'aria-label': 'DeepSeek API Key'
          }),
          React.createElement('button', {
            key: 's', onClick: function () { saveKey('ds'); }, className: 'ocgu-btn', 'data-kind': 'outline'
          }, t('btn.save')),
          React.createElement('button', {
            key: 'c', onClick: function () { clearKey('ds'); }, className: 'ocgu-btn', 'data-kind': 'link'
          }, t('btn.clear'))
        ],
        nowrap: true
      }),
      React.createElement(FieldRow, {
        layout: 'block',
        title: t('field.ocgKey'),
        hint: t('field.ocgKey.hint', { mask: masked(value.keyHint) }),
        msg: msgOf('ocgKey'),
        tone: toneOf('ocgKey'),
        badge: React.createElement('span', {
          className: 'ocgu-badge', 'data-tone': badgeTone(ocgKeyStatus)
        }, statusText(ocgKeyStatus)),
        control: [
          React.createElement('input', {
            key: 'i', type: 'password', placeholder: t('ph.key'), className: 'ocgu-input',
            value: ocgKeyDraft,
            onChange: function (e) { setOcgKeyDraft(e.target.value); },
            'aria-label': 'OpenCode Go API Key'
          }),
          React.createElement('button', {
            key: 's', onClick: function () { saveKey('ocg'); }, className: 'ocgu-btn', 'data-kind': 'outline'
          }, t('btn.save')),
          React.createElement('button', {
            key: 'c', onClick: function () { clearKey('ocg'); }, className: 'ocgu-btn', 'data-kind': 'link'
          }, t('btn.clear'))
        ],
        nowrap: true
      }),
      ) : null);
  }

  // ---------- 挂载 ----------
  function apply(ctx) {
    // 装配方式遵循官方插件规范：
    // · 席位贡献用 ctx.slots.inject(ownerKey, () => ctx.slots.register(...))（见下方两处），
    //   官方原文：“Contribute through slots: ctx.slots.inject(ownerKey, () => ctx.slots.register(...))”；
    // · slots 服务由插件对象的 inject: ['slots'] 声明，宿主保证 apply 时它已就绪（官方模板同款写法）；
    // · locale（文案服务）与 remote（配置投影服务）都不声明为硬注入：它们可能晚于 apply 就绪，
    //   缺失时应保留回退与重试（中文兜底 + 阶梯重试），而不是让整条目弃权。
    var mounted = false;
    var localeSvc = null;
    var remoteOf = function () {
      var remote = ctx.get('remote');
      var settings = ctx.get('remote.settings');
      if (!remote || typeof remote !== 'object' || typeof remote.$on !== 'function') return null;
      if (!settings || typeof settings !== 'object' || typeof settings.describe !== 'function' || typeof settings.update !== 'function') return null;
      return { $on: remote.$on.bind(remote), settings: settings };
    };
    // 注册中英字典 —— 官方外部客户端插件写法：ctx.locale.register(ns, localeId, dict)。
    // 🚩 语言服务必须在 inject 里声明（官方 README：`export const inject = ['locale']`）：
    // 漏声明时 ctx.get('locale') 取不到服务 → 所有文案静默退回内置中文（英文界面全变中文的根因）。
    // 官方原文：“A dictionary registered after the UI is already mounted is picked up without a remount.”
    // （所以这里早注册一次、挂载时再确认一次，两条路径都安全）
    var ensureLocale = function () {
      if (localeSvc) return localeSvc;
      var l = (ctx.locale && typeof ctx.locale.register === 'function') ? ctx.locale : ctx.get('locale');
      if (!l || typeof l.register !== 'function') return null;
      localeSvc = l;
      // 官方主推的对象形式一次注册两门语言；个别实现只支持逐语言三参形式，故保留回退。
      // 🚩 语言服务必须在 inject 里声明（官方 README：`export const inject = ['locale']`）：
      // 漏声明时 ctx.get('locale') 取不到服务 → 所有文案静默退回内置中文（英文界面全变中文的根因）。
      // 官方原文：“A dictionary registered after the UI is already mounted is picked up without a remount.”
      // （所以这里早注册一次、挂载时再确认一次，两条路径都安全）
      try {
        ctx.effect(function () { return l.register(LOCALE_NS, { zh: I18N.zh, en: I18N.en }); });
      } catch (e) {
        try { ctx.effect(function () { return l.register(LOCALE_NS, 'zh', I18N.zh); }); } catch (e2) { /* 已注册则忽略 */ }
        try { ctx.effect(function () { return l.register(LOCALE_NS, 'en', I18N.en); }); } catch (e3) { /* 已注册则忽略 */ }
      }
      return l;
    };
    // 翻译护栏：框架查不到词条时会「原样返回 key」，这里统一兜底到内置中文 ——
    // 覆盖「语言服务缺失」「某语言缺词条」两种情形，界面永不出现键名残留。
    var guardT = function (f) {
      if (typeof f !== 'function') return tZh;
      return function (key, params) {
        var v = null;
        try { v = f(key, params); } catch (e) { v = null; }
        if (v === null || v === undefined || v === key) return tZh(key, params);
        return v;
      };
    };
    // slot label 用函数形式，跟随语言切换重新求值
    //（官方 agent-presets 页同款写法：label: () => ctx.locale.bind(ns)('nav')）
    var navLabel = function (key) {
      var l = localeSvc;
      if (l && typeof l.bind === 'function') {
        try { return guardT(l.bind(LOCALE_NS))(key); } catch (e) { /* 取不到就回退中文 */ }
      }
      return tZh(key);
    };
    // 组件用的 t：优先用框架注入的席位（它订阅语言变化 → 切换语言立刻重渲染）；
    // 若该席位没被注入（p.t 为空），回退到我们自己 bind 出来的翻译函数（下次渲染即生效），
    // 都没有则回退内置中文 —— 三种情况下界面都不会出现键名残留。
    var currentT = function () {
      var l = localeSvc;
      if (l && typeof l.bind === 'function') {
        try { return guardT(l.bind(LOCALE_NS)); } catch (e) { /* 回退中文 */ }
      }
      return tZh;
    };
    var mount = function () {
      if (mounted) return true;
      var slots = ctx.get('slots');
      var remote = remoteOf();
      // slots 由 inject: ['slots'] 保证已就绪；remote 可能仍在组合后期 —— 未就绪时交给下面的
      // 阶梯重试，不要挂出一个读不到数据的空壳。
      if (!slots || !remote) return false;
      mounted = true;
      var locale = ensureLocale();

      ctx.effect(function () {
        var tag = document.createElement('style');
        tag.setAttribute('data-plugin', 'opencode-go-usage');
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return function () { if (tag.parentNode) tag.parentNode.removeChild(tag); };
      });

      // 给设置导航里属于本插件的行打标记（CSS 据此隐藏默认齿轮并画上自己的图标）。
      // 只按导航行的文本匹配本插件的两种语言标题，匹配不到就静默跳过 —— 不影响任何功能。
      ctx.effect(function () {
        var titles = [I18N.zh['settings.title'], I18N.en['settings.title']];
        var mark = function () {
          try {
            var rows = document.querySelectorAll('[role="dialog"] nav button');
            for (var i = 0; i < rows.length; i++) {
              var el = rows[i];
              var txt = (el.textContent || '').trim();
              if (titles.indexOf(txt) < 0) continue;
              if (el.getAttribute('data-ocgu-nav') !== '1') el.setAttribute('data-ocgu-nav', '1');
            }
          } catch (e) { /* DOM 结构变化时忽略：图标缺失不影响功能 */ }
        };
        mark();
        if (typeof MutationObserver !== 'function') return function () { };
        var pending = false;
        var mo = new MutationObserver(function () {
          if (pending) return;
          pending = true;
          setTimeout(function () { pending = false; mark(); }, 120);
        });
        mo.observe(document.body, { childList: true, subtree: true });
        return function () { mo.disconnect(); };
      });

      // 席位元数据：locale 就绪时带上 locale: NS —— slot 会把框架注入的 t 席位交给组件；
      // 未就绪时组件用内置中文兜底（tZh），功能不受影响。
      var meta = function (name, id, order, labelKey) {
        var m = { name: name, id: id, order: order, label: function () { return navLabel(labelKey); } };
        if (locale) m.locale = LOCALE_NS;
        return m;
      };

      // 官方为浮层保留的席位：shell.overlay（Frame-wide floating layer，replaceRisk none，
      // 官方原文：“a badge, a toast stack or a status pill all belong here”）。
      // 用自有 id 注册 —— 新 id 是「加在既有条目旁边」，不会替换任何官方条目。
      slots.inject('shell.overlay', function () {
        return slots.register(
          meta('shell.overlay', 'opencode-go-usage-float', 30, 'label.float'),
          function (p) { return React.createElement(UsageFloat, Object.assign({}, p, { remote: remoteOf() || remote, t: guardT(p.t || currentT()) })); }
          // （remoteOf() 每次渲染重取：客户端服务在宿主热更新后会被替换，闭包捕获会读到失效实例）
        );
      });
      // 设置页：菜单名「OCG 余量查询」/「OCG Usage」
      // ── 侧栏入口（与 dshmarket 同款官方契约）：
      //    main 面板 = 整页内容（页面常驻注册）；sidebar.panellist = 侧栏那一行（受设置开关控制）。
      //    设置对话框状态属于宿主私有，无法程序化跳转，所以「整页」是唯一的官方一键入口。
      var sidebarApi = { supported: false, want: false };
      var sidebarRowOff = null;
      function sidebarSync() {
        var shouldShow = sidebarApi.supported && sidebarApi.want;
        if (shouldShow && !sidebarRowOff) {
          try {
            var rowMeta = { name: 'sidebar.panellist', id: 'opencode-go-usage', order: 31, label: function () { return navLabel('settings.title'); } };
            if (locale) rowMeta.locale = LOCALE_NS;
            var off = slots.register(rowMeta, function (owner) {
              return React.createElement(SidebarLogo, { size: (owner && owner.size) || 16 });
            });
            sidebarRowOff = (typeof off === 'function') ? off : function () { };
          } catch (e) { sidebarApi.supported = false; }
        } else if (!shouldShow && sidebarRowOff) {
          try { sidebarRowOff(); } catch (e) { /* 注销失败不影响主流程 */ }
          sidebarRowOff = null;
        }
      }
      sidebarApi.apply = function (on) { sidebarApi.want = on === true; sidebarSync(); };
      // 能力探测：宿主声明了该槽位才会回调（旧宿主不会，开关因此不出现）
      slots.inject('sidebar.panellist', function () {
        sidebarApi.supported = true;
        sidebarSync();
        return function () { sidebarApi.supported = false; sidebarSync(); };
      });
      // 整页面板：内容直接复用设置页组件（同一套 UI，零重复实现）
      slots.inject('main', function () {
        var pageMeta = { name: 'main', key: 'opencode-go-usage' };
        if (locale) pageMeta.locale = LOCALE_NS;
        return slots.register(pageMeta, function (ownerProps) {
          return React.createElement(SidebarPage, Object.assign({}, ownerProps, {
            remote: remoteOf() || remote, t: guardT(ownerProps.t || currentT()), sidebarApi: sidebarApi
          }));
        });
      });
      // 启动时按已保存的开关决定是否注册侧栏行（投影可能稍后就绪，短轮询几次即可）
      (function initSidebarRow() {
        var tries = 0;
        var timer = null;
        var step = function () {
          tries += 1;
          readNs(remote).then(function (nv) {
            var v = nsValue(nv) || {};
            if (v.sidebarEntry !== undefined) { sidebarApi.apply(v.sidebarEntry === true); return; }
            if (tries < 40) timer = setTimeout(step, 250);
          }).catch(function () { if (tries < 40) timer = setTimeout(step, 250); });
        };
        step();
        ctx.effect(function () { return function () { if (timer !== null) clearTimeout(timer); }; });
      })();
      slots.inject('settings.section', function () {
        return slots.register(
          meta('settings.section', 'opencode-go-usage', 31, 'settings.title'),
          function (p) { return React.createElement(SettingsPage, Object.assign({}, p, { remote: remoteOf() || remote, t: guardT(p.t || currentT()), sidebarApi: sidebarApi })); }
        );
      });
      return true;
    };
    ensureLocale();
    if (mount()) return;
    var tries = 0;
    var timer = null;
    var poll = function () {
      if (mount()) return;
      tries += 1;
      if (tries >= 40) return;
      timer = setTimeout(poll, 250);
    };
    poll();
    ctx.effect(function () { return function () { if (timer !== null) clearTimeout(timer); }; });
  }

  // 客户端 inject：remote.settings 显式声明（官方写法），ctx.get 兜底保留，双保险。
  module.exports = { name: 'opencode-go-usage', inject: ['slots', 'locale', 'remote', 'remote.settings'], apply: apply };
  return module.exports;
}});
