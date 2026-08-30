import conf from "../conf/conf";
import { Client, Permission, Role, TablesDB, Query } from "appwrite";
import { createInteractionId } from "../utils/interactionId";

const assertConfigured = () => {
    if (
        !conf.appwriteDatabaseId ||
        !conf.appwriteLikesTableId
    ) {
        throw new Error(
            "Likes are not configured. Check VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_LIKES_TABLE_ID."
        );
    }
};

export class LikeService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
    }

    // -----------------------------------------
    // Get all likes for a post
    // -----------------------------------------
    async getLikes(postId) {
        assertConfigured();

        if (!postId) {
            throw new Error("Post ID is required.");
        }

        return await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteLikesTableId,
            queries: [
                Query.equal("postId", postId),
                Query.limit(100),
            ],
        });
    }

    // -----------------------------------------
    // Get current user's like for a post
    // -----------------------------------------
    async getUserLike(postId, userId) {
        assertConfigured();

        if (!postId || !userId) {
            throw new Error(
                "Post ID and User ID are required."
            );
        }

        return await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteLikesTableId,
            queries: [
                Query.equal("postId", postId),
                Query.equal("userId", userId),
                Query.limit(1),
            ],
        });
    }

    // -----------------------------------------
    // Like post
    // -----------------------------------------
    async likePost(postId, userId) {
        assertConfigured();

        if (!postId || !userId) {
            throw new Error(
                "Post ID and User ID are required."
            );
        }

        // Check whether like already exists
        const existing = await this.getUserLike(
            postId,
            userId
        );

        if (existing?.rows?.length > 0) {
            return {
                like: existing.rows[0],
                created: false,
            };
        }

        try {
            const rowId = await createInteractionId(
                "like",
                userId,
                postId
            );

            const like = await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteLikesTableId,
                rowId,
                data: {
                    postId: postId,
                    userId: userId,
                },
                permissions: [
                    Permission.read(Role.any()),
                    Permission.delete(Role.user(userId)),
                ],
            });

            return {
                like,
                created: true,
            };
        } catch (error) {
            console.error("LIKE CREATE ERROR:", error);

            // Another request may have created it
            if (error?.code === 409) {
                const current = await this.getUserLike(
                    postId,
                    userId
                );

                if (current?.rows?.length > 0) {
                    return {
                        like: current.rows[0],
                        created: false,
                    };
                }
            }

            throw error;
        }
    }

    // -----------------------------------------
    // Unlike post
    // -----------------------------------------
    async unlikePost(postId, userId) {
        assertConfigured();

        if (!postId || !userId) {
            throw new Error(
                "Post ID and User ID are required."
            );
        }

        const current = await this.getUserLike(
            postId,
            userId
        );

        const rows = current?.rows || [];

        if (rows.length === 0) {
            return false;
        }

        try {
            for (const row of rows) {
                await this.databases.deleteRow({
                    databaseId: conf.appwriteDatabaseId,
                    tableId: conf.appwriteLikesTableId,
                    rowId: row.$id,
                });
            }

            return true;
        } catch (error) {
            console.error("UNLIKE ERROR:", error);
            throw error;
        }
    }
}

export default new LikeService();