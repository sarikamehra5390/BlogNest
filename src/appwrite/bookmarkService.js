import conf from "../conf/conf";
import { Client, Permission, Role, TablesDB, Query } from "appwrite";
import { createInteractionId } from "../utils/interactionId";

const assertConfigured = () => {
    if (
        !conf.appwriteDatabaseId ||
        !conf.appwriteBookmarksTableId
    ) {
        throw new Error(
            "Bookmarks are not configured. Check VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_BOOKMARKS_TABLE_ID."
        );
    }
};

export class BookmarkService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
    }

    // -----------------------------------------
    // Get all bookmarks of a user
    // -----------------------------------------
    async getBookmarks(userId) {
        assertConfigured();

        if (!userId) {
            throw new Error(
                "User ID is required."
            );
        }

        return await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteBookmarksTableId,
            queries: [
                Query.equal("userId", userId),
                Query.limit(100),
            ],
        });
    }

    // -----------------------------------------
    // Get bookmarks for a post
    // -----------------------------------------
    async getBookmarksByPost(postId) {
        assertConfigured();

        if (!postId) {
            throw new Error(
                "Post ID is required."
            );
        }

        return await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteBookmarksTableId,
            queries: [
                Query.equal("postId", postId),
                Query.limit(100),
            ],
        });
    }

    // -----------------------------------------
    // Get current user's bookmark
    // -----------------------------------------
    async getUserBookmark(postId, userId) {
        assertConfigured();

        if (!postId || !userId) {
            throw new Error(
                "Post ID and User ID are required."
            );
        }

        return await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteBookmarksTableId,
            queries: [
                Query.equal("postId", postId),
                Query.equal("userId", userId),
                Query.limit(1),
            ],
        });
    }

    // -----------------------------------------
    // Bookmark post
    // -----------------------------------------
    async bookmarkPost(postId, userId) {
        assertConfigured();

        if (!postId || !userId) {
            throw new Error(
                "Post ID and User ID are required."
            );
        }

        const existing = await this.getUserBookmark(
            postId,
            userId
        );

        if (existing?.rows?.length > 0) {
            return {
                bookmark: existing.rows[0],
                created: false,
            };
        }

        try {
            const rowId = await createInteractionId(
                "bookmark",
                userId,
                postId
            );

            const bookmark = await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteBookmarksTableId,
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
                bookmark,
                created: true,
            };
        } catch (error) {
            console.error(
                "BOOKMARK CREATE ERROR:",
                error
            );

            if (error?.code === 409) {
                const current =
                    await this.getUserBookmark(
                        postId,
                        userId
                    );

                if (current?.rows?.length > 0) {
                    return {
                        bookmark: current.rows[0],
                        created: false,
                    };
                }
            }

            throw error;
        }
    }

    // -----------------------------------------
    // Remove bookmark
    // -----------------------------------------
    async removeBookmark(postId, userId) {
        assertConfigured();

        if (!postId || !userId) {
            throw new Error(
                "Post ID and User ID are required."
            );
        }

        const current =
            await this.getUserBookmark(
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
                    tableId: conf.appwriteBookmarksTableId,
                    rowId: row.$id,
                });
            }

            return true;
        } catch (error) {
            console.error(
                "REMOVE BOOKMARK ERROR:",
                error
            );

            throw error;
        }
    }
}

export default new BookmarkService();