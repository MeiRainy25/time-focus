export function AppHeader() {
  return (
    <header className="border-b border-border bg-background/95">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Time Focus</p>
          <h1 className="text-2xl font-semibold tracking-tight">专注计时</h1>
        </div>
        <div className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
          今日专注
        </div>
      </div>
    </header>
  );
}
