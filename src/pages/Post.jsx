import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
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
    const status = await appwriteService.deletePost(post.$id);

    if (status) {
      await appwriteService.deleteFile(post.featuredImage);
      toast.success("Post deleted successfully 🗑️");
      navigate("/");
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
        console.error(error);
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
        console.error(error);
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
        console.error(error);
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

    toast.success("Post liked ❤️");

    await fetchLikes();

}
    } catch (error) {
        console.error(error);
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
            toast.success("Post bookmarked 🔖");
            await fetchBookmark();
        }
    } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
    } finally {
        setBookmarkLoading(false);
    }
};

useEffect(() => {

    if (!post) return;

    viewService.addView(
        post.$id,
        userData?.$id || null
    );

}, [post]);

  return post ? (
    <div className="bg-slate-100 min-h-screen py-12">
      <Container>

        <div className="max-w-5xl mx-auto">

          {/* Cover Image */}

          <div className="overflow-hidden rounded-3xl shadow-xl mb-10">

            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="w-full h-[450px] object-cover"
            />

          </div>

          {/* Title */}

          <h1 className="text-5xl font-bold text-slate-800 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 mt-6 mb-8">

    <Link to={`/author/${post.userId}`}>

        <img
            src={
                author?.avatar
                    ? appwriteService.getFilePreview(author.avatar)
                    : `https://ui-avatars.com/api/?name=${author?.name || "User"}`
            }
            alt={author?.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
        />

    </Link>

    <div>

        <Link
            to={`/author/${post.userId}`}
            onClick={() => alert(`Navigating to /author/${post.userId}`)}
            className="text-xl font-semibold hover:text-blue-600 transition"
        >
            {author?.name || "Unknown Author"}
        </Link>

        <p className="text-gray-500 dark:text-gray-400">
            {author?.bio || "No bio available"}
        </p>

    </div>

</div>

          {/* Meta */}

          <div className="flex items-center justify-between mb-10">

            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Published Article
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
            bg-white
            dark:bg-slate-900
            rounded-3xl
            shadow-lg
            p-10
            leading-8
            text-lg
            text-slate-700
            dark:text-slate-300
            prose
            max-w-none
          "
          >
            {parse(post.content)}
          </div>

          {/* Likes */}

          <div className="flex items-center gap-4 mt-6">
    <button
    disabled={likeLoading}
    onClick={handleLike}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
        liked
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
    } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
>
    <span className="text-xl">
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

    <span className="font-medium text-gray-700 dark:text-gray-300">
        ❤️ {likes} {likes === 1 ? "Like" : "Likes"}
    </span>
</div>

{/*Bookmark button*/}
    <button
    disabled={bookmarkLoading}
    onClick={handleBookmark}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
        bookmarked
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
    } ${bookmarkLoading ? "opacity-50 cursor-not-allowed" : ""}`}
>
    <span className="text-xl">
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

    <h2 className="text-3xl font-bold mb-6 dark:text-white">
        Comments ({comments.length})
    </h2>

    <CommentForm
        postId={post.$id}
        onCommentAdded={fetchComments}
    />

    <div className="mt-8">

        {comments.length === 0 ? (
            <p className="text-slate-500">
                Be the first to comment.
            </p>
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

      </Container>
    </div>
  ) : null;
}