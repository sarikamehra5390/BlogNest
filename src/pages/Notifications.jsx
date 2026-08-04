import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import notificationService from "../appwrite/notificationService";
import { Container } from "../components";

function Notifications() {

    const userData = useSelector(
        (state) => state.auth.userData
    );

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadNotifications = async () => {

            if (!userData) return;

            try {

                const data =
                    await notificationService.getNotifications(
                        userData.$id
                    );

                setNotifications(data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

        loadNotifications();

    }, [userData]);

    const markAllAsRead = async () => {

        await Promise.all(

            notifications.map((notification) => {

                if (!notification.isRead) {

                    return notificationService.markAsRead(
                        notification.$id
                    );

                }

                return Promise.resolve();

            })

        );

        setNotifications((prev) =>
            prev.map((notification) => ({
                ...notification,
                isRead: true,
            }))
        );

    };

    const deleteNotification = async (id) => {

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

    };

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

                <div className="flex justify-between items-center mb-8">

                    <h1 className="text-3xl font-bold dark:text-white">

                        Notifications

                    </h1>

                    <button
                       onClick={markAllAsRead}
                       disabled={!notifications.some(n => !n.isRead)}
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
                        Mark All Read
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

    <h2 className="text-2xl font-bold">
        No Notifications
    </h2>

    <p className="text-gray-500 mt-2">
        You're all caught up!
    </p>

</div>

                ) : (

                    notifications.map((notification) => (

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

                    ))

                )}

            </div>

        </Container>

    );

}

export default Notifications;