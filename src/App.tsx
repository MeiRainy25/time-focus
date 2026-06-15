import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppFooter } from "./component/AppFooter";
import { HomePage } from "./pages/home/HomePage";

const ChartsPage = lazy(() =>
  import("./pages/charts/ChartsPage").then((module) => ({
    default: module.ChartsPage,
  })),
);
const FocusListPage = lazy(() =>
  import("./pages/focus-list/FocusListPage").then((module) => ({
    default: module.FocusListPage,
  })),
);

function App() {
  return (
    <BrowserRouter>
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Suspense
          fallback={
            <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
              页面加载中...
            </div>
          }
        >
          <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<FocusListPage />} path="/focus-list" />
            <Route element={<ChartsPage />} path="/charts" />
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        </Suspense>
        <AppFooter />
      </main>
    </BrowserRouter>
  );
}

export default App;
