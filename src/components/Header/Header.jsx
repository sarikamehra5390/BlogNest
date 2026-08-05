import React, { useContext } from "react";
import { Container, Logo, LogoutBtn, SearchBar } from "../index";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ThemeContext from "../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import NotificationBell from "./NotificationBell";

function Header() {
    const authStatus = useSelector((state) => state.auth.status);

    const navigate = useNavigate();

    const { dark, setDark } = useContext(ThemeContext);

    const navItems = [
        {
            name: "Home",
            slug: "/",
            active: true,
        },
        {
            name: "Login",
            slug: "/login",
            active: !authStatus,
        },
        {
            name: "Signup",
            slug: "/signup",
            active: !authStatus,
        },
        {
            name: "All Posts",
            slug: "/all-posts",
            active: authStatus,
        },
        {
            name: "Add Post",
            slug: "/add-post",
            active: authStatus,
        },
        {
            name: "Saved Posts",
            slug: "/saved-posts",
            active: authStatus,
        },
        {
            name: "Profile",
            slug: "/profile",
            active: authStatus,
        },
        {
            name: "History",
            slug: "/history",
            active: authStatus,
        },
    ];

    return (
        <header
            className="
                sticky
                top-0
                z-50
                bg-white/90
                dark:bg-slate-900/90
                backdrop-blur-md
                border-b
                border-slate-200
                dark:border-slate-700
                shadow-sm
                transition-colors
                duration-300
            "
        >
            <Container>
                <nav className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="flex items-center gap-3">

                        <Link to="/">
                            <Logo width="55px" />
                        </Link>

                        <h1
                            className="
                                text-2xl
                                font-bold
                                text-slate-800
                                dark:text-white
                                tracking-tight
                            "
                        >
                            BlogNest
                        </h1>

                    </div>

                    {/* Search */}
                    <div className="hidden lg:flex flex-1 justify-center px-8">
                        <SearchBar />
                    </div>

                    {/* Navigation */}
                    <ul className="flex items-center gap-2">

                        {navItems.map((item) =>
                            item.active ? (
                                <li key={item.slug}>
                                    <button
                                        onClick={() => navigate(item.slug)}
                                        className="
                                            px-4
                                            py-2
                                            rounded-lg
                                            font-medium
                                            text-slate-700
                                            dark:text-slate-200
                                            hover:bg-blue-100
                                            dark:hover:bg-slate-800
                                            hover:text-blue-700
                                            dark:hover:text-blue-400
                                            transition-all
                                            duration-300
                                        "
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ) : null
                        )}

                        {/* Notification Bell */}
                        {authStatus && (
                            <li>
                                <NotificationBell />
                            </li>
                        )}

                        {/* Logout */}
                        {authStatus && (
                            <li>
                                <LogoutBtn />
                            </li>
                        )}

                        {/* Dark Mode */}
                        <li>
                            <button
                                onClick={() => setDark(!dark)}
                                className="
                                    ml-2
                                    w-10
                                    h-10
                                    rounded-full
                                    flex
                                    items-center
                                    justify-center
                                    bg-slate-100
                                    dark:bg-slate-800
                                    hover:bg-blue-100
                                    dark:hover:bg-slate-700
                                    transition-all
                                    duration-300
                                "
                            >
                                {dark ? (
                                    <Sun size={20} />
                                ) : (
                                    <Moon size={20} />
                                )}
                            </button>
                        </li>

                    </ul>

                </nav>
            </Container>
        </header>
    );
}

export default Header;