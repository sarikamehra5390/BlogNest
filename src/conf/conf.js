const env = (name) => import.meta.env[name] || "";

const conf = {
    appwriteUrl: env("VITE_APPWRITE_URL"),
    appwriteProjectId: env("VITE_APPWRITE_PROJECT_ID"),
    appwriteDatabaseId: env("VITE_APPWRITE_DATABASE_ID"),
    appwriteCollectionId: env("VITE_APPWRITE_COLLECTION_ID"),

     appwriteCommentsTableId: String(
        env("VITE_APPWRITE_COMMENTS_TABLE_ID")
    ),

    appwriteLikesTableId: String(
    env("VITE_APPWRITE_LIKES_TABLE_ID")
    ),

    appwriteBookmarksTableId: String(
    env("VITE_APPWRITE_BOOKMARKS_TABLE_ID")
    ),

    appwriteProfilesTableId: String(
    env("VITE_APPWRITE_PROFILES_TABLE_ID")
    ),

    appwriteViewsTableId: env("VITE_APPWRITE_VIEWS_TABLE_ID"),

    appwriteFollowTableId: env("VITE_APPWRITE_FOLLOW_TABLE_ID"),

    appwriteBucketId: env("VITE_APPWRITE_BUCKET_ID"),

    appwriteNotificationsTableId: env("VITE_APPWRITE_NOTIFICATIONS_TABLE_ID"),

    appwriteHistoryTableId: env("VITE_APPWRITE_HISTORY_TABLE_ID"),

    appwriteBadgesTableId: String(
    env("VITE_APPWRITE_BADGES_TABLE_ID")
),

     appwriteAiFunctionId: env("VITE_APPWRITE_AI_FUNCTION_ID"),

      tinymceApiKey: env("VITE_TINYMCE_API_KEY"),
}





export default conf
