import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import historyService from "../appwrite/historyService";
import appwriteService from "../appwrite/config";

function RecentlyViewed() {

    const userData = useSelector((state) => state.auth.userData);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadRecentlyViewed = async () => {

            if (!userData) {
                setLoading(false);
                return;
            }

            try {

                setLoading(true);

                const response = await historyService.getHistory(userData.$id);

                const rows = response?.rows || [];

                if (rows.length === 0) {
                    setPosts([]);
                    return;
                }

                const recent = rows.slice(0, 5);

                const resolved = await Promise.all(

                    recent.map(async (item) => {

                        try {

                            const post = await appwriteService.getPost(item.postId);

                            return {
                                historyId: item.$id,
                                viewedAt: item.viewedAt,
                                post,
                            };

                        } catch (err) {

                            return {
                                historyId: item.$id,
                                viewedAt: item.viewedAt,
                                post: null,
                            };

                        }

                    })

                );

                const valid = resolved.filter(item => item.post !== null);

                setPosts(valid);

            } catch (error) {

                console.log("Recently Viewed Error:", error);
                setPosts([]);

            } finally {

                setLoading(false);

            }

        };

        loadRecentlyViewed();

    }, [userData]);

    if (loading) {

        return (

            <div className="mt-12">

                <h2 className="text-2xl font-bold mb-6 dark:text-white">

                    🕒 Recently Viewed

                </h2>

                <div
                    className="
                        bg-white
                        dark:bg-slate-900
                        rounded-2xl
                        shadow-lg
                        p-8
                        text-center
                        text-gray-500
                    "
                >

                    Loading Recently Viewed...

                </div>

            </div>

        );

    }

    if (posts.length === 0) {

        return (

            <div className="mt-12">

                <h2 className="text-2xl font-bold mb-6 dark:text-white">

                    🕒 Recently Viewed

                </h2>

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

                    <div className="text-5xl mb-4">📖</div>

                    <p className="text-gray-500 dark:text-gray-400">

                        You haven't viewed any posts yet.

                    </p>

                    <Link
                        to="/"
                        className="
                            inline-block
                            mt-4
                            text-blue-600
                            dark:text-blue-400
                            font-medium
                            hover:underline
                        "
                    >

                        Explore Posts →

                    </Link>

                </div>

            </div>

        );

    }

    return (

        <div className="mt-12">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold dark:text-white">

                    🕒 Recently Viewed

                </h2>

                <Link
                    to="/history"
                    className="
                        text-sm
                        text-blue-600
                        dark:text-blue-400
                        font-medium
                        hover:underline
                    "
                >

                    View All →

                </Link>

            </div>

            <div
                className="
                    overflow-hidden
                    bg-white
                    dark:bg-slate-900
                    rounded-2xl
                    shadow-lg
                    divide-y
                    dark:divide-slate-800
                "
            >

                {posts.map((item, index) => (

                    <Link
                        key={item.historyId}
                        to={`/post/${item.post.$id}`}
                        className="
                            block
                            p-5
                            hover:bg-slate-50
                            dark:hover:bg-slate-800
                            transition-colors
                        "
                    >

                        <div className="flex items-center gap-5">

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-lg
                                    flex
                                    items-center
                                    justify-center
                                    text-lg
                                    font-bold
                                    bg-slate-100
                                    dark:bg-slate-800
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >

                                {index + 1}

                            </div>

                            <div className="flex-1 min-w-0">

                                <h3
                                    className="
                                        font-semibold
                                        text-slate-800
                                        dark:text-white
                                        truncate
                                        hover:text-blue-600
                                        dark:hover:text-blue-400
                                        transition-colors
                                    "
                                >

                                    {item.post.title}

                                </h3>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        text-gray-500
                                        dark:text-gray-400
                                    "
                                >

                                    Viewed{" "}

                                    {new Date(item.viewedAt).toLocaleString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}

                                    {item.post.category && (

                                        <>
                                            {" "}• {item.post.category}
                                        </>

                                    )}

                                </p>

                            </div>

                            <img
                                src={appwriteService.getFilePreview(item.post.featuredImage)}
                                alt={item.post.title}
                                loading="lazy"
                                className="
                                    w-16
                                    h-16
                                    rounded-lg
                                    object-cover
                                    flex-shrink-0
                                "
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />

                        </div>

                    </Link>

                ))}

            </div>

        </div>

    );

}

export default RecentlyViewed;
