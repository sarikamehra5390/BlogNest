import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import service from "../appwrite/config";
import followService from "../appwrite/followService";
import likeService from "../appwrite/likeService";
import viewService from "../appwrite/viewService";

function TopAuthors() {

    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadTopAuthors = async () => {

            try {

                setLoading(true);

                // ==========================
                // Fetch All Posts
                // ==========================

                const response = await service.getPosts();

                const allPosts =
                    response?.rows ||
                    response?.documents ||
                    response ||
                    [];

                // ==========================
                // Group Posts by Author
                // ==========================

                const authorMap = {};

                allPosts.forEach((post) => {

                    if (!authorMap[post.userId]) {

                        authorMap[post.userId] = {

                            userId: post.userId,

                            authorName:
                                post.userName ||
                                post.authorName ||
                                "Unknown Author",

                            posts: [],

                        };

                    }

                    authorMap[post.userId].posts.push(post);

                });

                // ==========================
                // Calculate Author Analytics
                // ==========================

                const ranking = await Promise.all(

                    Object.values(authorMap).map(async (author) => {

                        // Followers

                        const followerResponse =
                            await followService.getFollowers(
                                author.userId
                            );

                        const followers =
                            followerResponse?.rows?.length || 0;

                        // Likes (Parallel)

                        const likeResponses =
                            await Promise.all(

                                author.posts.map((post) =>
                                    likeService.getLikes(post.$id)
                                )

                            );

                        // Views (Parallel)

                        const viewResponses =
                            await Promise.all(

                                author.posts.map((post) =>
                                    viewService.getViews(post.$id)
                                )

                            );

                        const totalLikes =
                            likeResponses.reduce(

                                (sum, response) =>
                                    sum +
                                    (response?.rows?.length || 0),

                                0

                            );

                        const totalViews =
                            viewResponses.reduce(

                                (sum, response) =>
                                    sum +
                                    (response?.rows?.length || 0),

                                0

                            );

                        const totalPosts =
                            author.posts.length;

                        const score =

                            followers * 5 +

                            totalLikes * 3 +

                            totalPosts * 2 +

                            totalViews;

                        return {

                            ...author,

                            followers,

                            totalLikes,

                            totalViews,

                            totalPosts,

                            score,

                        };

                    })

                );

                // ==========================
                // Sort
                // ==========================

                ranking.sort(

                    (a, b) => b.score - a.score

                );

                setAuthors(

                    ranking.slice(0, 5)

                );

            } catch (error) {

                console.log(
                    "Top Authors Error:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        loadTopAuthors();

    }, []);

    if (loading) {

        return (

            <div className="mt-12 text-center">

                Loading Top Authors...

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
                🏆 Top Authors
            </h2>

            {authors.length === 0 ? (

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

                    No Authors Yet

                </div>

            ) : (

                <div className="space-y-5">

                    {authors.map((author, index) => (

                        <div
                            key={author.userId}
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
                                            text-2xl
                                            font-bold
                                            dark:text-white
                                        "
                                    >

                                        {index === 0
                                            ? "🥇"
                                            : index === 1
                                            ? "🥈"
                                            : index === 2
                                            ? "🥉"
                                            : `#${index + 1}`}

                                        {" "}

                                        {author.authorName}

                                    </h3>

                                    <div
                                        className="
                                            flex
                                            flex-wrap
                                            gap-6
                                            mt-4
                                            text-gray-600
                                            dark:text-gray-300
                                        "
                                    >

                                        <span>

                                            📝 {author.totalPosts} Posts

                                        </span>

                                        <span>

                                            👥 {author.followers} Followers

                                        </span>

                                        <span>

                                            ❤️ {author.totalLikes} Likes

                                        </span>

                                        <span>

                                            👁️ {author.totalViews} Views

                                        </span>

                                    </div>

                                </div>

                                <Link
                                    to={`/author/${author.userId}`}
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

                                    View Profile

                                </Link>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}

export default TopAuthors;