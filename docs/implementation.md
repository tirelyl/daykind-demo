# 初始化与实现记录

## 官方脚手架

React SPA 使用 TanStack CLI router-only 模式，在临时目录生成后迁入仓库根目录，保留已有 `.git`：

```bash
pnpm dlx @tanstack/cli@latest create daykind-demo \
  --router-only --framework React --package-manager pnpm \
  --toolchain eslint --no-examples --no-git \
  --target-dir /private/tmp/daykind-demo-scaffold --no-install -y
```

保留 Vite、文件路由、Router 插件、ESLint 和 TypeScript 结构。最初模板构建通过后开发业务；移除未使用 devtools。路由树始终由 `tsr generate` / Vite 插件生成。

shadcn 使用官方 `init -t vite -b radix --no-monorepo -p nova -y` 交互初始化，再通过 `add sheet dialog input accordion sonner skeleton badge separator -y` 生成组件。当前 CLI 仍询问项目细节；生成配置中 CSS 路径已校正为 `src/styles.css`。只对按钮动画/尺寸、Toast 主题做局部适配。

MSW 使用官方 `msw init public --save`。选用 2.15.x 与 Vitest mocker 的 peer 范围兼容，没有混装 MSW 3；安装版本由锁文件固定。

Supabase 使用官方 `init`、`migration new init_commerce`、`functions new checkout`；`gen types typescript --local` 生成数据库类型。只启用本地 API、Auth、数据库和 Edge Runtime，未启用无业务需要的 Storage / Realtime / Analytics / Studio。

Playwright 使用官方 `pnpm create playwright --quiet --no-browsers --no-examples --lang=TypeScript --browser chromium` 初始化，再添加项目测试配置与业务用例。

## 文档和设计参考

开发前核对官方资料，按实际安装版本的类型定义处理 API 差异：

- [TanStack CLI](https://github.com/TanStack/cli/blob/main/docs/cli-reference.md)
- [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [Tailwind Vite](https://tailwindcss.com/docs/installation/using-vite)
- [shadcn Vite](https://ui.shadcn.com/docs/installation/vite)
- [MSW browser integration](https://mswjs.io/docs/integrations/browser/)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Supabase Edge Function auth](https://supabase.com/docs/guides/functions/auth)
- [Playwright](https://playwright.dev/docs/intro)
- [react-i18next quick start](https://react.i18next.com/guides/quick-start)
- [i18next configuration](https://www.i18next.com/overview/configuration-options)
- [Anthropic frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
- [Vercel web-design-guidelines skill](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md)

设计技能以读取其公开 SKILL.md 的方式使用，没有向用户的全局技能目录安装文件。没有使用 Sites 托管或改变已确定的 React SPA / Render 方案。

## 关键实现选择

- 商品目录固定且共享，不加入商品数据库表，减少 demo 后台维护。
- 使用 Supabase 取代独立 Node 服务，RLS 约束客户端访问，Edge Function + Postgres 事务承担可信结账。
- 购物车合并前取消旧的购物车读取，避免旧的空结果覆盖刚合并的数据。
- 对不确定的网络失败保存完整 checkout 尝试，而非只保存幂等键；刷新后仍能查询已提交的订单。
- 本地环境生成脚本不输出密钥；服务端测试密钥只进入忽略的 `.env.test.local`。
- 静态素材、字体自托管，业务页面按文件路由拆包。
- 国际化使用 i18next 26 / react-i18next 17，英文原文作为词条键，关闭 keySeparator / nsSeparator。资源本地打包；React hook 订阅语言切换，Trans 处理带换行与强调的完整文案。
- 默认英文，仅保存用户明确选择的语言，不按浏览器环境自动改变演示语言。同步 html lang、页面标题与描述；金额和日期使用 Intl，货币保持 USD。
- 商品中文内容仅用于展示与搜索；共享结账目录、数据库快照和支付逻辑保持原始业务值。错误在状态中保存原始消息，显示时翻译，切换语言后仍能更新。
