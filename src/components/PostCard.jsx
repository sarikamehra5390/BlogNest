import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { calculateReadingTime } from "../utils/readingTime";

function PostCard({ $id, title, content, featuredImage, category, tags, $createdAt, userId, authorName }) {
  const readingTime = calculateReadingTime(content);
  const tagList = tags?.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 3) || [];
  const excerpt = (content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  const published = $createdAt
    ? new Date($createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <article className="group flex h-full flex-col border-t border-slate-300 pt-4 dark:border-slate-700">
      {featuredImage && <Link to={`/post/${$id}`} className="mb-4 block aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-800" aria-label={`Read ${title}`}>
        <img src={appwriteService.getFilePreview(featuredImage)} alt={title ? `Cover image for ${title}` : "Article cover"} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
      </Link>}
      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {category && <span className="font-semibold uppercase tracking-[.12em] text-indigo-700 dark:text-indigo-300">{category}</span>}
          {published && <time dateTime={$createdAt}>{published}</time>}
          <span className="inline-flex items-center gap-1"><Clock3 size={13} aria-hidden="true" /> {readingTime} min read</span>
        </div>
        {authorName && userId && <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">By <Link to={`/author/${userId}`} className="font-semibold text-slate-800 hover:text-indigo-700 dark:text-slate-100 dark:hover:text-indigo-300">{authorName}</Link></p>}
        <h2 className="font-editorial text-2xl font-semibold leading-tight tracking-tight text-slate-950 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
          <Link to={`/post/${$id}`} className="focus:outline-none">{title}</Link>
        </h2>
        {excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{excerpt}</p>}
        {tagList.length > 0 && <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">{tagList.map((tag) => <Link key={tag} to={`/tag/${encodeURIComponent(tag)}`} className="text-xs font-medium text-slate-500 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-300">#{tag}</Link>)}</div>}
        <Link to={`/post/${$id}`} className="mt-auto inline-flex min-h-11 items-center gap-1 pt-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300">Read story <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
      </div>
    </article>
  );
}

export default PostCard;
