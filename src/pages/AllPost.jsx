import { useState, useEffect, useLayoutEffect, useMemo, useContext, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Container, PostCard, PopularTags, SkeletonCard } from "../components";
import { DiscoveryActivities, ExploreHero, FeedUnavailable } from "../components/ExploreDiscovery";
import SearchContext from "../context/SearchContext";
import { getPublicFeedErrorMessage } from "../utils/appwriteError";


function AllPost() {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedTopic, setSelectedTopic] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [moreError, setMoreError] = useState(false);
    const requestId = useRef(0);
    const moreRequestId = useRef(0);
    const { search, setSearch } = useContext(SearchContext);
    const location = useLocation();

    useLayoutEffect(() => {
        if (location.hash) {
            document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: "start" });
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
    }, [location.pathname, location.hash]);

    const loadPosts = useCallback(async () => {
        const currentRequest = ++requestId.current;
        setLoading(true);
        setError(null);
        setSelectedTopic("");
        try {
            // Never omit the public status filter: an empty query would include drafts.
            const response = await appwriteService.getPublishedPosts({ limit: 24 });

            const rows = response?.rows || [];
            if (currentRequest === requestId.current) {
                setPosts(rows);
                setHasMore(rows.length < (response?.total || 0));
            }
        } catch (loadError) {
            if (currentRequest === requestId.current) setError(getPublicFeedErrorMessage(loadError));
            if (import.meta.env.DEV) console.error("Explore stories failed to load", loadError);
        } finally {
            if (currentRequest === requestId.current) setLoading(false);
        }
    }, []);

    const loadMore = async () => {
        if (loadingMore) return;
        const currentRequest = ++moreRequestId.current;
        setLoadingMore(true);
        setMoreError(false);
        try {
            const response = await appwriteService.getPublishedPosts({ offset: posts.length, limit: 24 });
            const rows = response?.rows || [];
            if (currentRequest === moreRequestId.current) {
                setPosts((existing) => [...existing, ...rows]);
                setHasMore(posts.length + rows.length < (response?.total || 0));
            }
        } catch (loadError) {
            if (import.meta.env.DEV) console.error("More Explore stories failed to load", loadError);
            if (currentRequest === moreRequestId.current) setMoreError(true);
        } finally {
            if (currentRequest === moreRequestId.current) setLoadingMore(false);
        }
    };

    useEffect(() => {
        // Network-driven state updates happen after the request resolves.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPosts();
        return () => { requestId.current += 1; moreRequestId.current += 1; };
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

    return (
        <div className="page-shell pt-5 sm:pt-8"><Container>
            <div className="w-full">
                <ExploreHero search={search} onSearchChange={(value) => { setSearch(value); setSelectedTopic(""); }} />
                {error && <FeedUnavailable message={error} onRetry={loadPosts} retrying={loading} />}

                {loading ? (
                    <div className="mt-10" aria-label="Loading topics">
                        <div className="h-8 w-56 animate-pulse bg-slate-200 dark:bg-slate-800" />
                        <div className="mt-5 flex gap-2">{[0, 1, 2, 3].map((item) => <span key={item} className="h-10 w-28 animate-pulse bg-slate-200 dark:bg-slate-800" />)}</div>
                    </div>
                ) : (
                    <PopularTags posts={posts} unavailable={Boolean(error)} selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
                )}

                {error ? (
                    <>
                        {search.trim() && <p className="mt-8 border-l-2 border-indigo-600 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-600 dark:bg-slate-900/70 dark:text-slate-300" role="status">Live story search is temporarily unavailable, so we can’t tell whether any published stories match “{search.trim()}”.</p>}
                        <DiscoveryActivities />
                    </>
                ) : loading ? (
                    <section id="story-feed" className="mt-10 scroll-mt-36" aria-label="Loading published stories">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, index) => <SkeletonCard key={index} />)}</div>
                    </section>
                ) : (
                    <section id="story-feed" className="mt-10 scroll-mt-36" aria-label="Published stories">
                        {categories.length > 1 && <div className="mb-7 flex flex-wrap gap-2" aria-label="Filter stories by category">
                            {categories.map((category) => <button key={category} type="button" onClick={() => setSelectedCategory(category)} aria-pressed={selectedCategory === category} className={`min-h-10 border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${selectedCategory === category ? "border-indigo-700 bg-indigo-700 text-white dark:border-indigo-400 dark:bg-indigo-500" : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-200"}`}>{category}</button>)}
                        </div>}
                        {searchedPosts.length === 0 ? (
                            <div className="border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/70">
                                <p className="page-kicker">Published stories</p>
                                <h2 className="font-editorial mt-2 text-2xl font-semibold text-slate-800 dark:text-white">{search ? "No stories match your search" : posts.length === 0 ? "No published stories yet" : "No stories in this topic"}</h2>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{search ? "Try another phrase, title, or tag." : "Check back soon for new perspectives from BlogNest writers."}</p>
                            </div>
                        ) : (
                            <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                                {searchedPosts.map((post) => <PostCard key={post.$id} {...post} />)}
                            </div>
                        )}

                        {moreError && <p role="alert" className="mt-5 text-center text-sm text-red-800 dark:text-red-200">More stories could not load. <button onClick={loadMore} className="font-semibold underline underline-offset-4">Retry</button></p>}
                        {!error && hasMore && <div className="mt-10 text-center"><button onClick={loadMore} disabled={loadingMore} className="inline-flex min-h-11 items-center justify-center border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-800 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{loadingMore ? "Loading stories…" : "Load more stories"}</button></div>}
                    </section>
                )}
            </div>
        </Container></div>
    );
}

export default AllPost;
