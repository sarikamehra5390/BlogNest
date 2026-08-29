import conf from "../conf/conf";
import { Client, TablesDB, ID, Query } from "appwrite";

export class NotificationService {

    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
    }

    async createNotification(data) {
        try {
            return await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteNotificationsTableId,
                rowId: ID.unique(),
                data: {
                    ...data,
                    isRead: data.isRead ?? false,
                },
            });
        } catch (error) {
            console.log("Create Notification Error:", error);
            return null;
        }
    }

    async createLikeNotification({ receiverId, senderId, senderName, postId, postTitle }) {
        if (!receiverId || !senderId || receiverId === senderId) return null;
        return this.createNotification({
            receiverId,
            senderId,
            senderName,
            postId,
            postTitle,
            type: "like",
            message: `${senderName} liked your post "${postTitle}"`,
        });
    }

    async createCommentNotification({ receiverId, senderId, senderName, postId, postTitle, commentPreview }) {
        if (!receiverId || !senderId || receiverId === senderId) return null;
        const msg = commentPreview && commentPreview.length > 60
            ? `${senderName} commented on your post "${postTitle}": "${commentPreview.slice(0, 60)}..."`
            : commentPreview
                ? `${senderName} commented on your post "${postTitle}": "${commentPreview}"`
                : `${senderName} commented on your post "${postTitle}"`;
        return this.createNotification({
            receiverId,
            senderId,
            senderName,
            postId,
            postTitle,
            type: "comment",
            message: msg,
        });
    }

    async createFollowNotification({ receiverId, senderId, senderName }) {
        if (!receiverId || !senderId || receiverId === senderId) return null;
        return this.createNotification({
            receiverId,
            senderId,
            senderName,
            type: "follow",
            message: `${senderName} started following you`,
        });
    }

    async createBookmarkNotification({ receiverId, senderId, senderName, postId, postTitle }) {
        if (!receiverId || !senderId || receiverId === senderId) return null;
        return this.createNotification({
            receiverId,
            senderId,
            senderName,
            postId,
            postTitle,
            type: "bookmark",
            message: `${senderName} bookmarked your post "${postTitle}"`,
        });
    }

    async createBadgeNotification({ receiverId, badgeId, badgeName, badgeIcon, badgeDescription }) {
        if (!receiverId || !badgeId) return null;
        return this.createNotification({
            receiverId,
            badgeId,
            badgeName,
            badgeIcon,
            type: "badge",
            message: `🎉 Achievement Unlocked: "${badgeName}" — ${badgeDescription || "Keep it up!"}`,
        });
    }

    async getNotifications(receiverId) {
        try {
            const response = await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteNotificationsTableId,
                queries: [
                    Query.equal("receiverId", receiverId),
                    Query.orderDesc("$createdAt"),
                    Query.limit(100),
                ],
            });

            return response.rows;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.log("Get Notifications Error:", error);
            }
            return [];
        }
    }

    async getUnreadCount(receiverId) {
        try {
            const response = await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteNotificationsTableId,
                queries: [
                    Query.equal("receiverId", receiverId),
                    Query.equal("isRead", false),
                    Query.select(["$id"]),
                ],
            });
            return response?.rows?.length || 0;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.log("Get Unread Count Error:", error);
            }
            return 0;
        }
    }

    async markAsRead(notificationId) {
        try {
            return await this.databases.updateRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteNotificationsTableId,
                rowId: notificationId,
                data: {
                    isRead: true,
                },
            });
        } catch (error) {
            if (import.meta.env.DEV) {
                console.log("Mark As Read Error:", error);
            }
            return null;
        }
    }

    async markAllAsRead(receiverId) {
        try {
            const response = await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteNotificationsTableId,
                queries: [
                    Query.equal("receiverId", receiverId),
                    Query.equal("isRead", false),
                ],
            });

            const unread = response?.rows || [];

            if (unread.length === 0) return 0;

            await Promise.all(
                unread.map((n) => this.markAsRead(n.$id))
            );

            return unread.length;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.log("Mark All As Read Error:", error);
            }
            return 0;
        }
    }

    async deleteNotification(notificationId) {
        try {
            await this.databases.deleteRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteNotificationsTableId,
                rowId: notificationId,
            });

            return true;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.log(error);
            }
            return false;
        }
    }

    async deleteAllNotifications(receiverId) {
        try {
            const all = await this.getNotifications(receiverId);

            if (all.length === 0) return 0;

            await Promise.all(
                all.map((n) => this.deleteNotification(n.$id))
            );

            return all.length;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.log("Delete All Notifications Error:", error);
            }
            return 0;
        }
    }

}

const notificationService = new NotificationService();

export default notificationService;