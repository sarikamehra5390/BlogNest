import conf from "../conf/conf";
import { Client, TablesDB, Query } from "appwrite";

export class ProfileService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
    }

    // One profile belongs to one Appwrite user. Using the user id as the row id
    // makes profile creation idempotent even if two requests arrive together.
    async createProfile({ userId, name, bio = "", avatar = "" }) {
        if (!userId) throw new Error("A user ID is required to create a profile.");

        const existingProfile = await this.getProfile(userId);
        if (existingProfile) return existingProfile;

        try {
            return await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteProfilesTableId,
                rowId: userId,
                data: { userId, name: name || "", bio, avatar },
            });
        } catch (error) {
            // A competing request may have created the deterministic row first.
            if (error?.code === 409) {
                const profile = await this.getProfile(userId);
                if (profile) return profile;
            }
            if (import.meta.env.DEV) console.error("ProfileService :: createProfile", error);
            throw error;
        }
    }

    async ensureProfile({ userId, name, bio = "", avatar = "" }) {
        const existingProfile = await this.getProfile(userId);
        return existingProfile || this.createProfile({ userId, name, bio, avatar });
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
            if (import.meta.env.DEV) console.error("ProfileService :: getProfile", error);
            throw error;
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
            if (import.meta.env.DEV) { console.error("ProfileService :: updateProfile ::", error); }
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
            if (import.meta.env.DEV) { console.error("ProfileService :: deleteProfile ::", error); }
            return false;
        }
    }
}

const profileService = new ProfileService();

export default profileService;
