import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import commentService from "../appwrite/commentService";
import CommentForm from "../components/CommentForm";
import CommentCard from "../components/CommentCard";

import likeService from "../appwrite/likeService";
import bookmarkService from "../appwrite/bookmarkService";
import profileService from "../appwrite/profileService";
import viewService from "../appwrite/viewService";
import notificationService from "../appwrite/notificationService";
import historyService from "../appwrite/historyService";
import badgeService from "../appwrite/badgeService";

import SuggestedPosts from "../components/SuggestedPosts";
import AISummary from "../components/AISummary";
import { getAppwriteErrorMessage } from "../utils/appwriteError";

export default function Post() {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);

    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    const [author, setAuthor] = useState(null);

    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector(
        (state) => state.auth.userData
    );

    const isAuthor =
        post &&
        userData &&
        post.userId === userData.$id;

    // ==========================================
    // LOAD POST
    // ==========================================

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (!slug) {
                    navigate("/");
                    return;
                }

                const fetchedPost =
                    await appwriteService.getPost(slug);

                if (!fetchedPost) {
                    navigate("/");
                    return;
                }

                setPost(fetchedPost);

                // Reading history
                if (userData) {
                    try {
                        await historyService.addHistory(
                            userData.$id,
                            fetchedPost.$id
                        );
                    } catch (historyError) {
                        console.error(
                            "History error:",
                            historyError
                        );
                    }
                }

                // Author profile
                try {
                    const profile =
                        await profileService.getProfile(
                            fetchedPost.userId
                        );

                    setAuthor(profile);
                } catch (profileError) {
                    console.error(
                        "Author profile error:",
                        profileError
                    );

                    setAuthor(null);
                }
            } catch (error) {
                console.error(
                    "Post load error:",
                    error
                );

                toast.error(
                    "Unable to load this post."
                );

                navigate("/", {
                    replace: true,
                });
            }
        };

        fetchPost();
    }, [slug, navigate, userData]);

    // ==========================================
    // DELETE POST
    // ==========================================

    const deletePost = async () => {
        if (!isAuthor) {
            toast.error(
                "You can only delete your own posts."
            );
            return;
        }

        try {
            const status =
                await appwriteService.deletePost(
                    post.$id
                );

            if (status) {
                if (post.featuredImage) {
                    try {
                        await appwriteService.deleteFile(
                            post.featuredImage
                        );
                    } catch (imageError) {
                        console.error(
                            "Image delete error:",
                            imageError
                        );
                    }
                }

                toast.success(
                    "Post deleted successfully 🗑️"
                );

                navigate("/");
            } else {
                toast.error(
                    "Unable to delete this post."
                );
            }
        } catch (error) {
            console.error(
                "Delete post error:",
                error
            );

            toast.error(
                "Failed to delete post."
            );
        }
    };

    // ==========================================
    // COMMENTS
    // ==========================================

    const fetchComments = async () => {
        if (!post?.$id) return;

        try {
            const response =
                await commentService.getComments(
                    post.$id
                );

            setComments(
                response?.rows || []
            );
        } catch (error) {
            console.error(
                "Comments error:",
                error
            );

            setComments([]);
        }
    };

    // ==========================================
    // FETCH LIKES
    // ==========================================

    const fetchLikes = async () => {
        if (!post?.$id) return;

        try {
            const response =
                await likeService.getLikes(
                    post.$id
                );

            setLikes(
                response?.total ??
                response?.rows?.length ??
                0
            );

            if (!userData) {
                setLiked(false);
                return;
            }

            const userLike =
                await likeService.getUserLike(
                    post.$id,
                    userData.$id
                );

            setLiked(
                userLike?.rows?.length > 0
            );
        } catch (error) {
            console.error(
                "Fetch likes error:",
                error
            );
        }
    };

    // ==========================================
    // FETCH BOOKMARK
    // ==========================================

    const fetchBookmark = async () => {
        if (!post?.$id) return;

        if (!userData) {
            setBookmarked(false);
            return;
        }

        try {
            const response =
                await bookmarkService.getUserBookmark(
                    post.$id,
                    userData.$id
                );

            setBookmarked(
                response?.rows?.length > 0
            );
        } catch (error) {
            console.error(
                "Fetch bookmark error:",
                error
            );
        }
    };

    // ==========================================
    // LOAD COMMENTS + LIKES + BOOKMARK
    // ==========================================

    useEffect(() => {
        if (!post?.$id) return;

        const loadData = async () => {
            await fetchComments();
            await fetchLikes();
            await fetchBookmark();
        };

        loadData();
    }, [post?.$id, userData?.$id]);

    // ==========================================
    // LIKE
    // ==========================================

    const handleLike = async () => {
        if (!userData) {
            toast.error(
                "Please login first."
            );
            return;
        }

        if (!post?.$id) {
            toast.error(
                "Post is not available."
            );
            return;
        }

        if (likeLoading) return;

        setLikeLoading(true);

        try {
            // ------------------------------
            // UNLIKE
            // ------------------------------

            if (liked) {
                const success =
                    await likeService.unlikePost(
                        post.$id,
                        userData.$id
                    );

                if (success) {
                    setLiked(false);

                    await fetchLikes();

                    toast.success(
                        "Like removed."
                    );
                }

                return;
            }

            // ------------------------------
            // CHECK EXISTING LIKE
            // ------------------------------

            const existingLike =
                await likeService.getUserLike(
                    post.$id,
                    userData.$id
                );

            if (
                existingLike?.rows?.length > 0
            ) {
                setLiked(true);
                await fetchLikes();
                return;
            }

            // ------------------------------
            // CREATE LIKE
            // ------------------------------

            const result =
                await likeService.likePost(
                    post.$id,
                    userData.$id
                );

            if (!result) return;

            setLiked(true);

            await fetchLikes();

            // Already existed
            if (!result.created) {
                return;
            }

            // ------------------------------
            // NOTIFICATION
            // ------------------------------

            if (
                userData.$id !== post.userId
            ) {
                try {
                    await notificationService
                        .createNotification({
                            receiverId:
                                post.userId,

                            senderId:
                                userData.$id,

                            senderName:
                                userData.name,

                            postId:
                                post.$id,

                            postTitle:
                                post.title,

                            type: "like",

                            message:
                                `${userData.name} liked your post "${post.title}"`,

                            isRead: false,
                        });
                } catch (notificationError) {
                    console.error(
                        "Like notification error:",
                        notificationError
                    );
                }
            }

            // ------------------------------
            // BADGES
            // ------------------------------

            try {
                const [
                    likeBadges,
                    trendingBadge,
                    topAuthorBadge,
                ] = await Promise.all([
                    badgeService.checkLikeMilestones(
                        post.userId,
                        appwriteService,
                        likeService
                    ),

                    badgeService.checkTrendingAuthor(
                        post.userId,
                        appwriteService,
                        likeService,
                        commentService,
                        bookmarkService,
                        viewService
                    ),

                    badgeService.checkTopAuthor(
                        post.userId,
                        appwriteService,
                        likeService,
                        commentService,
                        bookmarkService,
                        viewService,
                        profileService
                    ),
                ]);

                const authorEarned = [
                    ...(likeBadges || []),
                    trendingBadge,
                    topAuthorBadge,
                ].filter(Boolean);

                authorEarned.forEach((badge) => {
                    if (
                        userData.$id ===
                        post.userId
                    ) {
                        toast.success(
                            `🎉 Badge Earned: ${
                                badge?.name ||
                                "New Badge"
                            }!`,
                            {
                                duration: 5000,
                            }
                        );
                    }
                });
            } catch (badgeError) {
                console.error(
                    "Badge check error:",
                    badgeError
                );
            }

            toast.success(
                "Post liked ❤️"
            );
        } catch (error) {
            console.error(
                "LIKE ERROR:",
                error
            );

            toast.error(
                getAppwriteErrorMessage(
                    error,
                    "like"
                )
            );
        } finally {
            setLikeLoading(false);
        }
    };

    // ==========================================
    // BOOKMARK
    // ==========================================

    const handleBookmark = async () => {
        if (!userData) {
            toast.error(
                "Please login first."
            );
            return;
        }

        if (!post?.$id) {
            toast.error(
                "Post is not available."
            );
            return;
        }

        if (bookmarkLoading) return;

        setBookmarkLoading(true);

        try {
            // ------------------------------
            // REMOVE BOOKMARK
            // ------------------------------

            if (bookmarked) {
                const success =
                    await bookmarkService.removeBookmark(
                        post.$id,
                        userData.$id
                    );

                if (success) {
                    setBookmarked(false);

                    await fetchBookmark();

                    toast.success(
                        "Bookmark removed."
                    );
                }

                return;
            }

            // ------------------------------
            // CHECK EXISTING BOOKMARK
            // ------------------------------

            const existing =
                await bookmarkService.getUserBookmark(
                    post.$id,
                    userData.$id
                );

            if (
                existing?.rows?.length > 0
            ) {
                setBookmarked(true);
                return;
            }

            // ------------------------------
            // CREATE BOOKMARK
            // ------------------------------

            const result =
                await bookmarkService.bookmarkPost(
                    post.$id,
                    userData.$id
                );

            if (!result) return;

            setBookmarked(true);

            await fetchBookmark();

            if (!result.created) {
                return;
            }

            // ------------------------------
            // NOTIFICATION
            // ------------------------------

            if (
                userData.$id !== post.userId
            ) {
                try {
                    await notificationService
                        .createNotification({
                            receiverId:
                                post.userId,

                            senderId:
                                userData.$id,

                            senderName:
                                userData.name,

                            postId:
                                post.$id,

                            postTitle:
                                post.title,

                            type: "bookmark",

                            message:
                                `${userData.name} bookmarked your post "${post.title}"`,

                            isRead: false,
                        });
                } catch (notificationError) {
                    console.error(
                        "Bookmark notification error:",
                        notificationError
                    );
                }
            }

            toast.success(
                "Post bookmarked 🔖"
            );
        } catch (error) {
            console.error(
                "BOOKMARK ERROR:",
                error
            );

            toast.error(
                getAppwriteErrorMessage(
                    error,
                    "bookmark"
                )
            );
        } finally {
            setBookmarkLoading(false);
        }
    };

    // ==========================================
    // VIEW
    // ==========================================

    useEffect(() => {
        if (!post?.$id) return;

        viewService
            .addView(
                post.$id,
                userData?.$id || null
            )
            .catch((error) => {
                console.error(
                    "View error:",
                    error
                );
            });
    }, [post?.$id]);

    // ==========================================
    // UI
    // ==========================================

    return post ? (
        <div className="page-shell transition-colors">
            <Container>
                <div className="mx-auto max-w-4xl">

                    {/* COVER IMAGE */}

                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-xl shadow-slate-300/30 mb-10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                        <img
                            src={appwriteService.getFilePreview(
                                post.featuredImage
                            )}
                            alt={post.title}
                            className="h-64 w-full object-cover sm:h-80 lg:h-[430px]"
                        />
                    </div>

                    {/* CATEGORY + TAGS */}

                    <div className="mb-5 flex flex-wrap gap-2">
                        {post.category && (
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                                {post.category}
                            </span>
                        )}

                        {post.tags &&
                            post.tags
                                .split(",")
                                .map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                    >
                                        #{tag.trim()}
                                    </span>
                                ))}
                    </div>

                    {/* TITLE */}

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-tight font-bold tracking-tight text-slate-950 dark:text-white mb-4">
                        {post.title}
                    </h1>

                    {/* AUTHOR */}

                    <div className="surface-card flex flex-wrap items-center gap-4 p-4 sm:p-5 mt-6 mb-6">

                        <Link
                            to={`/author/${post.userId}`}
                        >
                            <img
                                src={
                                    author?.avatar
                                        ? appwriteService.getFilePreview(
                                            author.avatar
                                        )
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            author?.name ||
                                            "User"
                                        )}`
                                }
                                alt={
                                    author?.name ||
                                    "User"
                                }
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900"
                            />
                        </Link>

                        <div>
                            <Link
                                to={`/author/${post.userId}`}
                                className="text-base font-bold text-slate-900 hover:text-indigo-600 transition dark:text-white"
                            >
                                {author?.name ||
                                    "Unknown Author"}
                            </Link>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {author?.bio ||
                                    "No bio available"}
                            </p>
                        </div>
                    </div>

                    {/* META */}

                    <div className="flex flex-wrap items-center justify-between gap-4 mb-10">

                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Published article ·{" "}
                            {new Date(
                                post.$createdAt
                            ).toLocaleDateString(
                                undefined,
                                {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                }
                            )}
                        </p>

                        {isAuthor && (
                            <div className="flex gap-3">

                                <Link
                                    to={`/edit-post/${post.$id}`}
                                >
                                    <Button bgColor="bg-green-600">
                                        Edit
                                    </Button>
                                </Link>

                                <Button
                                    bgColor="bg-red-600"
                                    onClick={
                                        deletePost
                                    }
                                >
                                    Delete
                                </Button>

                            </div>
                        )}
                    </div>

                    {/* CONTENT */}

                    <div className="surface-card article-content rounded-3xl p-6 sm:p-10">
                        {parse(
                            DOMPurify.sanitize(
                                post.content
                            )
                        )}
                    </div>

                    {/* AI SUMMARY */}

                    <AISummary
                        content={post.content}
                    />

                    {/* =====================================
                        LIKE + LIKE COUNT
                    ===================================== */}

                    <div className="surface-card mt-6 flex flex-wrap items-center gap-3 p-3">

                        <button
                            type="button"
                            disabled={likeLoading}
                            onClick={handleLike}
                            aria-pressed={liked}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]
                                ${
                                    liked
                                        ? "bg-red-500 text-white hover:bg-red-600"
                                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }
                                ${
                                    likeLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }
                            `}
                        >
                            <span
                                className="text-xl"
                                aria-hidden="true"
                            >
                                {liked
                                    ? "❤️"
                                    : "🤍"}
                            </span>

                            <span>
                                {likeLoading
                                    ? "Processing..."
                                    : liked
                                        ? "Liked"
                                        : "Like"}
                            </span>
                        </button>

                        <span className="px-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                            ❤️ {likes}{" "}
                            {likes === 1
                                ? "Like"
                                : "Likes"}
                        </span>
                    </div>

                    {/* =====================================
                        BOOKMARK
                    ===================================== */}

                    <div className="mt-3">

                        <button
                            type="button"
                            disabled={
                                bookmarkLoading
                            }
                            onClick={
                                handleBookmark
                            }
                            aria-pressed={
                                bookmarked
                            }
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]
                                ${
                                    bookmarked
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }
                                ${
                                    bookmarkLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }
                            `}
                        >
                            <span
                                className="text-xl"
                                aria-hidden="true"
                            >
                                {bookmarked
                                    ? "🔖"
                                    : "📑"}
                            </span>

                            <span>
                                {bookmarkLoading
                                    ? "Processing..."
                                    : bookmarked
                                        ? "Saved"
                                        : "Save"}
                            </span>
                        </button>

                    </div>

                    {/* =====================================
                        COMMENTS
                    ===================================== */}

                    <div className="mt-16">

                        <h2 className="text-2xl font-bold tracking-tight mb-6 dark:text-white">
                            Comments (
                            {comments.length}
                            )
                        </h2>

                        <CommentForm
                            postId={post.$id}
                            postAuthorId={
                                post.userId
                            }
                            postTitle={post.title}
                            onCommentAdded={
                                fetchComments
                            }
                        />

                        <div className="mt-8">

                            {comments.length ===
                            0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                    Be the first to
                                    add a thoughtful
                                    comment.
                                </div>
                            ) : (
                                comments.map(
                                    (comment) => (
                                        <CommentCard
                                            key={
                                                comment.$id
                                            }
                                            comment={
                                                comment
                                            }
                                            onDelete={
                                                fetchComments
                                            }
                                        />
                                    )
                                )
                            )}

                        </div>
                    </div>

                </div>

                <SuggestedPosts
                    currentPost={post}
                />

            </Container>
        </div>
    ) : null;
}