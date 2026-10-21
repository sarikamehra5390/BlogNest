import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import appwriteService from "../appwrite/config";
import { Container, PostCard, PopularTags, SkeletonCard } from "../components";
import SearchContext from "../context/SearchContext";
import { RefreshCw } from "lucide-react";


function AllPost() {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [moreError, setMoreError] = useState(false);
    const { search } = useContext(SearchContext);

    const loadPosts = useCallback(async () => {
        try {
            // Never omit the public status filter: an empty query would include drafts.
            const response = await appwriteService.getPublishedPosts({ limit: 24 });

            setPosts(response?.rows || []);
            setHasMore((response?.rows?.length || 0) < (response?.total || 0));
        } catch (loadError) {
            setError(true);
            if (import.meta.env.DEV) console.error("Explore stories failed to load", loadError);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        setMoreError(false);
        try {
            const response = await appwriteService.getPublishedPosts({ offset: posts.length, limit: 24 });
            const rows = response?.rows || [];
            setPosts((existing) => [...existing, ...rows]);
            setHasMore(posts.length + rows.length < (response?.total || 0));
        } catch (loadError) {
            if (import.meta.env.DEV) console.error("More Explore stories failed to load", loadError);
            setMoreError(true);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        // Network-driven state updates happen after the request resolves.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPosts();
    }, [loadPosts]);

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

        return posts.filter((post) => post.category === selectedCategory);
    }, [posts, selectedCategory]);

    const searchedPosts = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return filteredPosts;
        return filteredPosts.filter((post) => `${post.title || ""} ${post.content || ""} ${post.category || ""} ${post.tags || ""} ${post.authorName || ""}`.toLowerCase().includes(term));
    }, [filteredPosts, search]);

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
                        Stories worth your time
                    </h1>

                    <p className="page-subtitle">
                        A growing collection of ideas, experiences, and perspectives from BlogNest writers.
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
                            aria-pressed={selectedCategory === category}
                            className={`
                                    min-h-11 px-4 py-2 rounded-md text-sm font-semibold
                                    transition-all
                                    duration-300
                                    ${
                                        selectedCategory === category
                                            ? "bg-indigo-600 text-white"
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
                {error ? (
                    <div role="alert" className="empty-state py-14">
                        <h2 className="font-editorial text-2xl font-semibold text-slate-900 dark:text-white">Explore could not load right now</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">The story service did not return a list. Please try again.</p>
                        <button onClick={() => { setLoading(true); setError(false); loadPosts(); }} className="mt-5 inline-flex min-h-11 items-center gap-2 bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><RefreshCw size={16} /> Retry</button>
                    </div>
                ) : searchedPosts.length === 0 ? (

                    <div className="empty-state py-16">

                        <div className="text-6xl mb-4" aria-hidden="true">
                            📝
                        </div>

                        <h2 className="font-editorial text-3xl font-semibold text-slate-700 dark:text-white">
                            {search ? "No stories match your search" : posts.length === 0 ? "No published stories yet" : "No stories in this topic"}
                        </h2>

                    </div>

                ) : (

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {searchedPosts.map((post) => (

                            <PostCard
                                key={post.$id}
                                {...post}
                            />

                        ))}

                    </div>

                )}

                {moreError && <p role="alert" className="mt-5 text-center text-sm text-red-700 dark:text-red-300">More stories could not load. Please try again. <button onClick={loadMore} className="font-semibold underline">Retry</button></p>}
                {!error && hasMore && <div className="mt-10 text-center"><button onClick={loadMore} disabled={loadingMore} className="inline-flex min-h-11 items-center justify-center border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{loadingMore ? "Loading stories…" : "Load more stories"}</button></div>}

            </div>
        </Container></div>
    );
}

export default AllPost;
