import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import service from "../appwrite/config";
import likeService from "../appwrite/likeService";
import commentService from "../appwrite/commentService";
import bookmarkService from "../appwrite/bookmarkService";
import viewService from "../appwrite/viewService";

function TrendingPosts() {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadTrendingPosts = async () => {

            try {

                setLoading(true);

                // ==========================
                // Fetch all posts
                // ==========================
                const response = await service.getPosts();

                const allPosts =
                    response?.rows ||
                    response?.documents ||
                    response ||
                    [];

                // ==========================
                // Fetch analytics
                // ==========================

                const likeResponses = await Promise.all(
                    allPosts.map(post =>
                        likeService.getLikes(post.$id)
                    )
                );

                const commentResponses = await Promise.all(
                    allPosts.map(post =>
                        commentService.getComments(post.$id)
                    )
                );

                const bookmarkResponses = await Promise.all(
                    allPosts.map(post =>
                        bookmarkService.getBookmarks(post.$id)
                    )
                );

                const viewResponses = await Promise.all(
                    allPosts.map(post =>
                        viewService.getViews(post.$id)
                    )
                );

                // ==========================
                // Build analytics
                // ==========================

                const analytics = [];

                allPosts.forEach((post, index) => {

                    const likes =
                        likeResponses[index]?.rows?.length || 0;

                    const comments =
                        commentResponses[index]?.rows?.length || 0;

                    const bookmarks =
                        bookmarkResponses[index]?.rows?.length || 0;

                    const views =
                        viewResponses[index]?.rows?.length || 0;

                    analytics.push({

                        ...post,

                        likes,

                        comments,

                        bookmarks,

                        views,

                        score:

                            (likes * 3) +

                            (comments * 2) +

                            (bookmarks * 2) +

                            views,

                    });

                });

                // ==========================
                // Sort by score
                // ==========================

                analytics.sort(
                    (a, b) => b.score - a.score
                );

                // ==========================
                // Top 5 Trending
                // ==========================

                setPosts(
                    analytics.slice(0, 5)
                );

            } catch (error) {

                console.log(
                    "Trending Posts Error:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        loadTrendingPosts();

    }, []);

    if (loading) {

        return (

            <div className="mt-12 text-center text-lg">

                Loading Trending Posts...

            </div>

        );

    }

    return (

        <div className="mt-12">

            <h2
                className="
                    text-3xl
                    font-bold
                    mb-8
                    dark:text-white
                "
            >
                🔥 Trending Posts
            </h2>

            {posts.length === 0 ? (

                <div
                    className="
                        bg-white
                        dark:bg-slate-900
                        rounded-2xl
                        shadow-lg
                        p-8
                        text-center
                    "
                >

                    No Trending Posts Yet

                </div>

            ) : (

                <div className="space-y-6">

                    {posts.map((post, index) => (

                        <div
                            key={post.$id}
                            className="
                                bg-white
                                dark:bg-slate-900
                                rounded-2xl
                                shadow-lg
                                p-6
                            "
                        >

                            <div className="flex justify-between items-center">

                                <div>

                                    <h3
                                        className="
                                            text-xl
                                            font-bold
                                            dark:text-white
                                        "
                                    >

                                        #{index + 1} {post.title}

                                    </h3>

                                    <div
                                        className="
                                            flex
                                            flex-wrap
                                            gap-5
                                            mt-4
                                            text-gray-600
                                            dark:text-gray-300
                                        "
                                    >

                                        <span>
                                            ❤️ {post.likes}
                                        </span>

                                        <span>
                                            💬 {post.comments}
                                        </span>

                                        <span>
                                            🔖 {post.bookmarks}
                                        </span>

                                        <span>
                                            👁️ {post.views}
                                        </span>

                                    </div>

                                </div>

                                <Link
                                    to={`/post/${post.$id}`}
                                    className="
                                        bg-blue-600
                                        text-white
                                        px-5
                                        py-2
                                        rounded-lg
                                        hover:bg-blue-700
                                        transition
                                    "
                                >

                                    Read →

                                </Link>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}

export default TrendingPosts;