import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import appwriteService from "../appwrite/config";
import { Container, PostCard, SkeletonCard } from "../components";
import { getPublicFeedErrorMessage } from "../utils/appwriteError";

function TagPosts() {

    const { tagName } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryKey, setRetryKey] = useState(0);

    const decodedTag = decodeURIComponent(tagName || "");

    useEffect(() => {

        let current = true;
        const loadTagPosts = async () => {

            if (!decodedTag) {
                setLoading(false);
                return;
            }

            try {

                setLoading(true);
                setError(null);

                const response = await appwriteService.getPublishedPosts({ limit: 100 });

                const allPosts =
                    response?.rows ||
                    response?.documents ||
                    response ||
                    [];

                const filtered = allPosts.filter(post => {

                    if (!post.tags) return false;

                    const postTags = post.tags
                        .split(",")
                        .map(t => t.trim().toLowerCase())
                        .filter(Boolean);

                    return postTags.includes(decodedTag.toLowerCase());
                });

                if (current) setPosts(filtered);

            } catch (error) {

                if (import.meta.env.DEV) { console.error("Tag Posts Error:", error); }
                if (current) setError(getPublicFeedErrorMessage(error));

            } finally {

                if (current) setLoading(false);

            }

        };

        loadTagPosts();
        return () => { current = false; };

    }, [decodedTag, retryKey]);

    if (loading) {

        return (

            <div className="page-shell">

                <Container>

                    <div className="text-center mb-10">

                        <h1 className="page-heading font-editorial text-4xl sm:text-5xl">

                            #{decodedTag}

                        </h1>

                        <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">

                            Loading posts...

                        </p>

                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {[...Array(8)].map((_, i) => (

                            <SkeletonCard key={i} />

                        ))}

                    </div>

                </Container>

            </div>

        );

    }

    return (

        <div className="page-shell">

            <Container>

                <div className="text-center mb-10">

                    <h1 className="page-heading font-editorial text-4xl sm:text-5xl">

                        #{decodedTag}

                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">

                        {posts.length === 1
                            ? "1 post"
                            : `${posts.length} posts`
                        }

                    </p>

                    <Link
                        to="/"
                        className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
                    >

                        <span aria-hidden="true">←</span> Back to All Posts

                    </Link>

                </div>

                {error ? (
                    <div role="alert" className="py-16 text-center">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">Unable to load this tag</h2>
                        <p className="mt-3 text-slate-500 dark:text-slate-400">{error}</p>
                        <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-5 inline-flex min-h-11 items-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Try again</button>
                    </div>
                ) : posts.length === 0 ? (

                    <div className="text-center py-16">

                        <div className="text-6xl mb-4" aria-hidden="true">🏷️</div>

                        <h2 className="text-3xl font-bold text-slate-700 dark:text-white">

                            No Posts Found

                        </h2>

                        <p className="mt-3 text-slate-500 dark:text-slate-400">

                            No articles tagged with{" "}

                            <span className="font-semibold">#{decodedTag}</span>

                        </p>

                    </div>

                ) : (

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {posts.map((post) => (

                            <PostCard
                                key={post.$id}
                                {...post}
                            />

                        ))}

                    </div>

                )}

            </Container>

        </div>

    );

}

export default TagPosts;
