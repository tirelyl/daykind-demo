# Supabase + Render 部署

此文档准备了后续上线步骤；当前没有执行云端部署。

## Supabase

1. 创建免费项目，保存项目 URL 和 **publishable key**。服务端 secret / service_role key 只在 Supabase 服务端使用。
2. 在 Auth → Providers → Email 关闭 **Confirm email**；允许邮箱密码注册，密码长度至少 8 位。此 Demo 不配置 SMTP、邮件确认或密码重置。
3. 登录并关联 CLI：

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref YOUR_PROJECT_REF
pnpm exec supabase db push
```

4. 设置准确的前端 origin，不带尾斜杠；可用逗号分隔本地与线上地址：

```bash
pnpm exec supabase secrets set ALLOWED_ORIGINS=https://YOUR_SITE.onrender.com
pnpm exec supabase functions deploy checkout
```

函数 `verify_jwt=false` 是有意配置：代码使用 Supabase `auth.getUser(jwt)` 校验用户，支持当前平台的访问令牌；浏览器仍必须发送真实登录令牌。事务 RPC 仅授予 service_role，不能从浏览器直接调用。Supabase 自动为函数提供平台所需服务端环境变量。

5. Auth URL Configuration 设置站点 URL 为 Render 域名。当前只有邮箱密码登录，不依赖 OAuth 重定向。

## Render

将代码推送到自己的 Git 托管仓库，再在 Render 通过 Blueprint 导入根目录 `render.yaml`。配置会创建 **static** 站点，不创建付费 Node 服务或 Render 数据库。

设置：

- `VITE_SUPABASE_URL`：云端项目 URL。
- `VITE_SUPABASE_PUBLISHABLE_KEY`：浏览器可公开的 publishable key。
- `VITE_ENABLE_CATALOG_MOCK=true`。

构建为 `pnpm build`，目录为 `dist`。`/* → /index.html` 使用 rewrite，详情页可直接刷新。Render 优先提供现存静态文件，因此 `mockServiceWorker.js` 不会被 SPA 回退覆盖；worker 配置 no-cache 和根 scope。

若先有 Supabase、后得到 Render 域名，必须更新函数 `ALLOWED_ORIGINS`，再验证结账。Vite 环境变量在构建时注入，改配置后需重新构建。

## 线上验收

- 直接打开并刷新 `/products/ee-47`、`/checkout`、`/orders`。
- `/mockServiceWorker.js` 返回 JavaScript；商品接口由 MSW 处理。
- Network 中商品图片与字体来自本域，没有 DummyJSON、Unsplash 或 Google Fonts 运行时依赖。
- 注册 → 合并游客购物车 → 成功/失败支付 → 刷新订单。
- 在另一浏览器登录同一测试账号，云端购物车与订单恢复。
- 两个测试账号无法读取彼此的数据。
- 演示前检查 Supabase 免费项目是否暂停，并确认平台额度。

官方文档：[Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)、[Supabase 密码认证](https://supabase.com/docs/guides/auth/passwords)、[Edge Function 认证](https://supabase.com/docs/guides/functions/auth)、[Render Blueprint](https://render.com/docs/blueprint-spec)、[Render SPA rewrite](https://render.com/docs/redirects-rewrites)。
