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
    <article className="surface-card p-5 mb-4">

      <div className="flex justify-between items-center">

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {comment.userName}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(comment.$createdAt).toLocaleString()}
          </p>
        </div>

        {userData?.$id === comment.userId && (
          <button
            onClick={handleDelete}
            className="rounded-lg px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Delete
          </button>
        )}

      </div>

      <p className="mt-4 border-t border-slate-100 pt-4 text-slate-700 dark:border-slate-800 dark:text-slate-300 whitespace-pre-wrap">
        {comment.content}
      </p>

    </article>
  );
}

export default CommentCard;
