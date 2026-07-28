import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import commentService from "../appwrite/commentService";

function CommentForm({ postId, onCommentAdded }) {
  const { register, handleSubmit, reset } = useForm();

  const userData = useSelector((state) => state.auth.userData);

  const submit = async (data) => {
    if (!userData) {
      toast.error("Please login to comment");
      return;
    }

    const comment = await commentService.createComment({
      content: data.content,
      postId,
      userId: userData.$id,
      userName: userData.name,
    });

    if (comment) {
      toast.success("Comment added!");

      reset();

      if (onCommentAdded) {
        onCommentAdded();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 mt-10">

      <h2 className="text-2xl font-bold mb-4 dark:text-white">
        Leave a Comment
      </h2>

      <form onSubmit={handleSubmit(submit)}>

        <textarea
          {...register("content", {
            required: true,
          })}
          rows={5}
          placeholder="Share your thoughts..."
          className="w-full rounded-xl border p-4 dark:bg-slate-800 dark:text-white"
        />

        <button
          type="submit"
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
        >
          Post Comment
        </button>

      </form>

    </div>
  );
}

export default CommentForm;