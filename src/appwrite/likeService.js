import conf from "../conf/conf";
import { Client, Permission, Role, TablesDB, Query } from "appwrite";
import { createInteractionId } from "../utils/interactionId";

const assertConfigured = () => {
  if (!conf.appwriteDatabaseId || !conf.appwriteLikesTableId) {
    throw new Error("Likes are not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_LIKES_TABLE_ID.");
  }
};

export class LikeService {
  client = new Client();
  databases;

  constructor() {
    this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
    this.databases = new TablesDB(this.client);
  }

  async getLikes(postId) {
    assertConfigured();
    return this.databases.listRows({ databaseId: conf.appwriteDatabaseId, tableId: conf.appwriteLikesTableId, queries: [Query.equal("postId", postId), Query.limit(100)] });
  }

  async getUserLike(postId, userId) {
    assertConfigured();
    if (!postId || !userId) throw new Error("A post and authenticated user are required to like a post.");
    return this.databases.listRows({ databaseId: conf.appwriteDatabaseId, tableId: conf.appwriteLikesTableId, queries: [Query.equal("postId", postId), Query.equal("userId", userId), Query.limit(100)] });
  }

  async likePost(postId, userId) {
    const existing = await this.getUserLike(postId, userId);
    if (existing.rows?.length) return { like: existing.rows[0], created: false };
    try {
      const like = await this.databases.createRow({
        databaseId: conf.appwriteDatabaseId,
        tableId: conf.appwriteLikesTableId,
        rowId: await createInteractionId("like", userId, postId),
        data: { postId, userId },
        permissions: [
          Permission.read(Role.any()),
          Permission.delete(Role.user(userId)),
        ],
      });
      return { like, created: true };
    } catch (error) {
      // A simultaneous request creates the same deterministic row id.
      if (error?.code === 409) {
        const current = await this.getUserLike(postId, userId);
        if (current.rows?.length) return { like: current.rows[0], created: false };
      }
      if (import.meta.env.DEV) console.error("Like operation failed:", error);
      throw error;
    }
  }

  async unlikePost(postId, userId) {
    const current = await this.getUserLike(postId, userId);
    const rows = current.rows || [];
    if (rows.length === 0) return false;
    try {
      // Also remove rows created by older versions with random IDs.
      await Promise.all(rows.map((row) => this.databases.deleteRow({ databaseId: conf.appwriteDatabaseId, tableId: conf.appwriteLikesTableId, rowId: row.$id })));
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Unlike operation failed:", error);
      throw error;
    }
  }
}

export default new LikeService();
