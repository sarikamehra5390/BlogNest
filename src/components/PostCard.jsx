import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { calculateReadingTime } from "../utils/readingTime";

function PostCard({ $id, title, content, featuredImage, category, tags }) {
  const imageUrl = appwriteService.getFilePreview(featuredImage);
  const readingTime = calculateReadingTime(content);
  const tagList = tags?.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 3) || [];
  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-indigo-900 dark:hover:shadow-none">
      <Link to={`/post/${$id}`} className="flex h-full flex-col focus:outline-none" aria-label={`Read ${title}`}>
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={imageUrl} alt={title ? `Cover image for ${title}` : "Article cover"} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          {category && <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur dark:bg-slate-950/90 dark:text-indigo-300">{category}</span>}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"><Clock3 size={15} aria-hidden="true" /> {readingTime} min read</div>
          <h2 className="line-clamp-2 text-xl font-bold leading-7 tracking-tight text-slate-900 transition group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">{title}</h2>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">A thoughtful read from the BlogNest community.</p>
          {tagList.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{tagList.map((tag) => <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{tag}</span>)}</div>}
          <div className="mt-auto flex items-center gap-1 pt-6 text-sm font-semibold text-indigo-600 dark:text-indigo-400">Read article <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
        </div>
      </Link>
    </article>
  );
}
export default PostCard;
