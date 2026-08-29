import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import appwriteService from "../appwrite/config";
import { Container, PostCard, SkeletonCard } from "../components";

function TagPosts() {

    const { tagName } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const decodedTag = decodeURIComponent(tagName || "");

    useEffect(() => {

        const loadTagPosts = async () => {

            if (!decodedTag) {
                setLoading(false);
                return;
            }

            try {

                setLoading(true);

                const response = await appwriteService.getPosts();

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

                setPosts(filtered);

            } catch (error) {

                if (import.meta.env.DEV) { console.log("Tag Posts Error:", error); }
                setPosts([]);

            } finally {

                setLoading(false);

            }

        };

        loadTagPosts();

    }, [decodedTag]);

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12">

                <Container>

                    <div className="text-center mb-10">

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white">

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

        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12 transition-colors">

            <Container>

                <div className="text-center mb-10">

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white">

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
                        className="
                            inline-block
                            mt-6
                            text-blue-600
                            dark:text-blue-400
                            font-medium
                            hover:underline
                        "
                    >

                        <span aria-hidden="true">←</span> Back to All Posts

                    </Link>

                </div>

                {posts.length === 0 ? (

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
