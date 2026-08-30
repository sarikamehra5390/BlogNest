import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import commentService from "../appwrite/commentService";
import notificationService from "../appwrite/notificationService";

function CommentForm({ postId, postAuthorId, postTitle, onCommentAdded }) {
  const { register, handleSubmit, reset } = useForm();

  const userData = useSelector((state) => state.auth.userData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (data) => {
    if (!userData) {
      toast.error("Please login to comment");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
    const comment = await commentService.createComment({
      content: data.content,
      postId,
      userId: userData.$id,
      userName: userData.name,
    });

    if (comment) {

      if (postAuthorId && userData.$id !== postAuthorId && postTitle) {

        await notificationService.createNotification({

          receiverId: postAuthorId,

          senderId: userData.$id,

          senderName: userData.name,

          postId,

          postTitle,

          type: "comment",

          message: `${userData.name} commented on your post "${postTitle}"`,

          isRead: false,

        });

      }

      toast.success("Comment added!");

      reset();

      if (onCommentAdded) {
        onCommentAdded();
      }
    } else {
      toast.error("Unable to add your comment. Please try again.");
    }
    } catch (error) {
      console.error("Comment submission failed", error);
      toast.error("Unable to add your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="surface-card mt-8 p-5 sm:p-6">

      <h2 className="text-xl font-bold tracking-tight mb-1 dark:text-white">
        Leave a Comment
      </h2>

      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">Join the conversation with a useful, respectful response.</p><form onSubmit={handleSubmit(submit)}>

        <textarea
          {...register("content", {
            required: true,
          })}
          rows={5}
          placeholder="Share your thoughts..."
          aria-label="Write a comment"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:bg-indigo-700"
        >
          {isSubmitting ? "Posting…" : "Post Comment"}
        </button>

      </form>

    </div>
  );
}

export default CommentForm;
