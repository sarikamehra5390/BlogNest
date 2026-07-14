import React from "react";
import { useDispatch } from "react-redux";
import authService from "../../appwrite/auth";
import { logout } from "../../store/authSlice";
import toast from "react-hot-toast";

function LogoutBtn() {
    const dispatch = useDispatch();

    const logoutHandler = () => {
        authService
            .logout()
            .then(() => {
                dispatch(logout());

                 toast.success("Logged out successfully 👋");
            })
            .catch(() => {
                dispatch(logout());
            });
    };

    return (
        <button
            onClick={logoutHandler}
          className="
px-4
py-2
rounded-lg
font-medium
text-red-600
hover:bg-red-50
hover:text-red-700
transition-all
duration-300
"
        >
            Logout
        </button>
    );
}

export default LogoutBtn;