import { Link } from "@tanstack/react-router";
import { BookOpenText, History, Home, Settings, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

const items = [
  { to: "/", label: "المترجم", icon: Home },
  { to: "/phrases", label: "عبارات", icon: BookOpenText },
  { to: "/history", label: "السجل", icon: History },
  { to: "/settings", label: "الإعدادات", icon: SlidersHorizontal },
] as const;

export function Logo() {
  return <div className="flex items-center gap-3"><div className="logo-mark" aria-hidden="true"><span/><span/><i/><i/><i/></div><div><div className="text-[22px] font-bold leading-none text-primary">معلوم</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Maloom</div></div></div>;
}

export function MaloomShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background pb-24 md:pb-8" dir="rtl">
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur"><div className="mx-auto grid h-[76px] max-w-[1100px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 md:px-6"><Logo/><nav className="hidden items-center gap-1 md:flex">{items.map(({to,label,icon:Icon}) => <Link key={to} to={to} activeOptions={{exact:to==="/"}} className="nav-link" activeProps={{className:"nav-link nav-link-active"}}><Icon size={17}/>{label}</Link>)}</nav><Link to="/settings" className="icon-button md:hidden" aria-label="فتح الإعدادات"><Settings size={20}/></Link></div></header>
    <main className="mx-auto w-full max-w-[1100px] px-4 py-7 md:px-6 md:py-10">{children}</main>
    <nav className="mobile-nav md:hidden" aria-label="التنقل الرئيسي">{items.map(({to,label,icon:Icon}) => <Link key={to} to={to} activeOptions={{exact:to==="/"}} className="mobile-nav-link" activeProps={{className:"mobile-nav-link mobile-nav-active"}}><Icon size={21}/><span>{label}</span></Link>)}</nav>
  </div>;
}
