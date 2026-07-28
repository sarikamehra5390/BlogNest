import conf from "../conf/conf";
import { Client, ID, TablesDB, Query } from "appwrite";

export class LikeService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
    }

    // Like a post
    async likePost(postId, userId) {
        try {
            return await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteLikesTableId,
                rowId: ID.unique(),
                data: {
                    postId,
                    userId,
                },
            });
        } catch (error) {
            console.log("Like Service :: likePost ::", error);
            return false;
        }
    }

    // Get all likes for a post
    async getLikes(postId) {
        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteLikesTableId,
                queries: [
                    Query.equal("postId", postId),
                ],
            });
        } catch (error) {
            console.log("Like Service :: getLikes ::", error);
            return false;
        }
    }

    // Check whether the current user has liked the post
    async getUserLike(postId, userId) {
        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteLikesTableId,
                queries: [
                    Query.equal("postId", postId),
                    Query.equal("userId", userId),
                ],
            });
        } catch (error) {
            console.log("Like Service :: getUserLike ::", error);
            return false;
        }
    }

    // Remove a like
    async unlikePost(likeId) {
        try {
            await this.databases.deleteRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteLikesTableId,
                rowId: likeId,
            });

            return true;
        } catch (error) {
            console.log("Like Service :: unlikePost ::", error);
            return false;
        }
    }
}

const likeService = new LikeService();

export default likeService;