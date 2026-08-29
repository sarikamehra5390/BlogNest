import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Container, PostCard } from "../components";
import bookmarkService from "../appwrite/bookmarkService";
import appwriteService from "../appwrite/config";

export default function SavedPosts() {
    const userData = useSelector((state) => state.auth.userData);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData) {
            fetchSavedPosts();
        } else {
            setLoading(false);
        }
    }, [userData]);

const fetchSavedPosts = async () => {
    try {
        const response = await bookmarkService.getBookmarks(userData.$id);

        if (!response?.rows) {
            setPosts([]);
            return;
        }

        const bookmarkedPosts = await Promise.all(
            response.rows.map(async (bookmark) => {
                return await appwriteService.getPost(bookmark.postId);
            })
        );

        setPosts(bookmarkedPosts.filter(Boolean));
    } catch (error) {
        if (import.meta.env.DEV) { console.error(error); }
    } finally {
        setLoading(false);
    }
};


if (loading) {
    return (
        <Container>
            <div className="flex justify-center items-center min-h-[60vh]">
                <h2 className="text-2xl font-semibold dark:text-white">
                    Loading saved posts...
                </h2>
            </div>
        </Container>
    );
}

if (posts.length === 0) {
    return (
        <Container>
            <div className="text-center py-20">
                <h1 className="text-4xl font-bold mb-4 dark:text-white">
                    🔖 Saved Posts
                </h1>

                <p className="text-gray-500 dark:text-gray-400">
                    You haven't saved any posts yet.
                </p>
            </div>
        </Container>
    );
}

return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen py-10">
        <Container>

            <h1 className="text-4xl font-bold mb-8 dark:text-white">
                🔖 Saved Posts
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {posts.map((post) => (
                    <PostCard
                        key={post.$id}
                        {...post}
                    />
                ))}

            </div>

        </Container>
    </div>
);
}