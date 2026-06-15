# Time Focus

一个基于 React、TypeScript、Vite 的专注计时应用。

## 功能

- 首页专注计时
  - 选择专注类型：代码、学习
  - 输入专注事件名称
  - 自定义专注时长
  - 支持开始、暂停、重置、结束
  - 今日专注时长统计
- 专注记录页
  - 展示每次专注记录
  - 包含专注类型图标、事件名称、记录时间、专注时长
- 图表页
  - 使用 ECharts 展示最近专注时长柱状图
  - 使用 ECharts 展示每日专注趋势折线图
- 数据存储
  - 使用 IndexedDB 持久化专注记录

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- react-router
- ECharts
- IndexedDB

## 页面路由

- `/`：首页
- `/focus-list`：专注记录
- `/charts`：专注图表

除首页外，记录页和图表页均使用 `React.lazy` 懒加载。

## 本地开发

安装依赖：

```bash
pnpm install
```

启动开发服务：

```bash
pnpm dev
```

构建：

```bash
pnpm build
```

代码检查：

```bash
pnpm lint
```

## 项目结构

```txt
src
├─ component
│  ├─ AppFooter.tsx
│  └─ ui
├─ lib
│  ├─ indexed-db.ts
│  └─ utils.ts
├─ pages
│  ├─ charts
│  ├─ focus-list
│  └─ home
├─ types
│  └─ focus.ts
├─ App.tsx
└─ main.tsx
```

## 数据说明

专注记录结构定义在 `src/types/focus.ts`：

```ts
export type FocusRecord = {
  createdAt: number;
  durationSeconds: number;
  id: string;
  name: string;
  type: "code" | "study";
};
```

IndexedDB 封装位于 `src/lib/indexed-db.ts`，默认数据库为 `time-focus`，默认 store 为 `focus-records`。
