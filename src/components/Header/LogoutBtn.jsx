import { useState } from "react";
import { useDispatch } from "react-redux";
import authService from "../../appwrite/auth";
import { logout } from "../../store/authSlice";
import toast from "react-hot-toast";

function LogoutBtn() {
    const dispatch = useDispatch();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const logoutHandler = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            const success = await authService.logout();
            if (success) {
                dispatch(logout());
                toast.success("Logged out successfully 👋");
            } else {
                toast.error("Unable to end the current session. Please try again.");
            }
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <button
            onClick={logoutHandler}
            disabled={isLoggingOut}
          className="
px-4
py-2
rounded-lg
font-medium
text-red-600
hover:bg-red-50
dark:hover:bg-red-950/40
dark:text-red-300
hover:text-red-700
transition-all
duration-300
"
        >
            {isLoggingOut ? "Logging out…" : "Logout"}
        </button>
    );
}

export default LogoutBtn;
