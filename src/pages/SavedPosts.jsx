import { useEffect, useState } from "react";
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
        <div className="page-shell"><Container>
            <div className="empty-state">
                <div className="text-5xl mb-4">🔖</div><h1 className="text-3xl font-bold mb-3 dark:text-white">
                    Your reading shelf
                </h1>

                <p className="text-gray-500 dark:text-gray-400">
                    You haven't saved any posts yet.
                </p>
            </div>
        </Container></div>
    );
}

return (
    <div className="page-shell">
        <Container>

            <div className="mb-9"><p className="page-kicker">Your library</p><h1 className="page-heading mt-2">Saved posts</h1><p className="page-subtitle">A quiet corner for the articles you want to return to.</p></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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
