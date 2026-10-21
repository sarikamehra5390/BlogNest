import conf from "../conf/conf";
import { ID, Query, TablesDB } from "appwrite";
import appwriteClient from "./client";

export class ViewService {

    client = appwriteClient;
    databases;

    constructor() {

        this.databases = new TablesDB(this.client);

    }

    async addView(postId, viewerId = null) {

        try {

            return await this.databases.createRow({

                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteViewsTableId,
                rowId: ID.unique(),

                data: {

                    postId,
                    viewerId,
                    viewedAt: new Date().toISOString(),

                },

            });

        } catch (error) {

            console.log("View Service :: addView ::", error);

            return false;

        }

    }

    async getViews(postId) {

        try {

            return await this.databases.listRows({

                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteViewsTableId,

                queries: [

                    Query.equal("postId", postId),

                ],

            });

        } catch (error) {

            console.log("View Service :: getViews ::", error);

            return false;

        }

    }

}

const viewService = new ViewService();

export default viewService;
