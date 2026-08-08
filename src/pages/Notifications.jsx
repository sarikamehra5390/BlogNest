import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

import notificationService from "../appwrite/notificationService";
import realtimeService from "../appwrite/realtimeService";
import { Container } from "../components";

const NOTIFICATION_ICONS = {
    like: "❤️",
    comment: "💬",
    follow: "👤",
    bookmark: "🔖",
    badge: "🏅",
};

function Notifications() {

    const userData = useSelector(
        (state) => state.auth.userData
    );

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAllRead, setMarkingAllRead] = useState(false);

    const markAllAsRead = useCallback(async () => {
        if (!userData) return;
        setMarkingAllRead(true);
        try {
            const count = await notificationService.markAllAsRead(userData.$id);
            if (count > 0) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true }))
                );
            }
        } finally {
            setMarkingAllRead(false);
        }
    }, [userData]);

    const deleteNotification = useCallback(async (id) => {

        const success =
            await notificationService.deleteNotification(id);

        if (success) {

            setNotifications((prev) =>
                prev.filter(
                    (notification) =>
                        notification.$id !== id
                )
            );

        }

    }, []);

    useEffect(() => {

        let cancelled = false;
        let realtimeUnsub = null;

        const loadNotifications = async () => {

            if (!userData) return;

            try {

                const data =
                    await notificationService.getNotifications(
                        userData.$id
                    );

                if (!cancelled) {
                    setNotifications(data);
                }

            } catch (error) {

                console.log(error);

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        };

        loadNotifications();

        if (userData) {

            realtimeUnsub = realtimeService.subscribeToNotifications(
                userData.$id,
                (event) => {

                    const action = event?.events?.[0] || "";
                    const payload = event?.payload;

                    if (!payload) return;

                    if (action.includes(".create")) {

                        setNotifications((prev) => {
                            if (prev.some(n => n.$id === payload.$id)) return prev;
                            return [payload, ...prev];
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
            if (realtimeUnsub && typeof realtimeUnsub.unsubscribe === "function") {
                realtimeUnsub.unsubscribe();
            }
        };

    }, [userData]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (loading) {

        return (

            <Container>

                <div className="py-10 text-center">

                    Loading Notifications...

                </div>

            </Container>

        );

    }

    return (

        <Container>

            <div className="max-w-3xl mx-auto py-10">

                <div className="flex flex-wrap justify-between items-center mb-8 gap-4">

                    <div className="flex items-center gap-3">

                        <h1 className="text-3xl font-bold dark:text-white">

                            Notifications

                        </h1>

                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded-full min-w-[28px] h-7 px-2">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}

                    </div>

                    <button
                       onClick={markAllAsRead}
                       disabled={unreadCount === 0 || markingAllRead}
                       className="
                            bg-blue-600
                            text-white
                              px-4
                              py-2
                              rounded-lg
                            disabled:bg-gray-400
                              disabled:cursor-not-allowed
                             "
                    >
                        {markingAllRead ? "Processing..." : "Mark All Read"}
                   </button>
                </div>

                {notifications.length === 0 ? (

                   <div
    className="
        bg-white
        dark:bg-slate-900
        rounded-xl
        p-10
        text-center
    "
>

    <div className="text-6xl mb-4">
        🔔
    </div>

    <h2 className="text-2xl font-bold dark:text-white">
        No Notifications
    </h2>

    <p className="text-gray-500 mt-2 dark:text-gray-400">
        You're all caught up!
    </p>

</div>

                ) : (

                    notifications.map((notification) => {

                        const type = notification.type || "default";
                        const icon = NOTIFICATION_ICONS[type] || "📬";

                        return (

                        <div
                            key={notification.$id}
                            className={`
                                mb-4
                                p-5
                                rounded-xl
                                border
                                dark:border-slate-700
                                ${
                                    !notification.isRead
                                        ? "bg-blue-50 dark:bg-slate-800"
                                        : "bg-white dark:bg-slate-900"
                                }
                            `}
                        >

                            <div className="flex items-start gap-4">

                                <div className="text-3xl flex-shrink-0">{icon}</div>

                                <div className="flex-1 min-w-0">

                            {!notification.isRead && (

                         <span
                           className="
                             inline-block
                           bg-blue-600
                            text-white
                             text-xs
                              px-2
                              py-1
                              rounded-full
                              mb-3
                            "
                           >
                               New
                           </span>

                         )}

                          <p
                            className="
                                  text-lg
                                  font-medium
                                dark:text-white
                                "
                            >
                              {notification.message}
                           </p>

                            <small
                                className="
                                    text-gray-500
                                    dark:text-gray-400
                                    block
                                    mt-1
                                "
                            >

                                {new Date(
                                    notification.$createdAt
                                ).toLocaleString()}

                            </small>

                            <div className="mt-4">

                               <button
                                onClick={() =>
                                deleteNotification(notification.$id)
                                }
                                className="
                                text-red-500
                                hover:text-red-700
                                  text-sm
                                  font-medium
                                "
                                >
                               🗑 Delete
                             </button>
                            </div>

                                </div>

                            </div>

                        </div>
                    );

                    })

                )}

            </div>

        </Container>

    );

}

export default Notifications;