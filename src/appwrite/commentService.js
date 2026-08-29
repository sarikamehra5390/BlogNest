//  Keeping the comment logic completely separate from your post logic. This is a good practice because it makes your code easier to maintain and scale.

import conf from "../conf/conf";
import {  Client, ID, TablesDB, Query} from "appwrite";

export class CommentService {
    client = new Client();
    databases;

    constructor(){
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId)

        this.databases = new TablesDB(this.client);
    }

    // create comment
    async createComment({content, postId, userId, userName}){
        try {
            return await this.databases.createRow({
                databaseId : conf.appwriteDatabaseId,
                tableId : conf.appwriteCommentsTableId,
                rowId : ID.unique(),
                data:{
                    content,
                    postId,
                    userId,
                    userName,
                },
            })
            
        } catch (error) {
            if (import.meta.env.DEV) { console.log("Comment Service :: createComment ::", error) }
            return false
            
        }
    }

    // get all comments of a post 
    async getComments(postId){
        try {
            return await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId : conf.appwriteCommentsTableId,
                queries:[
                    Query.equal("postId", postId),
                    Query.orderDesc("$createdAt"),
                ],
            })
        } catch (error) {
             if (import.meta.env.DEV) { console.log("Comment Service :: getComments ::", error) }
            return false
        }
    }

    // Delete Comment
    async deleteComment(commentId){
        try {
            await this.databases.deleteRow({
                databaseId : conf.appwriteDatabaseId,
                tableId : conf.appwriteCommentsTableId,
                rowId: commentId,
            })
            return true
        } catch (error) {
            if (import.meta.env.DEV) { console.log("Comment Service :: deleteComment ::", error); }
            return false
        }
    }

    // Update Comment
    async updateComment(commentId, content){
        try {
            return await this.databases.updateRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteCommentsTableId,
                rowId : commentId,
                data : {
                    content,
                },
            })
        } catch (error) {
             console.log("Comment Service :: updateComment ::", error);
            return false
        }
    }
}

const commentService = new CommentService();

export default commentService;