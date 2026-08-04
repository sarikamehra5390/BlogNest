import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import notificationService from "../../appwrite/notificationService";

function NotificationBell() {

    const userData = useSelector((state) => state.auth.userData);

    const [notifications, setNotifications] = useState([]);

    const unreadCount = notifications.filter(
        notification => !notification.isRead
    ).length;

    const [open, setOpen] = useState(false);

    const handleNotificationClick = async (notification) => {

    if (!notification.isRead) {

        await notificationService.markAsRead(notification.$id);

        setNotifications((prev) =>
            prev.map((item) =>
                item.$id === notification.$id
                    ? { ...item, isRead: true }
                    : item
            )
        );

    }

};

    useEffect(() => {

        const loadNotifications = async () => {

            if (!userData) return;

            const data = await notificationService.getNotifications(
                userData.$id
            );

            setNotifications(data);

        };

        loadNotifications();

    }, [userData]);

    return (
        <div className="relative">

        <button
           onClick={() => setOpen(!open)}
           className="relative"
        >

            <span className="text-2xl">
                🔔
            </span>

            {unreadCount > 0 && (

                <span
                    className="
                        absolute
                        -top-2
                        -right-2
                        bg-red-600
                        text-white
                        text-xs
                        rounded-full
                        w-5
                        h-5
                        flex
                        items-center
                        justify-center
                    "
                >
                    {unreadCount}
                </span>

            )}

        </button>

        {open && (

    <div
        className="
            absolute
            right-0
            mt-3
            w-96
            bg-white
            dark:bg-slate-900
            rounded-2xl
            shadow-xl
            border
            dark:border-slate-700
            z-50
        "
    >

        <div className="p-4 border-b dark:border-slate-700">

            <h2 className="font-bold text-lg">
                Notifications
            </h2>

        </div>

        <div className="max-h-96 overflow-y-auto">

            {notifications.length === 0 ? (

                <div className="p-6 text-center text-gray-500">

                    No notifications yet.

                </div>

                

            ) : (

                notifications.map((notification) => (

                  <div
    key={notification.$id}
    onClick={() => handleNotificationClick(notification)}
    className={`
        p-4
        border-b
        dark:border-slate-700
        hover:bg-slate-100
        dark:hover:bg-slate-800
        cursor-pointer
        transition
        ${
            !notification.isRead
                ? "bg-blue-50 dark:bg-slate-800"
                : ""
        }
    `}
>

                        <p className="text-sm">

                            {notification.message}

                        </p>

                        <small className="text-gray-500">

                            {new Date(
                                notification.$createdAt
                            ).toLocaleString()}

                        </small>

                        <button
    onClick={async (e) => {

        e.stopPropagation();

        const success =
            await notificationService.deleteNotification(
                notification.$id
            );

        if (success) {

            setNotifications((prev) =>
                prev.filter(
                    (item) => item.$id !== notification.$id
                )
            );

        }

    }}
    className="
        mt-3
        text-red-500
        text-sm
        hover:text-red-700
    "
>
    Delete
</button>

                    </div>

                ))

            )}

        </div>

        <div className="border-t dark:border-slate-700 p-3">

    <Link
        to="/notifications"
        onClick={() => setOpen(false)}
        className="
            block
            text-center
            text-blue-600
            hover:underline
            font-medium
        "
    >
        View All Notifications
    </Link>

</div>

    </div>

)}
</div>

      );

}

export default NotificationBell;