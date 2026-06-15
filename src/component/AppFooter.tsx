import { NavLink } from "react-router";

const navItems = [
  { label: "首页", to: "/" },
  { label: "记录", to: "/focus-list" },
  { label: "图表", to: "/charts" },
];

export function AppFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <span>Time Focus</span>
        <nav className="flex items-center gap-2" aria-label="页面导航">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 transition hover:bg-accent hover:text-accent-foreground ${
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : ""
                }`
              }
              end={item.to === "/"}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </footer>
  );
}
