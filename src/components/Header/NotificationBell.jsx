import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import notificationService from "../../appwrite/notificationService";
import realtimeService from "../../appwrite/realtimeService";

const NOTIFICATION_ICONS = {
    like: "❤️",
    comment: "💬",
    follow: "👤",
    bookmark: "🔖",
    badge: "🏅",
};

function NotificationBell() {

    const userData = useSelector((state) => state.auth.userData);

    const [notifications, setNotifications] = useState([]);
    const [loaded, setLoaded] = useState(false);

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

    const deleteNotification = useCallback(async (notificationId, e) => {

        e.stopPropagation();

        const success = await notificationService.deleteNotification(
            notificationId
        );

        if (success) {

            setNotifications((prev) =>
                prev.filter(
                    (item) => item.$id !== notificationId
                )
            );

        }

    }, []);

    useEffect(() => {

        let cancelled = false;
        let realtimeNotifUnsub = null;

        const loadNotifications = async () => {

            if (!userData) {
                setLoaded(true);
                return;
            }

            const data = await notificationService.getNotifications(
                userData.$id
            );

            if (!cancelled) {
                setNotifications(data.slice(0, 20));
                setLoaded(true);
            }

        };

        loadNotifications();

        if (userData) {

            realtimeNotifUnsub = realtimeService.subscribeToNotifications(
                userData.$id,
                (event) => {

                    const action = event?.events?.[0] || "";
                    const payload = event?.payload;

                    if (!payload) return;

                    if (action.includes(".create")) {

                        setNotifications((prev) => {

                            if (prev.some(n => n.$id === payload.$id)) {
                                return prev;
                            }

                            return [payload, ...prev].slice(0, 50);

                        });

                    } else if (action.includes(".update")) {

                        setNotifications((prev) =>
                            prev.map(n =>
                                n.$id === payload.$id
                                    ? { ...n, ...payload }
                                    : n
                            )
                        );

                    } else if (action.includes(".delete")) {

                        setNotifications((prev) =>
                            prev.filter(n => n.$id !== payload.$id)
                        );

                    }

                }
            );

        }

        return () => {

            cancelled = true;

            if (realtimeNotifUnsub && typeof realtimeNotifUnsub.unsubscribe === "function") {
                realtimeNotifUnsub.unsubscribe();
            }

        };

    }, [userData]);

    const previewList = notifications.slice(0, 8);

    return (
        <div className="relative">

            <button
                onClick={() => setOpen(!open)}
                className="relative"
                aria-label={`${unreadCount} unread notifications`}
            >

                <span className="text-2xl">
                    🔔
                </span>

                {loaded && unreadCount > 0 && (

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
                            animate-pulse
                        "
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
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

                    <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">

                        <h2 className="font-bold text-lg dark:text-white">
                            Notifications
                        </h2>

                        {loaded && unreadCount > 0 && (
                            <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2 py-1 rounded-full font-medium">
                                {unreadCount} new
                            </span>
                        )}

                    </div>

                    <div className="max-h-96 overflow-y-auto">

                        {!loaded ? (

                            <div className="p-6 text-center text-gray-500">
                                Loading...
                            </div>

                        ) : notifications.length === 0 ? (

                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">

                                <div className="text-4xl mb-2">🔕</div>
                                No notifications yet.

                            </div>


                        ) : (

                            previewList.map((notification) => {

                                const type = notification.type || "default";
                                const icon = NOTIFICATION_ICONS[type] || "📬";

                                return (

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

                                    <div className="flex items-start gap-3">

                                        <span className="text-2xl flex-shrink-0">{icon}</span>

                                        <div className="flex-1 min-w-0">

                                    <p className="text-sm dark:text-gray-200">
                                        {notification.message}
                                    </p>

                                    <small className="text-gray-500 dark:text-gray-400">

                                        {new Date(
                                            notification.$createdAt
                                        ).toLocaleString()}

                                    </small>

                                    <button
                                        onClick={(e) => deleteNotification(notification.$id, e)}
                                        className="
                                            mt-2
                                            text-red-500
                                            text-sm
                                            hover:text-red-700
                                        "
                                    >
                                        Delete
                                    </button>

                                        </div>

                                    </div>

                                </div>

                            );

                        })

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
