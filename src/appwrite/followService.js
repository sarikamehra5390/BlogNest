import conf from "../conf/conf";
import { Client, TablesDB, Query } from "appwrite";

export class FollowService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
    }

    // ==========================================
    // FOLLOW AUTHOR
    // ==========================================
    async followAuthor(followerId, followingId) {
        if (!followerId || !followingId) {
            throw new Error("Follower and following user IDs are required.");
        }

        if (followerId === followingId) {
            throw new Error("You cannot follow yourself.");
        }

        try {
            // Check if already following
            const existing = await this.getFollow(
                followerId,
                followingId
            );

            if (existing?.rows?.length > 0) {
                return existing.rows[0];
            }

            // A deterministic row ID makes concurrent/repeated requests for the same
            // relationship collide safely instead of creating duplicate rows.
            const pair = `${followerId}:${followingId}`;
            const digest = await globalThis.crypto.subtle.digest(
                "SHA-256",
                new TextEncoder().encode(pair)
            );
            const rowId = Array.from(new Uint8Array(digest))
                .slice(0, 16)
                .map((byte) => byte.toString(16).padStart(2, "0"))
                .join("");

            try {
                return await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                rowId,
                data: {
                    followerId,
                    followingId,
                },
            });
            } catch (error) {
                // A concurrent request may have created this deterministic row.
                if (error?.code === 409) {
                    const raced = await this.getFollow(followerId, followingId);
                    if (raced?.rows?.length) return raced.rows[0];
                }
                throw error;
            }

        } catch (error) {
            console.error("Follow author failed:", error);
            throw error;
        }
    }

    // ==========================================
    // UNFOLLOW AUTHOR
    // ==========================================
    async unfollowAuthor(followId) {
        if (!followId) {
            throw new Error("Follow ID is required.");
        }

        try {
            await this.databases.deleteRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                rowId: followId,
            });

            return true;

        } catch (error) {
            console.error("Unfollow author failed:", error);
            throw error;
        }
    }

    // ==========================================
    // CHECK IF USER FOLLOWS AUTHOR
    // ==========================================
    async getFollow(followerId, followingId) {
        if (!followerId || !followingId) {
            throw new Error(
                "Follower and following user IDs are required."
            );
        }

        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                queries: [
                    Query.equal("followerId", followerId),
                    Query.equal("followingId", followingId),
                    Query.limit(1),
                ],
            });

        } catch (error) {
            console.error("Get follow failed:", error);
            throw error;
        }
    }

    // ==========================================
    // GET FOLLOWERS
    // ==========================================
    async getFollowers(userId) {
        if (!userId) {
            throw new Error("User ID is required.");
        }

        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                queries: [
                    Query.equal("followingId", userId),
                    Query.limit(100),
                ],
            });

        } catch (error) {
            console.error("Get followers failed:", error);
            throw error;
        }
    }

    // ==========================================
    // GET FOLLOWING
    // ==========================================
    async getFollowing(userId) {
        if (!userId) {
            throw new Error("User ID is required.");
        }

        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                queries: [
                    Query.equal("followerId", userId),
                    Query.limit(100),
                ],
            });

        } catch (error) {
            console.error("Get following failed:", error);
            throw error;
        }
    }
}

const followService = new FollowService();

export default followService;
