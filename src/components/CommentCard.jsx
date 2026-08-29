import React from "react";
import { useSelector } from "react-redux";
import commentService from "../appwrite/commentService";
import toast from "react-hot-toast";

function CommentCard({ comment, onDelete }) {
  const userData = useSelector((state) => state.auth.userData);

  const handleDelete = async () => {
    const success = await commentService.deleteComment(comment.$id);

    if (success) {
      toast.success("Comment deleted");
      onDelete();
    } else {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-5 mb-4">

      <div className="flex justify-between items-center">

        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">
            {comment.userName}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(comment.$createdAt).toLocaleString()}
          </p>
        </div>

        {userData?.$id === comment.userId && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        )}

      </div>

      <p className="mt-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
        {comment.content}
      </p>

    </div>
  );
}

export default CommentCard;