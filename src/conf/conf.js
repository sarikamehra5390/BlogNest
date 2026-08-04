const conf = {
    
    appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),

     appwriteCommentsTableId: String(
        import.meta.env.VITE_APPWRITE_COMMENTS_TABLE_ID
    ),

    appwriteLikesTableId: String(
    import.meta.env.VITE_APPWRITE_LIKES_TABLE_ID
    ),

    appwriteBookmarksTableId: String(
    import.meta.env.VITE_APPWRITE_BOOKMARKS_TABLE_ID
    ),

    appwriteProfilesTableId: String(
    import.meta.env.VITE_APPWRITE_PROFILES_TABLE_ID
    ),

    appwriteViewsTableId:String(import.meta.env.VITE_APPWRITE_VIEWS_TABLE_ID),

    appwriteFollowTableId: String(import.meta.env.VITE_APPWRITE_FOLLOW_TABLE_ID),

    appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),

    appwriteNotificationsTableId: String(import.meta.env.VITE_APPWRITE_NOTIFICATIONS_TABLE_ID),
}





export default conf