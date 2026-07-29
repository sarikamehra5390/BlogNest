import conf from "../conf/conf.js";
import { Client, ID, TablesDB, Query, Storage} from "appwrite";

export class Service{
    client = new Client()
    databases;
    bucket; // storage
   
    constructor(){
         this.client
              .setEndpoint(conf.appwriteUrl)
              .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
        this.bucket = new Storage(this.client);
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
           console.log("Appwrite service :: createPost:: error", error) 
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
            console.log("Appwrite service :: updatePost :: error", error) 
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
            console.log("Appwrite service :: deletePost :: error", error) 
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
         console.log("Appwrite service :: getPost :: error", error) 
         return false 
    }
   }

   // to get all the post which has active status

   async getPosts(queries = [Query.equal("status", "active")]){
        try {
          return await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteCollectionId,
             queries,
              
          })
        } catch (error) {
             console.log("Appwrite service :: getPosts :: error", error) 
             return false
        }
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
        console.log("Appwrite service :: uploadFile :: error", error) 
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
        console.log("Appwrite service :: deleteFile :: error", error) 
        return false
    }
   }

  getFilePreview(fileId) {
    return this.bucket.getFileView({
        bucketId: conf.appwriteBucketId,
        fileId,
    });
}
   // Get all posts by a specific author
async getPostsByUser(userId) {
    try {
        console.log("Searching for userId:", userId);

        const response = await this.databases.listRows({
            databaseId: conf.appwriteDatabaseId,
            tableId: conf.appwriteCollectionId,
            queries: [
                Query.equal("userId", userId),
                Query.equal("status", "active"),
            ],
        });

        console.log("Response:", response);
        console.log("Rows:", response.rows);

        return response.rows;
    } catch (error) {
        console.log(error);
        return [];
    }
}

}

const service = new Service()

export default service