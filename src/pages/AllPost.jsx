import { useState, useEffect, useMemo } from "react";
import appwriteService from "../appwrite/config";
import { Container, PostCard, PopularTags, SkeletonCard } from "../components";


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
                if (import.meta.env.DEV) { console.log(error); }
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
            <div className="page-shell"><Container><div className="mb-10"><p className="page-kicker">Explore</p><h1 className="page-heading mt-2">The latest from BlogNest</h1></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div></Container></div>
        );
    }

    return (
        <div className="page-shell"><Container>
            <div className="w-full">

                

                {/* Heading */}
                <div className="mb-10 max-w-3xl">

                    <p className="page-kicker">Explore the library</p>
                    <h1 className="page-heading mt-2 text-4xl sm:text-5xl">
                        Latest Posts
                    </h1>

                    <p className="page-subtitle">
                        Explore articles shared by the community.
                    </p>

                       <PopularTags />

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mt-8">

                        {categories.map((category) => (

                            <button
                                key={category}
                                onClick={() =>
                                    setSelectedCategory(category)
                                }
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-semibold
                                    transition-all
                                    duration-300
                                    ${
                                        selectedCategory === category
                                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                                            : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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

                    <div className="empty-state py-16">

                        <div className="text-6xl mb-4" aria-hidden="true">
                            📝
                        </div>

                        <h2 className="text-3xl font-bold text-slate-700 dark:text-white">
                            No Posts Available
                        </h2>

                    </div>

                ) : (

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {filteredPosts.map((post) => (

                            <PostCard
                                key={post.$id}
                                {...post}
                            />

                        ))}

                    </div>

                )}

            </div>
        </Container></div>
    );
}

export default AllPost;
