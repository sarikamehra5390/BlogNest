import conf from "../conf/conf";
import { Client, TablesDB, ID, Query } from "appwrite";

export class HistoryService {

    client = new Client();

    databases;

    constructor() {

        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);

    }

    // ==========================
    // Add / Update History
    // ==========================

    async addHistory(userId, postId) {

        try {

            const existing = await this.databases.listRows({

                databaseId: conf.appwriteDatabaseId,

                tableId: conf.appwriteHistoryTableId,

                queries: [

                    Query.equal("userId", userId),

                    Query.equal("postId", postId),

                ],

            });

            // Already exists → update timestamp

            if (existing.rows.length > 0) {

                return await this.databases.updateRow({

                    databaseId: conf.appwriteDatabaseId,

                    tableId: conf.appwriteHistoryTableId,

                    rowId: existing.rows[0].$id,

                    data: {

                        viewedAt: new Date().toISOString(),

                    },

                });

            }

            // First time viewing

            return await this.databases.createRow({

                databaseId: conf.appwriteDatabaseId,

                tableId: conf.appwriteHistoryTableId,

                rowId: ID.unique(),

                data: {

                    userId,

                    postId,

                    viewedAt: new Date().toISOString(),

                },

            });

        }

        catch (error) {

            console.log(

                "History Service :: addHistory ::",

                error

            );

            return false;

        }

    }

    // ==========================
    // Get Reading History
    // ==========================

    async getHistory(userId) {

        try {

            return await this.databases.listRows({

                databaseId: conf.appwriteDatabaseId,

                tableId: conf.appwriteHistoryTableId,

                queries: [

                    Query.equal("userId", userId),

                    Query.orderDesc("viewedAt"),

                ],

            });

        }

        catch (error) {

            console.log(

                "History Service :: getHistory ::",

                error

            );

            return {

                rows: [],

            };

        }

    }

    // ==========================
    // Delete One Item
    // ==========================

    async removeHistory(historyId) {

        try {

            await this.databases.deleteRow({

                databaseId: conf.appwriteDatabaseId,

                tableId: conf.appwriteHistoryTableId,

                rowId: historyId,

            });

            return true;

        }

        catch (error) {

            console.log(error);

            return false;

        }

    }

    // ==========================
    // Clear All History
    // ==========================

    async clearHistory(userId) {

        try {

            const response = await this.getHistory(userId);

            await Promise.all(

                response.rows.map((item) =>

                    this.removeHistory(item.$id)

                )

            );

            return true;

        }

        catch (error) {

            console.log(error);

            return false;

        }

    }

}

const historyService = new HistoryService();

export default historyService;