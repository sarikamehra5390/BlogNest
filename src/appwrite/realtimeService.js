import conf from "../conf/conf";
import { Client } from "appwrite";

class RealtimeService {

    client;

    constructor() {

        this.client = new Client()
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

    }

    subscribe(channels, callback) {

        try {

            return this.client.subscribe(channels, callback);

        } catch (error) {

            console.log("Realtime Service :: subscribe ::", error);

            return { unsubscribe: () => {} };

        }

    }

    subscribeToTable(databaseId, tableId, callback) {

        const channel = `databases.${databaseId}.tables.${tableId}.rows`;

        return this.subscribe(channel, callback);

    }

    subscribeToNotifications(userId, callback) {

        if (!conf.appwriteNotificationsTableId) {

            return { unsubscribe: () => {} };

        }

        return this.subscribeToTable(
            conf.appwriteDatabaseId,
            conf.appwriteNotificationsTableId,
            (response) => {

                const row = response?.payload;

                if (!row) return;

                if (row.receiverId !== userId) return;

                callback(response);

            }
        );

    }

    subscribeToBadges(userId, callback) {

        if (!conf.appwriteBadgesTableId) {

            return { unsubscribe: () => {} };

        }

        return this.subscribeToTable(
            conf.appwriteDatabaseId,
            conf.appwriteBadgesTableId,
            (response) => {

                const row = response?.payload;

                if (!row) return;

                if (row.userId !== userId) return;

                callback(response);

            }
        );

    }

    subscribeToLikes(postId, callback) {

        if (!conf.appwriteLikesTableId || !postId) {

            return { unsubscribe: () => {} };

        }

        return this.subscribeToTable(
            conf.appwriteDatabaseId,
            conf.appwriteLikesTableId,
            (response) => {

                const row = response?.payload;

                if (!row) return;

                if (row.postId !== postId) return;

                callback(response);

            }
        );

    }

    subscribeToComments(postId, callback) {

        if (!conf.appwriteCommentsTableId || !postId) {

            return { unsubscribe: () => {} };

        }

        return this.subscribeToTable(
            conf.appwriteDatabaseId,
            conf.appwriteCommentsTableId,
            (response) => {

                const row = response?.payload;

                if (!row) return;

                if (row.postId !== postId) return;

                callback(response);

            }
        );

    }

    subscribeToBookmarks(postId, callback) {

        if (!conf.appwriteBookmarksTableId || !postId) {

            return { unsubscribe: () => {} };

        }

        return this.subscribeToTable(
            conf.appwriteDatabaseId,
            conf.appwriteBookmarksTableId,
            (response) => {

                const row = response?.payload;

                if (!row) return;

                if (row.postId !== postId) return;

                callback(response);

            }
        );

    }

    subscribeToFollow(followingId, callback) {

        if (!conf.appwriteFollowTableId || !followingId) {

            return { unsubscribe: () => {} };

        }

        return this.subscribeToTable(
            conf.appwriteDatabaseId,
            conf.appwriteFollowTableId,
            (response) => {

                const row = response?.payload;

                if (!row) return;

                if (row.followingId !== followingId) return;

                callback(response);

            }
        );

    }

}

const realtimeService = new RealtimeService();

export default realtimeService;
