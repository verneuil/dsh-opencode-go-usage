# 安全策略 / Security Policy

## 支持的版本

只维护**最新发布版本**（npm `latest` 与对应 tag）。更早的版本请先升级，再判断问题是否仍存在。

| 版本 | 是否接受安全报告 |
|---|---|
| 最新发布版 | ✓ |
| 更早版本 | ✗（请先升级） |

## 报告漏洞

**请不要开公开 issue。** 本仓库已启用 GitHub 的私有漏洞报告，请通过下面的入口提交：

https://github.com/verneuil/dsh-opencode-go-usage/security/advisories/new

请在报告里写清：受影响的版本、复现步骤、影响范围（例如是否可能泄露 API Key 或伪造用量显示）。

## 处理承诺

- 7 天内确认收到；
- 修复后在新版本的 Release 说明里致谢（如果你同意署名）。

## 范围说明

本插件是 DSH 的客户端插件，只与本机 DSH 和以下官方端点通信：

- `opencode.ai`（用量与模型清单）
- `api.deepseek.com`（账户余额）
- `open.er-api.com` / `api.frankfurter.app`（USD/CNY 汇率）

插件不收集遥测、不上传任何本地数据；API Key 只在本机设置存储与请求头中出现，不会写入日志、用量快照或前端。
