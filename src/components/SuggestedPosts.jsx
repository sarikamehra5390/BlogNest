import { useEffect, useState } from "react";

import service from "../appwrite/config";
import likeService from "../appwrite/likeService";
import commentService from "../appwrite/commentService";
import bookmarkService from "../appwrite/bookmarkService";
import viewService from "../appwrite/viewService";
import PostCard from "./PostCard";
import SkeletonCard from "./SkeletonCard";

function SuggestedPosts({ currentPost }) {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadSuggestedPosts = async () => {

            if (!currentPost) return;

            try {

                setLoading(true);

                const currentTags = currentPost.tags
                    ? currentPost.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
                    : [];

                const currentCategory = currentPost.category || "";

                const response = await service.getPosts();

                const allPosts =
                    response?.rows ||
                    response?.documents ||
                    response ||
                    [];

                const candidatePosts = allPosts.filter(post => {

                    if (post.$id === currentPost.$id) return false;

                    if (currentCategory && post.category === currentCategory) return true;

                    if (currentTags.length > 0 && post.tags) {
                        const postTags = post.tags
                            .split(",")
                            .map(t => t.trim().toLowerCase())
                            .filter(Boolean);

                        const hasMatchingTag = currentTags.some(tag =>
                            postTags.includes(tag)
                        );

                        if (hasMatchingTag) return true;
                    }

                    return false;
                });

                if (candidatePosts.length === 0) {
                    setPosts([]);
                    return;
                }

                const [likeResponses, commentResponses, bookmarkResponses, viewResponses] =
                    await Promise.all([
                        Promise.all(
                            candidatePosts.map(post => likeService.getLikes(post.$id))
                        ),
                        Promise.all(
                            candidatePosts.map(post => commentService.getComments(post.$id))
                        ),
                        Promise.all(
                            candidatePosts.map(post => bookmarkService.getBookmarksByPost(post.$id))
                        ),
                        Promise.all(
                            candidatePosts.map(post => viewService.getViews(post.$id))
                        ),
                    ]);

                const scoredPosts = [];

                candidatePosts.forEach((post, index) => {

                    const likes = likeResponses[index]?.rows?.length || 0;
                    const comments = commentResponses[index]?.rows?.length || 0;
                    const bookmarks = bookmarkResponses[index]?.rows?.length || 0;
                    const views = viewResponses[index]?.rows?.length || 0;

                    let matchScore = 0;

                    if (currentCategory && post.category === currentCategory) {
                        matchScore += 50;
                    }

                    if (currentTags.length > 0 && post.tags) {
                        const postTags = post.tags
                            .split(",")
                            .map(t => t.trim().toLowerCase())
                            .filter(Boolean);

                        const matchingTagCount = currentTags.filter(tag =>
                            postTags.includes(tag)
                        ).length;

                        matchScore += matchingTagCount * 20;
                    }

                    const popularityScore =
                        (likes * 3) +
                        (comments * 2) +
                        (bookmarks * 2) +
                        views;

                    scoredPosts.push({
                        ...post,
                        likes,
                        comments,
                        bookmarks,
                        views,
                        totalScore: popularityScore + matchScore,
                    });
                });

                scoredPosts.sort((a, b) => b.totalScore - a.totalScore);

                setPosts(scoredPosts.slice(0, 5));

            } catch (error) {

                console.log("Suggested Posts Error:", error);
                setPosts([]);

            } finally {

                setLoading(false);

            }

        };

        loadSuggestedPosts();

    }, [currentPost]);

    if (loading) {

        return (

            <div className="mt-20">

                <h2 className="text-3xl font-bold mb-8 dark:text-white">
                    ✨ You May Also Like
                </h2>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {[...Array(5)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>

            </div>

        );

    }

    if (posts.length === 0) {

        return null;

    }

    return (

        <div className="mt-20">

            <h2 className="text-3xl font-bold mb-8 dark:text-white">
                ✨ You May Also Like
            </h2>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                {posts.map((post) => (

                    <PostCard
                        key={post.$id}
                        {...post}
                    />

                ))}

            </div>

        </div>

    );

}

export default SuggestedPosts;
