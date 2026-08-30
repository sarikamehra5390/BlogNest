import { useContext, useState } from "react";
import { Container, Logo, LogoutBtn, SearchBar } from "../index";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ThemeContext from "../../context/ThemeContext";
import { Menu, Moon, PenLine, Sun, X } from "lucide-react";
import NotificationBell from "./NotificationBell";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const { dark, setDark } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const navItems = authStatus
    ? [["Explore", "/all-posts"], ["Saved", "/saved-posts"], ["History", "/history"], ["Profile", "/profile"]]
    : [["Explore", "/all-posts"], ["Sign in", "/login"]];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <Container>
        <nav className="flex min-h-18 items-center justify-between gap-3 py-3" aria-label="Main navigation">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-lg focus:outline-none" aria-label="BlogNest home">
            <Logo width="38px" />
            <span className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">BlogNest</span>
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center px-5 lg:flex"><SearchBar /></div>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map(([name, path]) => (
              <NavLink key={path} to={path} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"}`}>
                {name}
              </NavLink>
            ))}
            {authStatus ? <>
              <Link to="/add-post" className="ml-2 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:bg-indigo-700 hover:shadow-md"><PenLine size={15} /> Write</Link>
              <NotificationBell />
              <LogoutBtn />
            </> : <Link to="/signup" className="ml-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">Get started</Link>}
            <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" className="ml-1 grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {authStatus && <NotificationBell />}
            <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation menu" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-200">{open ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </nav>
        <div className="pb-3 lg:hidden"><SearchBar /></div>
        {open && <div className="border-t border-slate-200 py-3 dark:border-slate-800 md:hidden">
          <div className="grid gap-1">
            {navItems.map(([name, path]) => <NavLink onClick={() => setOpen(false)} key={path} to={path} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900">{name}</NavLink>)}
            {authStatus ? <><NavLink onClick={() => setOpen(false)} to="/add-post" className="rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white">Write an article</NavLink><LogoutBtn /></> : <NavLink onClick={() => setOpen(false)} to="/signup" className="rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white">Get started</NavLink>}
          </div>
        </div>}
      </Container>
    </header>
  );
}

export default Header;
