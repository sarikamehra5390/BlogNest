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

export default function Post() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [author, setAuthor] = useState(null);

  const { slug } = useParams();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.userData);

  const isAuthor =
    post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    const fetchPost = async () => {
        if (!slug) {
            navigate("/");
            return;
        }

        const fetchedPost = await appwriteService.getPost(slug);

        if (!fetchedPost) {
            navigate("/");
            return;
        }

       setPost(fetchedPost);

// ==========================
// Save Reading History
// ==========================

if (userData) {

    await historyService.addHistory(
        userData.$id,
        fetchedPost.$id
    );

}

// ==========================
// Fetch Author Profile
// ==========================

const profile = await profileService.getProfile(
    fetchedPost.userId
);

setAuthor(profile);
    };

    fetchPost();
}, [slug, navigate, userData]);

  const deletePost = async () => {
    try {
      const status = await appwriteService.deletePost(post.$id);

      if (status) {
        await appwriteService.deleteFile(post.featuredImage);
        toast.success("Post deleted successfully 🗑️");
        navigate("/");
      }
    } catch (e) {
      if (import.meta.env.DEV) console.log(e);
      toast.error("Failed to delete post");
    }
  };

  const fetchComments = async () => {
    if (!post?.$id) return;
    try{
    const response = await commentService.getComments(post.$id);

    if (response?.rows) {
        setComments(response.rows);
    } else {
        setComments([]);
    }
  } catch (error) {
        if (import.meta.env.DEV) { console.error(error); }
        setComments([]);
    }
};

useEffect(() => {
    if (!post?.$id) return;

    const loadData = async () => {
        await fetchComments();
        await fetchLikes();
        await fetchBookmark();
    };

    loadData();
}, [post, userData]);

const fetchLikes = async () => {
     if (!post?.$id) return;
    
     try{

    const response = await likeService.getLikes(post.$id);

    if (response?.rows) {
        setLikes(response.rows.length);
    }

    if (userData) {
        const userLike = await likeService.getUserLike(
            post.$id,
            userData.$id
        );

        if (userLike?.rows?.length > 0) {
            setLiked(true);
            setLikeId(userLike.rows[0].$id);
        } else {
            setLiked(false);
            setLikeId(null);
        }
    }else{
      setLiked(false);
      setLikeId(null);
    }
  }catch (error) {
        if (import.meta.env.DEV) { console.error(error); }
    }
};

const fetchBookmark = async () => {
    if (!post?.$id) return;

    try {
        if (!userData) {
            setBookmarked(false);
            setBookmarkId(null);
            return;
        }

        const response = await bookmarkService.getUserBookmark(
            post.$id,
            userData.$id
        );

        if (response?.rows?.length > 0) {
            setBookmarked(true);
            setBookmarkId(response.rows[0].$id);
        } else {
            setBookmarked(false);
            setBookmarkId(null);
        }
    } catch (error) {
        if (import.meta.env.DEV) { console.error(error); }
    }
};

