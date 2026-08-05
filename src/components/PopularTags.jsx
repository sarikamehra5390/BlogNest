import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import service from "../appwrite/config";

function PopularTags() {

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadTags = async () => {

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
                // Frequency Map
                // ==========================

                const frequency = {};

                allPosts.forEach((post) => {

                    if (!post.tags) return;

                    const tagList = post.tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0);

                    tagList.forEach((tag) => {

                        const key = tag.toLowerCase();

                        if (!frequency[key]) {

                            frequency[key] = {

                                name: tag,

                                count: 0,

                            };

                        }

                        frequency[key].count++;

                    });

                });

                // ==========================
                // Convert to Array
                // ==========================

                const sortedTags = Object.values(frequency)

                    .sort((a, b) => b.count - a.count)

                    .slice(0, 10);

                setTags(sortedTags);

            } catch (error) {

                console.log(
                    "Popular Tags Error:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        loadTags();

    }, []);

    if (loading) {

        return (

            <div className="mt-12 text-center">

                Loading Popular Tags...

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
                🏷 Popular Tags
            </h2>

            {tags.length === 0 ? (

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

                    No Tags Found

                </div>

            ) : (

                <div
                    className="
                        flex
                        flex-wrap
                        gap-4
                    "
                >

                    {tags.map((tag) => (

                        <Link
                            key={tag.name}
                            to={`/tag/${encodeURIComponent(tag.name)}`}
                            className="
                                bg-white
                                dark:bg-slate-900
                                rounded-xl
                                shadow-md
                                px-5
                                py-4
                                hover:shadow-xl
                                hover:-translate-y-1
                                transition
                                border
                                dark:border-slate-700
                            "
                        >

                            <div
                                className="
                                    text-lg
                                    font-bold
                                    text-blue-600
                                "
                            >
                                #{tag.name}
                            </div>

                            <div
                                className="
                                    text-sm
                                    text-gray-500
                                    mt-2
                                "
                            >
                                {tag.count} Posts
                            </div>

                        </Link>

                    ))}

                </div>

            )}

        </div>

    );

}

export default PopularTags;