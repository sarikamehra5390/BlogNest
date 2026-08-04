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

    // Create Notification
    async createNotification(data) {
        try {
            return await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteNotificationsTableId,
                rowId: ID.unique(),
                data,
            });
        } catch (error) {
            console.log("Create Notification Error:", error);
            return null;
        }
    }

    // Get all notifications of a user
   async getNotifications(receiverId) {
    try {

        const response = await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteNotificationsTableId,
            queries: [
                Query.equal("receiverId", receiverId),
                Query.orderDesc("$createdAt"),
            ],
        });

        return response.rows;      //  Return only the array

    } catch (error) {

        console.log("Get Notifications Error:", error);

        return [];                 //  Return an empty array

    }
}

    // Mark notification as read
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
            console.log("Mark As Read Error:", error);
            return null;
        }
    }

    // Delete notification
   async deleteNotification(notificationId) {

    try {

        await this.databases.deleteRow({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteNotificationsTableId,
            rowId: notificationId,
        });

        return true;

    } catch (error) {

        console.log(error);

        return false;

    }

}
}

const notificationService = new NotificationService();

export default notificationService;