const handleLike = async () => {
    if (!userData) {
        toast.error("Please login first");
        return;
    }

    if (likeLoading) return;

    setLikeLoading(true);

    try {
        if (liked) {
            const success = await likeService.unlikePost(likeId);

            if (success) {
                toast.success("Like removed");
                await fetchLikes();
            }

            return;
        }

        const existingLike = await likeService.getUserLike(
            post.$id,
            userData.$id
        );

        if (existingLike?.rows?.length > 0) {
            setLiked(true);
            setLikeId(existingLike.rows[0].$id);
            await fetchLikes();
            return;
        }

        const success = await likeService.likePost(
    post.$id,
    userData.$id
);

if (success) {

    // Don't notify yourself
    if (userData.$id !== post.userId) {

        await notificationService.createNotification({

            receiverId: post.userId,

            senderId: userData.$id,

            senderName: userData.name,

            postId: post.$id,

            postTitle: post.title,

            type: "like",

            message: `${userData.name} liked your post "${post.title}"`,

            isRead: false,

        });

    }

    // Check author badges after like event
    try {
        const [likeBadges, trendingBadge, topAuthorBadge] =
            await Promise.all([
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

        authorEarned.forEach((b) => {
            if (userData.$id === post.userId) {
                toast.success(`🎉 Badge Earned: ${b?.name || "New Badge"}!`, {
                    duration: 5000,
                });
            }
        });
    } catch (badgeErr) {
        if (import.meta.env.DEV) { console.log("Badge check error (like):", badgeErr); }
    }

    toast.success("Post liked ❤️");

    await fetchLikes();

}
    } catch (error) {
        if (import.meta.env.DEV) { console.error(error); }
        toast.error("Something went wrong");
    } finally {
        setLikeLoading(false);
    }
};

const handleBookmark = async () => {
    if (!userData) {
        toast.error("Please login first");
        return;
    }

    if (bookmarkLoading) return;

    setBookmarkLoading(true);

    try {
        if (bookmarked) {
            const success = await bookmarkService.removeBookmark(bookmarkId);

            if (success) {
                toast.success("Bookmark removed");
                await fetchBookmark();
            }

            return;
        }

        const existing = await bookmarkService.getUserBookmark(
            post.$id,
            userData.$id
        );

        if (existing?.rows?.length > 0) {
            setBookmarked(true);
            setBookmarkId(existing.rows[0].$id);
            return;
        }

        const success = await bookmarkService.bookmarkPost(
            post.$id,
            userData.$id
        );

        if (success) {

            if (userData.$id !== post.userId) {

                await notificationService.createNotification({

                    receiverId: post.userId,

                    senderId: userData.$id,

                    senderName: userData.name,

                    postId: post.$id,

                    postTitle: post.title,

                    type: "bookmark",

                    message: `${userData.name} bookmarked your post "${post.title}"`,

                    isRead: false,

                });

            }

            toast.success("Post bookmarked 🔖");
            await fetchBookmark();
        }
    } catch (error) {
        if (import.meta.env.DEV) { console.error(error); }
        toast.error("Something went wrong");
    } finally {
        setBookmarkLoading(false);
    }
};

useEffect(() => {

    if (!post) return;

    try {
        viewService.addView(
            post.$id,
            userData?.$id || null
        );
    } catch (e) {
        if (import.meta.env.DEV) console.log(e);
    }

}, [post]);

  return post ? (
    <div className="page-shell transition-colors">
      <Container>

        <div className="mx-auto max-w-4xl">

          {/* Cover Image */}

          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-xl shadow-slate-300/30 mb-10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">

            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="h-64 w-full object-cover sm:h-80 lg:h-[430px]"
            />

          </div>

          {/* Title */}

          <div className="mb-5 flex flex-wrap gap-2">{post.category && <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{post.category}</span>}{post.tags?.split(",").map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{tag.trim()}</span>)}</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-tight font-bold tracking-tight text-slate-950 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="surface-card flex flex-wrap items-center gap-4 p-4 sm:p-5 mt-6 mb-6">

    <Link to={`/author/${post.userId}`}>

        <img
            src={
                author?.avatar
                    ? appwriteService.getFilePreview(author.avatar)
                    : `https://ui-avatars.com/api/?name=${author?.name || "User"}`
            }
            alt={author?.name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900"
        />

    </Link>

    <div>

        <Link
            to={`/author/${post.userId}`}
            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition dark:text-white"
        >
            {author?.name || "Unknown Author"}
        </Link>

        <p className="text-sm text-slate-500 dark:text-slate-400">
            {author?.bio || "No bio available"}
        </p>

    </div>

</div>

          {/* Meta */}

          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Published article · {new Date(post.$createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </p>

            {isAuthor && (
              <div className="flex gap-3">

                <Link to={`/edit-post/${post.$id}`}>
                  <Button bgColor="bg-green-600">
                    Edit
                  </Button>
                </Link>

                <Button
                  bgColor="bg-red-600"
                  onClick={deletePost}
                >
                  Delete
                </Button>

              </div>
            )}

          </div>

          {/* Content */}

          <div
            className="
            surface-card article-content rounded-3xl p-6 sm:p-10
          "
          >
            {parse(DOMPurify.sanitize(post.content))}
          </div>

          <AISummary content={post.content} />

          {/* Likes */}

          <div className="surface-card mt-6 flex flex-wrap items-center gap-3 p-3">
    <button
    disabled={likeLoading}
    onClick={handleLike}
    aria-pressed={String(liked)}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] ${
        liked
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
    } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
>
    <span className="text-xl" aria-hidden="true">
        {liked ? "❤️" : "🤍"}
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
        <span aria-hidden="true">❤️</span> {likes} {likes === 1 ? "Like" : "Likes"}
    </span>
</div>

{/*Bookmark button*/}
    <button
    disabled={bookmarkLoading}
    onClick={handleBookmark}
    aria-pressed={String(bookmarked)}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] ${
        bookmarked
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
    } ${bookmarkLoading ? "opacity-50 cursor-not-allowed" : ""}`}
>
    <span className="text-xl" aria-hidden="true">
        {bookmarked ? "🔖" : "📑"}
    </span>

    <span>
        {bookmarkLoading
            ? "Processing..."
            : bookmarked
            ? "Saved"
            : "Save"}
    </span>
</button>

     {/* Comments */}

          <div className="mt-16">

    <h2 className="text-2xl font-bold tracking-tight mb-6 dark:text-white">
        Comments ({comments.length})
    </h2>

    <CommentForm
        postId={post.$id}
        postAuthorId={post.userId}
        postTitle={post.title}
        onCommentAdded={fetchComments}
    />

    <div className="mt-8">

        {comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">Be the first to add a thoughtful comment.</div>
        ) : (
            comments.map((comment) => (
                <CommentCard
                    key={comment.$id}
                    comment={comment}
                    onDelete={fetchComments}
                />
            ))
        )}

    </div>

</div>

        </div>

        <SuggestedPosts currentPost={post} />

      </Container>
    </div>
  ) : null;
}
