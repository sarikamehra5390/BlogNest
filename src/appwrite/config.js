import conf from "../conf/conf.js";
import { ID, TablesDB, Query, Storage} from "appwrite";
import appwriteClient from "./client";

export class Service{
    client = appwriteClient
    databases;
    bucket; // storage
   
    constructor(){
        this.databases = new TablesDB(this.client);
        this.bucket = new Storage(this.client);
    }

    assertPostsConfigured() {
        const missing = [
            !conf.appwriteUrl && "VITE_APPWRITE_URL",
            !conf.appwriteProjectId && "VITE_APPWRITE_PROJECT_ID",
            !conf.appwriteDatabaseId && "VITE_APPWRITE_DATABASE_ID",
            !conf.appwriteCollectionId && "VITE_APPWRITE_COLLECTION_ID",
        ].filter(Boolean);
        if (missing.length) {
            throw new Error(`Published stories are not configured. Missing ${missing.join(" and ")}.`);
        }
    }

    // all the post related services are defined here 

    async createPost({title, slug, content,category, tags, featuredImage, status, userId}){
        try {
           return await this.databases.createRow({
             databaseId : conf.appwriteDatabaseId,
             tableId : conf.appwriteCollectionId,
             rowId: ID.unique(),
             data: {
                title,
                slug,
                content, 
                category,
                tags,
                featuredImage,
                status,
                userId,
             }
              

           }); 
        } catch (error) {
           if (import.meta.env.DEV) { console.log("Appwrite service :: createPost:: error", error) }
           return false
        }
    }

    async updatePost(id, {title, content,category,tags, featuredImage, status}){
         try {
            return await this.databases.updateRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteCollectionId,
                rowId: id,
                data: {
                    title,
                    content,
                    category,
                    tags,
                    featuredImage,
                    status,
                }
            })
         } catch (error) {
            if (import.meta.env.DEV) { console.log("Appwrite service :: updatePost :: error", error) }
            return false 
         }
    }

    async deletePost(slug){
        try {
            await this.databases.deleteRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteCollectionId,
                rowId:slug,

            })
            return true 

        } catch (error) {
            if (import.meta.env.DEV) { console.log("Appwrite service :: deletePost :: error", error) }
            return false
        }
    }

   // to get one post 
   async getPost(slug){
    try {
        return await this.databases.getRow({
            databaseId:conf.appwriteDatabaseId,
            tableId:conf.appwriteCollectionId,
            rowId: slug,

        })
    } catch (error) {
         if (import.meta.env.DEV) { console.log("Appwrite service :: getPost :: error", error) }
         return false 
    }
   }

   // to get all the post which has active status

   async getPosts(queries = [Query.equal("status", "active")]){
        this.assertPostsConfigured();
        return await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteCollectionId,
             queries,
        });
   }

   // Public feed reads always filter to published rows and let callers handle
   // Appwrite errors so they can show a real retry state and diagnostics.
   async getPublishedPosts({ offset = 0, limit = 24 } = {}) {
        this.assertPostsConfigured();
        return await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteCollectionId,
            queries: [
                Query.equal("status", "active"),
                Query.orderDesc("$createdAt"),
                Query.limit(limit),
                ...(offset > 0 ? [Query.offset(offset)] : []),
            ],
        });
   }

   // file upload method/service

   async uploadFile(file){
       try {
         return await this.bucket.createFile({
            bucketId: conf.appwriteBucketId,
            fileId: ID.unique(),
            file,
         })
       } catch (error) {
        if (import.meta.env.DEV) { console.log("Appwrite service :: uploadFile :: error", error) }
        return false
       }
   }

   async deleteFile(fileId){
    try {
        await this.bucket.deleteFile({
           bucketId:conf.appwriteBucketId,
           fileId,  
        })
        return true
    } catch (error) {
        if (import.meta.env.DEV) { console.log("Appwrite service :: deleteFile :: error", error) }
        return false
    }
   }

  getFilePreview(fileId) {
    try {
        return this.bucket.getFileView({
            bucketId: conf.appwriteBucketId,
            fileId,
        });
    } catch (e) {
        if (import.meta.env.DEV) { console.log(e); }
        return null;
    }
}
   // Get all posts by a specific author
async getPostsByUser(userId) {
        this.assertPostsConfigured();
        if (!userId) return [];
        const response = await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteCollectionId,
            queries: [
                Query.equal("userId", userId),
                Query.equal("status", "active"),
            ],
        });

        return response.rows;
}

}

const service = new Service()

export default service
