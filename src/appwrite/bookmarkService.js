import conf from "../conf/conf";
import { Client, Permission, Role, TablesDB, Query } from "appwrite";
import { createInteractionId } from "../utils/interactionId";

const assertConfigured = () => {
  if (!conf.appwriteDatabaseId || !conf.appwriteBookmarksTableId) {
    throw new Error("Bookmarks are not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_BOOKMARKS_TABLE_ID.");
  }
};

export class BookmarkService {
  client = new Client();
  databases;

  constructor() {
    this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
    this.databases = new TablesDB(this.client);
  }

  async getBookmarks(userId) {
    assertConfigured();
    if (!userId) throw new Error("An authenticated user is required to load bookmarks.");
    return this.databases.listRows({ databaseId: conf.appwriteDatabaseId, tableId: conf.appwriteBookmarksTableId, queries: [Query.equal("userId", userId), Query.limit(100)] });
  }

  async getBookmarksByPost(postId) {
    assertConfigured();
    return this.databases.listRows({ databaseId: conf.appwriteDatabaseId, tableId: conf.appwriteBookmarksTableId, queries: [Query.equal("postId", postId), Query.limit(100)] });
  }

  async getUserBookmark(postId, userId) {
    assertConfigured();
    if (!postId || !userId) throw new Error("A post and authenticated user are required to save a post.");
    return this.databases.listRows({ databaseId: conf.appwriteDatabaseId, tableId: conf.appwriteBookmarksTableId, queries: [Query.equal("postId", postId), Query.equal("userId", userId), Query.limit(100)] });
  }

  async bookmarkPost(postId, userId) {
    const existing = await this.getUserBookmark(postId, userId);
    if (existing.rows?.length) return { bookmark: existing.rows[0], created: false };
    try {
      const bookmark = await this.databases.createRow({
        databaseId: conf.appwriteDatabaseId,
        tableId: conf.appwriteBookmarksTableId,
        rowId: await createInteractionId("bookmark", userId, postId),
        data: { postId, userId },
        permissions: [
          Permission.read(Role.any()),
          Permission.delete(Role.user(userId)),
        ],
      });
      return { bookmark, created: true };
    } catch (error) {
      if (error?.code === 409) {
        const current = await this.getUserBookmark(postId, userId);
        if (current.rows?.length) return { bookmark: current.rows[0], created: false };
      }
      if (import.meta.env.DEV) console.error("Bookmark operation failed:", error);
      throw error;
    }
  }

  async removeBookmark(postId, userId) {
    const current = await this.getUserBookmark(postId, userId);
    const rows = current.rows || [];
    if (rows.length === 0) return false;
    try {
      await Promise.all(rows.map((row) => this.databases.deleteRow({ databaseId: conf.appwriteDatabaseId, tableId: conf.appwriteBookmarksTableId, rowId: row.$id })));
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Remove bookmark operation failed:", error);
      throw error;
    }
  }
}

export default new BookmarkService();
