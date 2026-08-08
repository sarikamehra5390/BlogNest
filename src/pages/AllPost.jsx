import React, { useState, useEffect, useMemo } from "react";
import appwriteService from "../appwrite/config";
import { Container, PostCard, PopularTags } from "../components";


function AllPost() {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const response = await appwriteService.getPosts([]);

                if (response?.rows) {
                    setPosts(response.rows);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []);

    // Generate categories dynamically
    const categories = useMemo(() => {
        const unique = [
            ...new Set(
                posts
                    .map((post) => post.category)
                    .filter(Boolean)
            ),
        ];

        return ["All", ...unique];
    }, [posts]);

    // Filter posts
    const filteredPosts = useMemo(() => {
        if (selectedCategory === "All") {
            return posts;
        }

        return posts.filter(
            (post) => post.category === selectedCategory
        );
    }, [posts, selectedCategory]);

    if (loading) {
        return (
            <Container>
                <div className="py-20 text-center text-xl">
                    Loading Posts...
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="w-full py-8">

                

                {/* Heading */}
                <div className="mb-10 text-center">

                    <h1 className="text-5xl font-bold text-slate-800 dark:text-white">
                        Latest Posts
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
                        Explore articles shared by the community.
                    </p>

                       <PopularTags />

                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">

                        {categories.map((category) => (

                            <button
                                key={category}
                                onClick={() =>
                                    setSelectedCategory(category)
                                }
                                className={`
                                    px-5
                                    py-2
                                    rounded-full
                                    font-medium
                                    transition-all
                                    duration-300
                                    ${
                                        selectedCategory === category
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-blue-100 dark:hover:bg-slate-700"
                                    }
                                `}
                            >
                                {category}
                            </button>

                        ))}

                    </div>

                </div>

                {/* No Posts */}
                {filteredPosts.length === 0 ? (

                    <div className="text-center py-20">

                        <div className="text-6xl mb-4">
                            📝
                        </div>

                        <h2 className="text-3xl font-bold text-slate-700 dark:text-white">
                            No Posts Available
                        </h2>

                    </div>

                ) : (

                    <div
                        className="
                            grid
                            gap-8
                            sm:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-4
                        "
                    >

                        {filteredPosts.map((post) => (

                            <PostCard
                                key={post.$id}
                                {...post}
                            />

                        ))}

                    </div>

                )}

            </div>
        </Container>
    );
}

export default AllPost;