import conf from "../conf/conf";
import { Client, ID, TablesDB, Query } from "appwrite";

export class BookmarkService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
    }

    // Save a post
    async bookmarkPost(postId, userId) {
        try {
            return await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteBookmarksTableId,
                rowId: ID.unique(),
                data: {
                    postId,
                    userId,
                },
            });
        } catch (error) {
            console.log("BookmarkService :: bookmarkPost ::", error);
            return false;
        }
    }

    // Get all bookmarks of a user
    async getBookmarks(userId) {
        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteBookmarksTableId,
                queries: [
                    Query.equal("userId", userId),
                ],
            });
        } catch (error) {
            console.log("BookmarkService :: getBookmarks ::", error);
            return false;
        }
    }

    // Get all bookmarks for a specific post
    async getBookmarksByPost(postId) {
        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteBookmarksTableId,
                queries: [
                    Query.equal("postId", postId),
                ],
            });
        } catch (error) {
            console.log("BookmarkService :: getBookmarksByPost ::", error);
            return { rows: [] };
        }
    }

    // Check if a post is bookmarked
    async getUserBookmark(postId, userId) {
        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteBookmarksTableId,
                queries: [
                    Query.equal("postId", postId),
                    Query.equal("userId", userId),
                ],
            });
        } catch (error) {
            console.log("BookmarkService :: getUserBookmark ::", error);
            return false;
        }
    }

    // Remove bookmark
    async removeBookmark(bookmarkId) {
        try {
            await this.databases.deleteRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteBookmarksTableId,
                rowId: bookmarkId,
            });

            return true;
        } catch (error) {
            console.log("BookmarkService :: removeBookmark ::", error);
            return false;
        }
    }
}

const bookmarkService = new BookmarkService();

export default bookmarkService;