window.__ModuleLoader__.load({ id: 'dsh-opencode-go-usage', factory: (require) => {
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
  // 「更新中」光轨的层参数（供下面的 CSS 生成，省掉一堆几乎一样的手写规则）：
  // 每层 = [弧长(周长千分比), 透明度, 线宽]，「越短越亮」→ 叠加出指数衰减的尾焰；
  // 主轨 A 尾焰 270/1000（占周长 27%）；末端透明度压到 0.10 让它「化掉」而不是一刀切断（那正是「一条长线」的观感）。
  var RAIL_A_LAYERS = [[270, 0.1, 1], [215, 0.16, 1.02], [168, 0.25, 1.04], [126, 0.36, 1.06], [90, 0.5, 1.08], [58, 0.66, 1.11], [30, 0.84, 1.14]];
  var RAIL_B_LAYERS = [[240, 0.07, 1], [140, 0.11, 1.02], [64, 0.16, 1.05]];
  var RAIL_HEAD_LEN = 26;
  var RAIL_SPARK_LEN = 9;
  function railLayerCss(prefix, layers) {
    var out = '';
    for (var i = 0; i < layers.length; i++) {
      out += '.ocgu-rail-' + prefix + i + '{--ocgu-len:' + layers[i][0] +
        ';stroke-opacity:' + layers[i][1] + ';stroke-width:' + layers[i][2] + '}';
    }
    return out;
  }

  var CSS =
    // 胶囊高度 26px → 30px（行高 16 → 18、上下内边距 4 → 5）：环盒 16 → 20、视觉环 18 → 24，
    // 两位数百分比在环心不拥挤；长宽恒定，任何状态下都不变。
    // 四边净空一致：环视觉 24px（环盒 20px，四向各溢出 2px），padding 4px ⇒ 环到边框处处 2px。
    // border-radius:999px 不是随手写的：胶囊端头是半径 15px 的圆弧，圆心与圆环同心
    // （内缘半径 14px vs 环外缘 12px），所以圆角与圆环弧度平行、整圈间隙均匀 —— 换小圆角反而会啃掉环的净空
    '.ocgu-float{position:fixed;right:24px;bottom:24px;pointer-events:auto;display:inline-flex;align-items:center;gap:0;padding:4px;border-radius:999px;font-size:11px;line-height:18px;color:var(--dsw-alias-label-primary);user-select:none;-webkit-user-select:none;touch-action:none;cursor:pointer;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);transition:border-color .2s ease}' +
    // 悬停提亮不用 --dsw-alias-border-l3（同样不在官方令牌表里），由 border-l2 掺二级文字色派生
    '.ocgu-float:hover{border-color:color-mix(in srgb,var(--dsw-alias-border-l2) 40%,var(--dsw-alias-label-secondary))}' +
    '.ocgu-float[data-dragging="true"]{cursor:grabbing;border-color:var(--dsw-alias-brand-primary)}' +
    '.ocgu-float[data-warn="true"]{border-color:var(--dsw-alias-state-warn-primary)}' +
    // ---------- 更新反馈：细光轨（SVG 描边光带，改它不影响浮窗布局与尺寸） ----------
    // 2.0 之所以像「一段绿线在转圈」：conic 的角度增量在宽胶囊（约 250×26）上到弧长的映射极不均匀——
    // 上下两条长边各吃掉约 170°，中段每度走过的弧长是两端的百倍以上，于是光带「中段飞驰、两端爬行」，
    // 看上去就是一根死板的线在跳。3.0 换成 **SVG 描边光轨**：<rect pathLength="1000"> 把弧长归一化，
    // stroke-dashoffset 随 --ocgu-run 线性推进 → **等弧长匀速**；线宽 2px → 1.15px 发丝级。
    // · 彗尾 = 6 层同心描边（弧长 300→42、越短越亮）叠出指数衰减，再用 0.6px 模糊把台阶揉开；
    //   弹头白热带 drop-shadow 外发光；另有第二道更暗更慢的光轨（1.35s / 2.15s，周期不成整数比），
    //   两光时而并行时而交叠，圈圈不重样。
    // · 完成 / 失败 = 彗尾在弹头当前位置收束成整圈「封环」（dasharray 40→1000，dashoffset 沿用同一个
    //   --ocgu-run，所以是从弹头处继续往前包一圈，而不是跳回起点）+ 0.36s 后一次光晕冲击 + 内壁淡染色，
    //   3 秒后由组件把 phase 归零、整层淡出。
    // 全程只动 --ocgu-run / --ocgu-run2 与 opacity，浮窗长宽恒定不变。
    '@property --ocgu-run{syntax:"<length>";initial-value:0px;inherits:true}' +
    '@property --ocgu-run2{syntax:"<length>";initial-value:0px;inherits:true}' +
    '@keyframes ocgu-run{from{--ocgu-run:0px}to{--ocgu-run:1000px}}' +
    '@keyframes ocgu-run2{from{--ocgu-run2:0px}to{--ocgu-run2:1000px}}' +
    '.ocgu-glow{--ocgu-glow:var(--dsw-alias-state-success-primary);--ocgu-frozen-a:0px;--ocgu-frozen-b:0px;position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;background-color:transparent;transition:opacity .38s ease}' +
    // 更新中：两道不同周期的光轨同时跑。结果相位不保留跑圈动画 —— 相位切换时 Chromium 会重建
    // 动画、--ocgu-run / --ocgu-run2 归零，尾焰会瞬间跳回起点（看着就是「后半段突然一条长线」），
    // 收笔前用 JS 把当前位置读进 --ocgu-frozen-a / -b 冻住（见 UsageFloat.freezeRail）。
    '.ocgu-glow[data-phase="loading"]{opacity:1;animation:ocgu-run 1.35s linear infinite,ocgu-run2 2.15s linear infinite}' +
    '.ocgu-glow[data-phase="ok"]{opacity:1;background-color:color-mix(in srgb,var(--ocgu-glow) 6%,transparent)}' +
    '.ocgu-glow[data-phase="error"]{--ocgu-glow:var(--dsw-alias-state-error-primary);opacity:1;background-color:color-mix(in srgb,var(--ocgu-glow) 6%,transparent)}' +
    // 光轨层：SVG 左/上各外移 1px 对齐 border-box（几何由组件按实测尺寸重算；pathLength 归一化
    // 让尺寸变化只重画几何、不动动画相位）
    '.ocgu-rail{position:absolute;left:-1px;top:-1px;display:block;overflow:visible}' +
    '.ocgu-rail-st{fill:none;stroke-linecap:round;shape-rendering:geometricPrecision;stroke-dasharray:calc(var(--ocgu-len) * 1px) 1000px;stroke-dashoffset:calc(var(--ocgu-len) * 1px - var(--ocgu-run))}' +
    '.ocgu-rail-st.ocgu-rail-b{stroke-dashoffset:calc(var(--ocgu-len) * 1px - var(--ocgu-run2))}' +
    // 结果相位：彗尾冻在收笔位置淡出（辅轨 B 必须一起隐藏：漏掉它会停在起点变成一条常驻长线）
    '.ocgu-glow[data-phase="ok"] .ocgu-rail-st,.ocgu-glow[data-phase="error"] .ocgu-rail-st{stroke-dashoffset:calc(var(--ocgu-len) * 1px - var(--ocgu-frozen-a))}' +
    '.ocgu-glow[data-phase="ok"] .ocgu-rail-st.ocgu-rail-b,.ocgu-glow[data-phase="error"] .ocgu-rail-st.ocgu-rail-b{stroke-dashoffset:calc(var(--ocgu-len) * 1px - var(--ocgu-frozen-b))}' +
    railLayerCss('a', RAIL_A_LAYERS) +
    railLayerCss('b', RAIL_B_LAYERS) +
    '.ocgu-rail-track{fill:none;stroke:color-mix(in srgb,var(--ocgu-glow) 18%,transparent);stroke-width:1;opacity:.55}' +
    '.ocgu-rail-comet,.ocgu-rail-head,.ocgu-rail-spark,.ocgu-rail-b{opacity:0;transition:opacity .14s linear}' +
    '.ocgu-rail-comet{filter:blur(.35px)}' +
    // 弹头：跟 label-primary 调和 —— 深色主题是「淡薄荷」，浅色主题自动变成「深墨绿」，不会在白底上糊成白线
    '.ocgu-rail-head{--ocgu-len:' + RAIL_HEAD_LEN + ';stroke-width:1.5;stroke:color-mix(in srgb,var(--ocgu-glow) 62%,var(--dsw-alias-label-primary));filter:drop-shadow(0 0 2.2px color-mix(in srgb,var(--ocgu-glow) 80%,transparent))}' +
    // 白热芯：更短更亮的一小节压在弹头上，做出「灯丝」感
    '.ocgu-rail-spark{--ocgu-len:' + RAIL_SPARK_LEN + ';stroke-width:1.7;stroke:color-mix(in srgb,var(--ocgu-glow) 34%,var(--dsw-alias-label-primary));filter:drop-shadow(0 0 2.6px color-mix(in srgb,var(--ocgu-glow) 90%,transparent))}' +
    '.ocgu-glow[data-phase="loading"] .ocgu-rail-track{animation:ocgu-track 2.2s ease-in-out infinite}' +
    '.ocgu-glow[data-phase="loading"] .ocgu-rail-comet,.ocgu-glow[data-phase="loading"] .ocgu-rail-head,.ocgu-glow[data-phase="loading"] .ocgu-rail-spark,.ocgu-glow[data-phase="loading"] .ocgu-rail-b{opacity:1}' +
    '.ocgu-glow[data-phase="ok"] .ocgu-rail-track,.ocgu-glow[data-phase="error"] .ocgu-rail-track{opacity:0}' +
    '@keyframes ocgu-track{0%,100%{opacity:.45}50%{opacity:1}}' +
    // 封环：dashoffset 取「冻结的收笔位置」，描边 40 → 1000 千分弧长从弹头处往前包一整圈；
    // 收口时刻（0.46s）收口用一次 drop-shadow 爆闪（扩散环会在封环后再亮一次，观感像绿底重复）。
    // 封环终态必须是「间隙 = 0」（1000px 0px）才盖满整圈：写 1000px 1000px 时图案总长是 2000、
    // 而路径只有 1000 单位，dashoffset = -收笔位置 会把「起点之前那段」留在间隙里 ——
    // 缺口宽度正好等于收笔位置（实测截图：收笔在 35% 处就缺 35%，看着就是「没闭合」）。
    '.ocgu-rail-seal{fill:none;stroke:var(--ocgu-glow);stroke-width:1.15;stroke-linecap:round;opacity:0;stroke-dasharray:40px 1000px;stroke-dashoffset:calc(-1 * var(--ocgu-frozen-a))}' +
    '.ocgu-glow[data-phase="ok"] .ocgu-rail-seal,.ocgu-glow[data-phase="error"] .ocgu-rail-seal{opacity:1;animation:ocgu-seal .46s cubic-bezier(.3,.72,.2,1) forwards,ocgu-sealbloom .8s .22s ease-out both}' +
    '.ocgu-glow[data-phase="ok"] .ocgu-rail-seal{animation:ocgu-seal .46s cubic-bezier(.3,.72,.2,1) forwards,ocgu-sealbloom .8s .22s ease-out both,ocgu-hold 2.6s .8s ease-in-out infinite}' +
    '.ocgu-glow[data-phase="error"] .ocgu-rail-seal{animation:ocgu-seal .46s cubic-bezier(.3,.72,.2,1) forwards,ocgu-sealbloom .8s .22s ease-out both,ocgu-deny .46s .9s 2}' +
    '@keyframes ocgu-seal{from{stroke-dasharray:40px 1000px}to{stroke-dasharray:1000px 0px}}' +
    '@keyframes ocgu-sealbloom{0%{filter:drop-shadow(0 0 0 transparent)}30%{filter:drop-shadow(0 0 6px color-mix(in srgb,var(--ocgu-glow) 75%,transparent))}100%{filter:drop-shadow(0 0 2px color-mix(in srgb,var(--ocgu-glow) 40%,transparent))}}' +
    '@keyframes ocgu-deny{0%,100%{opacity:1}50%{opacity:.3}}' +
    // 封环后 3 秒停留：极轻的一次呼吸，别让整圈死住
    '@keyframes ocgu-hold{0%,100%{opacity:1}50%{opacity:.8}}' +
    // 系统开了「减少动态效果」：不跑圈、不爆闪，只留一圈静态光 + 一次性收束
    '@media (prefers-reduced-motion:reduce){.ocgu-glow[data-phase="loading"]{animation:none}.ocgu-rail-comet,.ocgu-rail-head,.ocgu-rail-spark,.ocgu-rail-b{display:none}.ocgu-glow[data-phase="loading"] .ocgu-rail-track{opacity:.7;animation:none}.ocgu-glow[data-phase="ok"] .ocgu-rail-seal,.ocgu-glow[data-phase="error"] .ocgu-rail-seal{animation:none;opacity:1;stroke-dasharray:1000px 0px}}' +
    // 余额：跟胶囊行高对齐（11px / 18px），不参与顶高
    '.ocgu-bal{font-size:11px;line-height:18px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:.2px;white-space:nowrap;margin-right:6px}' +
    // 余额只在「余额自己」出错时才转黄：用量侧的失败不该把健康的余额也染黄（两路互相独立）
    '.ocgu-bal[data-balwarn="true"]{color:var(--dsw-alias-state-warn-primary)}' +
    '.ocgu-sep{flex:none;width:1px;height:14px;background:var(--dsw-alias-border-l2);margin-right:6px}' +
    // OCG 三组迷你圆环：环盒 20px（视觉环 24px，上下各溢出 2px，落在 5px 内边距里）、环心数字 9.5px ——
    // 两位数百分比在环心也不拥挤；环外不再单列 H/W/M 标签（省掉三个字母位，浮窗更短）。
    // 完整口径仍在 aria-label / title / 设置页。
    '.ocgu-mini-group{display:inline-flex;align-items:center;margin-right:7px}' +
    '.ocgu-mini-group:last-child{margin-right:0}' +
    '.ocgu-mini-ring{position:relative;flex:none;display:inline-flex;width:20px;height:20px}' +
    '.ocgu-mini-ring svg{position:absolute;left:50%;top:50%;width:24px;height:24px;transform:translate(-50%,-50%);overflow:visible}' +
    '.ocgu-mini-ring-track{fill:none;stroke:color-mix(in srgb,var(--ocgu-ring) 32%,transparent);stroke-width:2.2;transition:stroke .2s ease}' +
    '.ocgu-mini-ring-arc{fill:none;stroke:var(--ocgu-ring);stroke-width:2.2;stroke-linecap:round;transition:stroke-dashoffset .35s cubic-bezier(.22,.9,.28,1),stroke .2s ease}' +
    // 环心数字：绝对定位不参与行高；tabular-nums 让数值变化时不抖；颜色跟环同色（一眼成套）。
    // 9.5px/-.3px 是环内径(≈17.8px)的上限，两位数百分比正好放得下
    '.ocgu-mini-ring-val{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:9.5px;line-height:1;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.3px;white-space:nowrap;color:var(--ocgu-ring)}' +
    // 用量分级配色（红绿灯，一色两用）：<80% 绿、>=80% 琥珀、>=95% 红。
    // 已用弧 = 该色满不透明；未用底盘 = 同色 32% 透明。
    '.ocgu-mini-ring[data-level="ok"]{--ocgu-ring:var(--dsw-alias-state-success-primary)}' +
    '.ocgu-mini-ring[data-level="warn"]{--ocgu-ring:var(--dsw-alias-state-warn-primary)}' +
    '.ocgu-mini-ring[data-level="danger"]{--ocgu-ring:var(--dsw-alias-state-error-primary)}' +
    '.ocgu-mini-ring[data-level="empty"]{--ocgu-ring:color-mix(in srgb,var(--dsw-alias-label-secondary) 78%,transparent)}' +
    // 设置页的横向进度条继续用 .ocgu-fill（同一套分级配色）
    '.ocgu-fill[data-level="ok"]{background:var(--dsw-alias-brand-primary)}' +
    '.ocgu-fill[data-level="warn"]{background:var(--dsw-alias-state-warn-primary)}' +
    '.ocgu-fill[data-level="danger"]{background:var(--dsw-alias-state-error-primary)}' +
    // ---------- 设置页：用量行 ----------
    '.ocgu-row{display:flex;flex-direction:column;gap:6px}' +
    '.ocgu-row-top{display:flex;align-items:baseline;gap:10px}' +
    '.ocgu-row-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}' +
    // 百分比定宽右对齐 + tabular-nums：三行的数字成列
    '.ocgu-row-pct{flex:none;min-width:38px;text-align:right;font-size:13px;line-height:18px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary)}' +
    // 进度槽 6 → 8px：槽底比纯 border-l1 更有「槽」感，又不抢眼
    '.ocgu-row-track{position:relative;height:8px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-border-l1) 82%,var(--dsw-alias-bg-base));overflow:hidden}' +
    '.ocgu-row-fill{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:var(--dsw-alias-brand-primary);transition:width .45s cubic-bezier(.22,.9,.28,1)}' +
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
  function levelOf(percent) {
    if (percent >= 95) return 'danger';
    if (percent >= 80) return 'warn';
    return 'ok';
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
  function pickAnchors(rect, cardRect, vw, vh) {
    var xs = [
      { a: 'view-left', d: Math.abs(rect.left), o: rect.left },
      { a: 'view-right', d: Math.abs(vw - rect.right), o: rect.right - vw }
    ];
    var ys = [
      { a: 'view-top', d: Math.abs(rect.top), o: rect.top },
      { a: 'view-bottom', d: Math.abs(vh - rect.bottom), o: rect.bottom - vh }
    ];
    if (cardRect) {
      xs.push({ a: 'card-left', d: Math.abs(rect.left - cardRect.left), o: rect.left - cardRect.left });
      xs.push({ a: 'card-right', d: Math.abs(rect.right - cardRect.right), o: rect.right - cardRect.right });
      ys.push({ a: 'card-top', d: Math.abs(rect.top - cardRect.top), o: rect.top - cardRect.top });
      ys.push({ a: 'card-bottom', d: Math.abs(rect.bottom - cardRect.bottom), o: rect.bottom - cardRect.bottom });
    }
    var bx = xs[0], by = ys[0], i;
    for (i = 1; i < xs.length; i++) if (xs[i].d < bx.d) bx = xs[i];
    for (i = 1; i < ys.length; i++) if (ys[i].d < by.d) by = ys[i];
    return {
      widgetAnchorX: bx.a, widgetOffsetX: Math.round(bx.o),
      widgetAnchorY: by.a, widgetOffsetY: Math.round(by.o)
    };
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
  var DEFAULT_ANCHORS = { widgetAnchorX: 'view-right', widgetOffsetX: -24, widgetAnchorY: 'view-bottom', widgetOffsetY: -24 };
  var REVEAL_MS = 3000;
  // 刷新超时的哨兵值：文案交给界面层按语言生成，helper 里不放中文（否则英文界面会中英混排）
  var ERR_TIMEOUT = '@timeout';
  // 设置页行内提示的停留时长：3 秒后自动消失（不留着占位、也不用用户手动清）
  var MSG_MS = 3000;
  // 自动刷新「更新中」相位的兜底时长：宿主单请求超时 20s（两个请求并行），超过这个时间说明
  // 这一轮不会回结果了（宿主提前返回 / 连接挂起），把流光收回，不能让一直转。
  var AUTO_LOADING_MAX_MS = 25000;
  // 迷你圆环几何：viewBox 24×24、r=10（描边 2.2 → 外径 22.2），周长即 dash 总长；
  // 弧长按已用百分比取：strokeDashoffset = C × (1 - pct/100)，0% 时弧度全长偏移 = 不画。
  // （原 viewBox 18×18、r=8：环小、环心 8px 数字放两位数很挤，故整体放大）
  var RING_BOX = 24;
  var RING_MID = RING_BOX / 2;
  var RING_R = 10;
  var RING_C = 2 * Math.PI * RING_R;
  // 三个窗口的展示口径：浮窗只放得下 1 个字符的短标签（H = 5 小时、W = 本周、M = 本月），
  // 完整口径在 aria-label / 浮窗 title / 设置页标题里
  // 浮窗只在环心显示已用百分比（不再在环外单列 H/W/M 标签，浮窗更短）
  var WINDOWS = [
    { key: 'rolling', mini: 'H' },
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
      'btn.resetPos': '重置到右下角',
      'btn.atDefault': '已在默认位置',
      'title.resetPos': '把浮窗放回窗口右下角',
      'aria.widget': '显示悬浮窗',
      'label.balance': '显示DS官方余额',
      'title.balance': '是否在浮窗上显示 DeepSeek 官方余额',
      'float.groupTitle': 'OpenCode Go · {win}（{mini}）',
      'float.ring': 'OpenCode Go {win} 已用 {pct}%',
      'float.ringEmpty': 'OpenCode Go {win} 已用（暂无数据）',
      'float.noKey': '未配置 API Key：可在设置 → OCG 余量查询 里填写，或写入 DSH 凭据库（点击刷新，拖动可移动位置）',
      'float.failed': '刷新失败：{err}（点击重试，拖动可移动位置）',
      'float.balance': 'DeepSeek 余额 {bal} · ',
      'float.usage': 'OpenCode Go 用量（已用）：5 小时 / 本周 / 本月 · 每 {min} 分钟自动刷新 · 更新于 {rel}',
      'float.tail': '（点击或自动刷新：边框流光 → 全绿/全红 → 3 秒淡出；拖动可移动位置；明细见设置 → OCG 余量查询）',
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
      'settings.usageTitle': 'OpenCode Go 用量详情',
      'settings.lastUpdated': '上次更新：{time}（{rel}）',
      'settings.lastUpdatedEmpty': '上次更新：--',
      'settings.manualRefresh': '手动刷新',
      'settings.refreshTitle': '立即刷新余额与用量',
      'settings.refreshing': '刷新中…',
      'settings.updated': '已更新（{time}）',
      'settings.failed': '刷新失败：{err}',
      'settings.cardHint': '百分比为「已用」：进度条 ≥80% 橙色、≥95% 红色。',
      'settings.section': '设置',
      'field.interval': '自动刷新',
      'field.interval.hint': '自动刷新间隔（当前 {n} 分钟，0.5 ~ 1440）；手动刷新不受此限。',
      'field.interval.aria': '自动刷新间隔（分钟）',
      'field.widget': '悬浮窗',
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
      'msg.widgetShown': '悬浮窗已显示',
      'msg.widgetHidden': '悬浮窗已隐藏',
      'msg.balanceShown': '浮窗已显示余额',
      'msg.balanceHidden': '浮窗已隐藏余额',
      'msg.posReset': '浮窗已回到右下角',
      'status.auto': '已自动读取',
      'status.manual': '手动配置',
      'status.loading': '检测中',
      'status.missing': '未配置',
      'label.float': 'OCG 余量悬浮窗'
    },
    en: {
      'win.rolling': '5-hour',
      'win.weekly': 'Weekly',
      'win.monthly': 'Monthly',
      'unit.minute': 'min',
      'btn.save': 'Save',
      'btn.clear': 'Clear',
      'btn.resetPos': 'Reset position',
      'btn.atDefault': 'At default',
      'title.resetPos': 'Move the pill back to the bottom-right corner',
      'aria.widget': 'Show floating pill',
      'label.balance': 'Show DS balance',
      'title.balance': 'Whether to show the DS balance on the pill',
      'float.groupTitle': 'OpenCode Go · {win} ({mini})',
      'float.ring': 'OpenCode Go {win} used {pct}%',
      'float.ringEmpty': 'OpenCode Go {win} used (no data)',
      'float.noKey': 'No API key configured: add one in Settings → OCG Usage, or put it in the DSH credential store (click to refresh, drag to move)',
      'float.failed': 'Refresh failed: {err} (click to retry, drag to move)',
      'float.balance': 'DeepSeek balance {bal} · ',
      'float.usage': 'OpenCode Go usage (used): 5-hour / weekly / monthly · auto-refresh every {min} min · updated {rel}',
      'float.tail': '(click or auto-refresh: border light trail → all green/red → fades after 3s; drag to move; details in Settings → OCG Usage)',
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
      'settings.intro': 'OpenCode Go usage for the 5-hour, weekly and monthly windows. Click the pill to refresh; drag it to move.',
      'settings.usageTitle': 'OpenCode Go usage details',
      'settings.lastUpdated': 'Last updated: {time} ({rel})',
      'settings.lastUpdatedEmpty': 'Last updated: --',
      'settings.manualRefresh': 'Refresh now',
      'settings.refreshTitle': 'Refresh balance and usage now',
      'settings.refreshing': 'Refreshing…',
      'settings.updated': 'Updated ({time})',
      'settings.failed': 'Refresh failed: {err}',
      'settings.cardHint': 'Percentages are “used”: the bar turns amber at ≥80% and red at ≥95%.',
      'settings.section': 'Settings',
      'field.interval': 'Auto-refresh',
      'field.interval.hint': 'Auto-refresh interval (currently {n} min, 0.5–1440); manual refresh is not limited by this.',
      'field.interval.aria': 'Auto-refresh interval (minutes)',
      'field.widget': 'Floating pill',
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
      'msg.posReset': 'Pill moved back to the bottom-right',
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
  function balanceText(value) {
    var b = balanceOf(value);
    var cur = (value && typeof value.balance === 'object' && value.balance && value.balance.currency) || 'CNY';
    return b ? currencySymbol(cur) + b.totalBalance : currencySymbol(cur) + '--';
  }
  function floatWarn(value) {
    return value.keyStatus === 'missing' || value.balanceKeyStatus === 'missing'
      || !!value.usageError || !!value.balanceError;
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
    // 光轨尺寸：SVG 描边要精确贴合胶囊 border-box（宽度随余额/环心数值变化，拖动不触发重算）
    var szState = React.useState({ w: 0, h: 0 });
    var glowSize = szState[0];
    var setGlowSize = szState[1];
    // 收笔冻结点：相位切到 ok / error 时，跑圈动画被浏览器重建、--ocgu-run / --ocgu-run2 归零，
    // 彗尾会瞬间跳回起点（观感就是「后半段突然一条长线」）。所以切换前先把两道彗尾的当前位置读出来，
    // 结果相位改用 --ocgu-frozen-a / -b：尾焰就地淡出、封环从弹头处起笔，全程不跳。
    var fzState = React.useState({ a: 0, b: 0 });
    var frozen = fzState[0];
    var setFrozen = fzState[1];
    var freezeRail = function () {
      var node = rootRef.current;
      if (!node || typeof window.getComputedStyle !== 'function') return;
      var glow = node.querySelector('.ocgu-glow');
      if (!glow) return;
      var cs = window.getComputedStyle(glow);
      var a = parseFloat(cs.getPropertyValue('--ocgu-run')) || 0;
      var b = parseFloat(cs.getPropertyValue('--ocgu-run2')) || 0;
      setFrozen(function (prev) { return (prev.a === a && prev.b === b) ? prev : { a: a, b: b }; });
    };

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
          manualBusyRef.current = false;
          stopAutoLoading();
          freezeRail();
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
      freezeRail();
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
          var anchors = pickAnchors(
            node.getBoundingClientRect(),
            findComposerCard(),
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

    // 光轨几何：按胶囊 border-box 实测（SVG 左/上各外移 1px 抵消 1px 边框，圆角取高的一半 → 胶囊形）。
    // 尺寸变化只重画几何、不动动画相位（pathLength 已把弧长归一化）。
    React.useEffect(function () {
      var node = rootRef.current;
      if (!node) return undefined;
      var apply = function () {
        var rect = node.getBoundingClientRect();
        var w = Math.round(rect.width * 100) / 100;
        var h = Math.round(rect.height * 100) / 100;
        if (!(w > 0) || !(h > 0)) return;
        setGlowSize(function (prev) { return prev.w === w && prev.h === h ? prev : { w: w, h: h }; });
      };
      apply();
      if (typeof ResizeObserver !== 'function') {
        window.addEventListener('resize', apply);
        return function () { window.removeEventListener('resize', apply); };
      }
      var ro = new ResizeObserver(apply);
      ro.observe(node);
      return function () { ro.disconnect(); };
    }, [value.widgetVisible]);

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
    // 光轨 = 贴胶囊 border-box 的 SVG 描边：底轨 track + 辅轨 B（暗而慢）+ 主轨 A 六层彗尾 + 白热弹头 + 封环。
    // 线宽 1.15px 居中压在 1px 边框上 → 几何各内缩半线宽，圆角取高的一半（胶囊形）。
    var rail = null;
    if (glowSize.w > 8 && glowSize.h > 8) {
      var railSw = 1.15;
      var railGeo = {
        x: railSw / 2,
        y: railSw / 2,
        width: Math.max(0, glowSize.w - railSw),
        height: Math.max(0, glowSize.h - railSw),
        rx: Math.max(0, (glowSize.h - railSw) / 2)
      };
      var railRect = function (key, cls) {
        return React.createElement('rect', {
          key: key, className: cls,
          x: railGeo.x, y: railGeo.y, width: railGeo.width, height: railGeo.height,
          rx: railGeo.rx, pathLength: '1000'
        });
      };
      var railKids = [railRect('track', 'ocgu-rail-track')];
      var ri;
      // 辅轨 B：暗而慢（2.15s），与主轨 1.35s 周期不成整数比 → 两光交织，看不出循环
      for (ri = 0; ri < RAIL_B_LAYERS.length; ri++) {
        railKids.push(railRect('b' + ri, 'ocgu-rail-st ocgu-rail-b ocgu-rail-b' + ri));
      }
      // 主轨 A：六层彗尾（越长越暗）叠成柔和尾焰
      var tailKids = [];
      for (ri = 0; ri < RAIL_A_LAYERS.length; ri++) {
        tailKids.push(railRect('a' + ri, 'ocgu-rail-st ocgu-rail-a' + ri));
      }
      railKids.push(React.createElement('g', { key: 'comet', className: 'ocgu-rail-comet' }, tailKids));
      // 白热弹头：不被模糊、带 drop-shadow 外发光
      railKids.push(railRect('head', 'ocgu-rail-st ocgu-rail-head'));
      // 白热芯：更短更亮的一小节，压在最上层
      railKids.push(railRect('spark', 'ocgu-rail-st ocgu-rail-spark'));
      // 封环：完成 / 失败时从弹头当前位置把整圈包起来
      railKids.push(railRect('seal', 'ocgu-rail-seal'));
      rail = React.createElement('svg', {
        key: 'rail', className: 'ocgu-rail', width: glowSize.w, height: glowSize.h,
        'aria-hidden': 'true', focusable: 'false'
      }, railKids);
    }

    // 单行内容：余额 + 分隔线 + 三组迷你圆环 —— 长宽恒定，任何状态下都不改变尺寸。
    var children = [
      React.createElement('span', {
        key: 'glow', className: 'ocgu-glow', 'data-phase': refreshState,
        // 冻结位置以行内变量下发（CSS 里给的是 0px 兜底）：结果相位据此就地淡出 + 起笔
        style: { '--ocgu-frozen-a': frozen.a + 'px', '--ocgu-frozen-b': frozen.b + 'px' },
        'aria-hidden': 'true'
      }, rail)
    ];
    // 余额可关（设置页复选框）：关掉后连同分隔线一起去掉，浮窗自动变窄（光轨几何跟着 ResizeObserver 重算）
    if (value.showBalance !== false) {
      children.push(
        React.createElement('span', {
          key: 'bal',
          className: 'ocgu-bal',
          'data-balwarn': (value.balanceError || value.balanceKeyStatus === 'missing') ? 'true' : 'false'
        }, balanceText(value)),
        React.createElement('span', { key: 'sep', className: 'ocgu-sep' }));
    }
    WINDOWS.forEach(function (w) {
      var win = windowOf(usage, w.key);
      var pct = win.percent;
      var shown = Math.round(pct);
      // 环心显示已用百分比（环外不再单列 H/W/M 标签，三颗环紧挨着，浮窗更短）
      children.push(React.createElement('span', {
        key: w.key, className: 'ocgu-mini-group', title: t('float.groupTitle', { win: winName(w, t), mini: w.mini })
      },
        React.createElement('span', {
          className: 'ocgu-mini-ring',
          'data-level': hasData ? levelOf(pct) : 'empty',
          role: 'progressbar',
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': hasData ? shown : 0,
          'aria-label': hasData ? t('float.ring', { win: winName(w, t), pct: shown }) : t('float.ringEmpty', { win: winName(w, t) })
        },
          React.createElement('svg', { viewBox: '0 0 ' + RING_BOX + ' ' + RING_BOX, 'aria-hidden': 'true', focusable: 'false' },
            React.createElement('circle', { className: 'ocgu-mini-ring-track', cx: RING_MID, cy: RING_MID, r: RING_R }),
            // 只旋转图形组（-90° 让进度从 12 点起走），环心文字保持正立
            React.createElement('g', { transform: 'rotate(-90 ' + RING_MID + ' ' + RING_MID + ')' },
              React.createElement('circle', {
                className: 'ocgu-mini-ring-arc', cx: RING_MID, cy: RING_MID, r: RING_R,
                style: {
                  strokeDasharray: String(RING_C),
                  strokeDashoffset: String(hasData ? RING_C * (1 - pct / 100) : RING_C)
                }
              }))),
          React.createElement('span', { className: 'ocgu-mini-ring-val' }, hasData ? shown : '--'))));
    });

    var title = missingKey
      ? t('float.noKey')
      : (value.usageError || value.balanceError)
        ? t('float.failed', { err: value.usageError || value.balanceError })
        : (value.showBalance !== false ? t('float.balance', { bal: balanceText(value) }) : '')
          + t('float.usage', { min: refreshMinutes, rel: fmtRelative(value.lastUpdated, t) })
          + t('float.tail');

    return React.createElement('div', {
      ref: rootRef,
      className: 'ocgu-float',
      'data-state': refreshState,
      'data-warn': warn ? 'true' : 'false',
      title: title,
      onPointerDown: onPointerDown
    }, children);
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
      'data-layout': props.layout === 'block' ? 'block' : 'inline'
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
    // 重置倒计时放在标题行、百分比左侧（不独占一行）
    return React.createElement('div', { className: 'ocgu-row', style: { marginBottom: '10px' } },
      React.createElement('div', { className: 'ocgu-row-top' },
        React.createElement('span', { className: 'ocgu-row-label' }, props.label),
        React.createElement('span', { className: 'ocgu-row-reset' },
          (fmtCountdown(win.resetsAt, t) || t('cd.unknown')) + (win.status && win.status !== 'ok' ? t('cd.status', { s: win.status }) : '')),
        React.createElement('span', { className: 'ocgu-row-pct' }, win.percent + '%')),
      React.createElement('div', { className: 'ocgu-row-track' },
        React.createElement('div', { className: 'ocgu-row-fill ocgu-fill', 'data-level': levelOf(win.percent), style: { width: win.percent + '%' } })));
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
    var toggleBalance = function () {
      updateNs(remote, viewRef.current, { showBalance: !(value.showBalance !== false) }, function (err, nv) {
        if (err || !nv) { say('widget', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('widget', nsValue(nv).showBalance === false ? t('msg.balanceHidden') : t('msg.balanceShown'));
      });
    };

    var resetPos = function () {
      updateNs(remote, viewRef.current, DEFAULT_ANCHORS, function (err, nv) {
        if (err || !nv) { say('widget', t('msg.saveFailed', { err: err || t('msg.unknownErr') }), 'error'); return; }
        apply(nv);
        say('widget', t('msg.posReset'));
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

    // keyHint 形如 "sk-****5590（DEEPSEEK_API_KEY）"，页面里只取掩码本身，避免括号套括号
    var masked = function (h) { return String(h || '').split('（')[0].trim() || t('status.missing'); };
    // 样式表在 CSS 常量里（.ocgu-btn / .ocgu-input / .ocgu-msg / .ocgu-card / .ocgu-badge …），
    // 这里只留必须按状态现算的内联项；hover / active / focus 交给 CSS（内联样式写不了伪类）。
    var refreshMsg = msgOf('refresh');
    var winList = WINDOWS.map(function (w) {
      return React.createElement(UsageRow, {
        key: w.key, label: t('float.groupTitle', { win: winName(w, t), mini: w.mini }), win: windowOf(usage, w.key), t: t
      });
    });

    return React.createElement('div', { style: { padding: '4px 0 20px' } },
      React.createElement('div', { className: 'ocgu-sec' }, t('settings.title')),
      React.createElement('div', { className: 'ocgu-hint', style: { marginTop: '4px' } },
        t('settings.intro')),
      // ── OpenCode Go 用量详情 ──
      // 刷新按钮挂在这一行右侧（时间/提示在按钮左边）：时间→提示的替换规则不变（3 秒后回落到「上次更新」）
      React.createElement('div', { className: 'ocgu-subrow' },
        React.createElement('div', { className: 'ocgu-sub' }, t('settings.usageTitle')),
        React.createElement('div', { className: 'ocgu-subrow-right' },
          React.createElement('span', {
            className: 'ocgu-msg',
            'data-tone': refreshMsg ? toneOf('refresh') : 'muted',
            role: 'status', 'aria-live': 'polite',
            title: refreshMsg || ''
          }, refreshMsg || (hasData
            ? t('settings.lastUpdated', { time: fmtTime(value.lastUpdated), rel: fmtRelative(value.lastUpdated, t) })
            : t('settings.lastUpdatedEmpty'))),
          React.createElement('button', {
            onClick: refresh, disabled: loading, className: 'ocgu-btn', 'data-kind': 'primary',
            title: t('settings.refreshTitle')
          }, loading ? t('settings.refreshing') : t('settings.manualRefresh')))),
      React.createElement('div', { className: 'ocgu-card', style: { marginTop: '10px' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
          React.createElement('span', { className: 'ocgu-badge', 'data-tone': badgeTone(ocgKeyStatus) }, statusText(ocgKeyStatus)),
          React.createElement('span', { className: 'ocgu-hint' }, value.keyHint || 'OPENCODE_GO_API_KEY')),
        winList,
        React.createElement('div', { className: 'ocgu-hint', style: { marginTop: '6px' } },
          t('settings.cardHint')),
        value.usageError ? React.createElement('div', { className: 'ocgu-err' }, value.usageError) : null),

      // ── 操作项 ──
      React.createElement('div', { className: 'ocgu-sub' }, t('settings.section')),
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
      React.createElement(FieldRow, {
        title: t('field.widget'),
        // 顶部说明已经讲了「点击浮窗即刷新 / 拖动可移动」，这里只说状态与位置
        hint: value.widgetVisible
          ? t('field.widget.shown', { anchor: anchorLabel(ax, ay, t) })
          : t('field.widget.hidden'),
        msg: msgOf('widget'),
        tone: toneOf('widget'),
        nowrap: true,
        // 右侧控件从左到右：是否显示余额（复选框）→ 重置位置 → 总开关
        control: [
          React.createElement('label', {
            key: 'bal', className: 'ocgu-check', title: t('title.balance')
          },
            React.createElement('input', {
              type: 'checkbox', checked: value.showBalance !== false,
              onChange: toggleBalance, 'aria-label': t('label.balance')
            }),
            t('label.balance')),
          React.createElement('button', {
            key: 'pos', onClick: resetPos, disabled: isDefaultPos, className: 'ocgu-btn', 'data-kind': 'outline',
            title: t('title.resetPos')
          }, isDefaultPos ? t('btn.atDefault') : t('btn.resetPos')),
          React.createElement('button', {
            key: 'sw', type: 'button', className: 'ocgu-switch',
            role: 'switch', 'aria-checked': value.widgetVisible ? 'true' : 'false',
            'aria-label': t('aria.widget'),
            onClick: toggleWidget
          }, React.createElement('span', { className: 'ocgu-thumb' }))
        ]
      }),
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
      }));
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
    // 官方原文：“A dictionary registered after the UI is already mounted is picked up without a remount.”
    // （所以这里早注册一次、挂载时再确认一次，两条路径都安全）
    var ensureLocale = function () {
      if (localeSvc) return localeSvc;
      var l = ctx.get('locale');
      if (!l || typeof l.register !== 'function') return null;
      localeSvc = l;
      ctx.effect(function () { return l.register(LOCALE_NS, 'zh', I18N.zh); });
      ctx.effect(function () { return l.register(LOCALE_NS, 'en', I18N.en); });
      return l;
    };
    // slot label 用函数形式，跟随语言切换重新求值
    //（官方 agent-presets 页同款写法：label: () => ctx.locale.bind(ns)('nav')）
    var navLabel = function (key) {
      var l = localeSvc;
      if (l && typeof l.bind === 'function') {
        try { return l.bind(LOCALE_NS)(key); } catch (e) { /* 取不到就回退中文 */ }
      }
      return tZh(key);
    };
    // 组件用的 t：优先用框架注入的席位（它订阅语言变化 → 切换语言立刻重渲染）；
    // 若该席位没被注入（p.t 为空），回退到我们自己 bind 出来的翻译函数（下次渲染即生效），
    // 都没有则回退内置中文 —— 三种情况下界面都不会出现键名残留。
    var currentT = function () {
      var l = localeSvc;
      if (l && typeof l.bind === 'function') {
        try { return l.bind(LOCALE_NS); } catch (e) { /* 回退中文 */ }
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
          function (p) { return React.createElement(UsageFloat, Object.assign({}, p, { remote: remoteOf() || remote, t: p.t || currentT() })); }
          // （remoteOf() 每次渲染重取：客户端服务在宿主热更新后会被替换，闭包捕获会读到失效实例）
        );
      });
      // 设置页：菜单名「OCG 余量查询」/「OCG Usage」
      slots.inject('settings.section', function () {
        return slots.register(
          meta('settings.section', 'opencode-go-usage', 31, 'settings.title'),
          function (p) { return React.createElement(SettingsPage, Object.assign({}, p, { remote: remoteOf() || remote, t: p.t || currentT() })); }
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

  module.exports = { name: 'opencode-go-usage', inject: ['slots'], apply: apply };
  return module.exports;
}});
