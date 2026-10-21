import { useCallback, useEffect, useState } from "react";
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
import { calculateReadingTime } from "../utils/readingTime";
import SignInPrompt from "../components/SignInPrompt";

export default function Post() {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);

    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    const [author, setAuthor] = useState(null);
    const [signInOpen, setSignInOpen] = useState(false);

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
                    navigate("/all-posts", { replace: true });
                    return;
                }

                if (fetchedPost.status !== "active" && fetchedPost.userId !== userData?.$id) {
                    navigate("/all-posts", { replace: true });
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

    const fetchComments = useCallback(async () => {
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
    }, [post]);

    // ==========================================
    // FETCH LIKES
    // ==========================================

    const fetchLikes = useCallback(async () => {
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
    }, [post, userData]);

    // ==========================================
    // FETCH BOOKMARK
    // ==========================================

    const fetchBookmark = useCallback(async () => {
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
    }, [post, userData]);

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
    }, [post?.$id, userData?.$id, fetchBookmark, fetchComments, fetchLikes]);

    // ==========================================
    // LIKE
    // ==========================================

    const handleLike = async () => {
        if (!userData) {
            setSignInOpen(true);
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
            setSignInOpen(true);
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
        if (!post?.$id || !userData?.$id) return;

        viewService
            .addView(
                post.$id,
                userData.$id
            )
            .catch((error) => {
                console.error(
                    "View error:",
                    error
                );
            });
    }, [post?.$id, userData?.$id]);

    // ==========================================
    // UI
    // ==========================================

    return post ? (
        <>
        <div className="page-shell transition-colors">
            <Container>
                <div className="mx-auto max-w-4xl">

                    {/* COVER IMAGE */}

                    <div className="mb-9 overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <img
                            src={appwriteService.getFilePreview(
                                post.featuredImage
                            )}
                            alt={post.title}
                            className="h-60 w-full bg-parchment object-contain sm:h-80 lg:h-[440px]"
                        />
                    </div>

                    {/* CATEGORY + TAGS */}

                    <div className="mb-5 flex flex-wrap gap-2">
                        {post.category && (
                            <span className="text-xs font-semibold uppercase tracking-[.14em] text-indigo-700 dark:text-indigo-300">
                                {post.category}
                            </span>
                        )}

                        {post.tags &&
                            post.tags
                                .split(",")
                                .map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-sm font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        #{tag.trim()}
                                    </span>
                                ))}
                    </div>

                    {/* TITLE */}

                    <h1 className="font-editorial mb-4 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-.035em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                        {post.title}
                    </h1>

                    {/* AUTHOR */}

                    <div className="mt-6 mb-5 flex flex-wrap items-center gap-4 border-y border-slate-300 py-4 dark:border-slate-700">

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
                                className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                            />
                        </Link>

                        <div>
                            <Link
                                to={`/author/${post.userId}`}
                                className="text-sm font-semibold text-slate-900 hover:text-indigo-700 dark:text-white"
                            >
                                {author?.name ||
                                    "Unknown Author"}
                            </Link>

                            <p className="mt-0.5 line-clamp-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">{author?.bio || "BlogNest author"}</p>
                        </div>
                    </div>

                    {/* META */}

                    <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-300 pb-5 dark:border-slate-700">

                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {calculateReadingTime(post.content)} min read ·{" "}
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

                    <div className="article-content mx-auto max-w-[46rem]">
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

                        <h2 className="font-editorial mb-6 text-3xl font-semibold tracking-tight dark:text-white">
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
        <SignInPrompt open={signInOpen} onClose={() => setSignInOpen(false)} returnTo={`/post/${slug}`} action="like or save this story" />
        </>
    ) : null;
}
