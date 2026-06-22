# Time Focus

Time Focus 是一个基于 React、TypeScript 和 Vite 的专注计时应用，支持正向计时、倒计时、专注记录和数据图表。

## 功能

### 专注计时

- 支持正向计时和倒计时
- 默认使用正向计时
- 倒计时模式支持自定义专注分钟数
- 支持开始、暂停、继续、重置和结束
- 使用 `requestAnimationFrame` 计算时间
- 每秒更新一次 UI 状态，减少无效渲染
- 使用 Zustand 管理计时器状态
- 切换页面后可以根据开始时间恢复运行中的计时器

### 专注信息

- 专注类型：代码、学习
- 自定义专注事件名称
- 不填写名称时使用“未命名专注”
- 首页展示当天累计专注时长

### 专注记录

- 展示每次专注记录
- 展示专注类型图标
- 展示事件名称、记录时间和专注时长
- 使用 IndexedDB 持久化记录

### 数据图表

- 使用 ECharts 展示最近专注时长柱状图
- 使用 ECharts 展示每日专注趋势折线图
- 图表页使用 `React.lazy` 懒加载

## 技术栈

- React 19
- TypeScript
- Vite
- Zustand
- React Router
- Tailwind CSS
- shadcn/ui
- Lucide React
- ECharts
- Day.js
- IndexedDB

## 页面路由

- `/`：首页
- `/focus-list`：专注记录
- `/charts`：专注图表

记录页和图表页使用 `React.lazy` 和 `Suspense` 懒加载，首页保持静态加载。

## 本地开发

安装依赖：

```bash
pnpm install
```

启动开发服务：

```bash
pnpm dev
```

构建生产版本：

```bash
pnpm build
```

运行代码检查：

```bash
pnpm lint
```

预览生产构建：

```bash
pnpm preview
```

## 项目结构

```txt
src/
|-- component/
|   |-- AppFooter.tsx
|   `-- ui/
|-- lib/
|   |-- indexed-db.ts
|   `-- utils.ts
|-- pages/
|   |-- charts/
|   |-- focus-list/
|   `-- home/
|       |-- AppHeader.tsx
|       |-- FocusForm.tsx
|       |-- FocusTimer.tsx
|       |-- HomePage.tsx
|       `-- TodayFocusSummary.tsx
|-- store/
|   `-- timer-store.ts
|-- types/
|   `-- focus.ts
|-- App.tsx
`-- main.tsx
```

## 状态管理

计时器状态定义在 `src/store/timer-store.ts`，主要包括：

- 计时模式 `mode`
- 运行状态 `status`
- 倒计时时长 `durationMinutes`
- 已计时毫秒和秒数
- 开始时间 `startedAt`
- 开始、暂停、重置、切换模式等 actions

## 数据存储

专注记录类型定义在 `src/types/focus.ts`：

```ts
export type FocusRecord = {
  createdAt: number;
  durationSeconds: number;
  id: string;
  name: string;
  type: "code" | "study";
};
```

IndexedDB 封装位于 `src/lib/indexed-db.ts`：

- 默认数据库：`time-focus`
- 默认 object store：`focus-records`
- 主键字段：`id`
- 支持新增、查询、更新、删除和清空
