import conf from "../conf/conf";
import { Client, TablesDB, ID, Query } from "appwrite";

export class FollowService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        // ✅ Correct
        this.databases = new TablesDB(this.client);
    }

    // Follow an author
    async followAuthor(followerId, followingId) {
        try {
            return await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                rowId: ID.unique(),
                data: {
                    followerId,
                    followingId,
                },
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // Unfollow an author
    async unfollowAuthor(followId) {
        try {
            await this.databases.deleteRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                rowId: followId,
            });

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // Check if current user follows an author
    async getFollow(followerId, followingId) {
        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                queries: [
                    Query.equal("followerId", followerId),
                    Query.equal("followingId", followingId),
                ],
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // Get followers
    async getFollowers(userId) {
        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                queries: [
                    Query.equal("followingId", userId),
                ],
            });
        } catch (error) {
            console.log(error);
            return { rows: [] };
        }
    }

    // Get following
    async getFollowing(userId) {
        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteFollowTableId,
                queries: [
                    Query.equal("followerId", userId),
                ],
            });
        } catch (error) {
            console.log(error);
            return { rows: [] };
        }
    }
}

const followService = new FollowService();

export default followService;