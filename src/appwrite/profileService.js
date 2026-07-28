import conf from "../conf/conf";
import { Client, ID, TablesDB, Query } from "appwrite";

export class ProfileService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
    }

    // Create Profile
    async createProfile({ userId, name, bio = "", avatar = "" }) {
        try {
            return await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteProfilesTableId,
                rowId: ID.unique(),
                data: {
                    userId,
                    name,
                    bio,
                    avatar,
                },
            });
        } catch (error) {
            console.error("ProfileService :: createProfile ::", error);
            return false;
        }
    }

    // Get profile by userId
    async getProfile(userId) {
        try {
            const response = await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteProfilesTableId,
                queries: [
                    Query.equal("userId", userId),
                ],
            });

            return response.rows.length ? response.rows[0] : null;
        } catch (error) {
            console.error("ProfileService :: getProfile ::", error);
            return null;
        }
    }

    // Update profile
    async updateProfile(profileId, data) {
        try {
            return await this.databases.updateRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteProfilesTableId,
                rowId: profileId,
                data,
            });
        } catch (error) {
            console.error("ProfileService :: updateProfile ::", error);
            return false;
        }
    }

    // Delete profile
    async deleteProfile(profileId) {
        try {
            await this.databases.deleteRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteProfilesTableId,
                rowId: profileId,
            });

            return true;
        } catch (error) {
            console.error("ProfileService :: deleteProfile ::", error);
            return false;
        }
    }
}

const profileService = new ProfileService();

export default profileService;