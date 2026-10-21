import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, PenLine } from "lucide-react";
import appwriteService from "../appwrite/config";
import { Container, DashboardSummary, PostCard, SkeletonCard } from "../components";
import SearchContext from "../context/SearchContext";
import { useSelector } from "react-redux";
import { calculateReadingTime } from "../utils/readingTime";
import { getPublicFeedErrorMessage } from "../utils/appwriteError";

const excerptFor = (content = "") => content
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();

const dateLabel = (value) => value
  ? new Date(value).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
  : "Community story";

function Home() {
  const userData = useSelector((state) => state.auth.userData);
  const { search } = useContext(SearchContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const requestId = useRef(0);

  const loadPosts = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await appwriteService.getPublishedPosts({ limit: 25 });
      const rows = response?.rows || response?.documents || (Array.isArray(response) ? response : []);
      if (currentRequest === requestId.current) setPosts(rows);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Home stories failed to load", error);
      if (currentRequest === requestId.current) setLoadError(getPublicFeedErrorMessage(error));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Network-driven state updates happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPosts();
    return () => { requestId.current += 1; };
  }, [loadPosts]);

  const filteredPosts = posts.filter((post) =>
    !search || `${post.title || ""} ${post.content || ""} ${post.category || ""} ${post.tags || ""} ${post.authorName || ""}`.toLowerCase().includes(search.toLowerCase())
  );
  const featured = filteredPosts[0];
  const moreStories = featured ? filteredPosts.slice(1) : [];

  return <div className="page-shell pb-16 pt-7 sm:pt-10">
    <Container>
      <section className="home-hero relative isolate overflow-hidden border border-slate-300 bg-parchment px-5 py-12 text-center sm:px-10 sm:py-16 lg:py-20 dark:border-slate-700">
        <div aria-hidden="true" className="home-hero__image absolute inset-0 z-0" />
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-r from-[#f7f2e9]/95 via-[#f7f2e9]/85 to-[#f7f2e9]/45 dark:from-[#1c1a18]/95 dark:via-[#1c1a18]/80 dark:to-[#1c1a18]/50" />
        <div className="relative z-20">
        <p className="page-kicker">A home for ideas worth sharing</p>
        <h1 className="font-editorial mx-auto mt-4 max-w-5xl text-5xl font-medium leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
          Read deeply.<br className="hidden sm:block" /> <span className="text-indigo-700 dark:text-indigo-300">Write bravely.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
          Thoughtful stories, fresh perspectives, and a little more room to think.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/all-posts" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            <BookOpen size={17} /> Explore stories
          </Link>
          <Link to={userData ? "/add-post" : "/signup"} className="inline-flex min-h-12 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <PenLine size={17} /> {userData ? "Write a story" : "Start writing"}
          </Link>
        </div>
        </div>
      </section>

      <section className="mt-10 sm:mt-14" aria-labelledby="featured-heading">
        <div className="mb-5 flex items-end justify-between border-b border-slate-300 pb-3">
          <div>
            <p className="page-kicker">From the community</p>
            <h2 id="featured-heading" className="font-editorial mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">A story to begin with</h2>
          </div>
          <Link to="/all-posts" className="hidden items-center gap-1 pb-1 text-sm font-semibold text-indigo-700 hover:text-indigo-800 sm:inline-flex dark:text-indigo-300">All stories <ArrowRight size={16} /></Link>
        </div>

        {loading ? <div className="grid gap-6 lg:grid-cols-2"><SkeletonCard /><div className="hidden lg:block"><SkeletonCard /></div></div> : loadError ? (
          <div className="overflow-hidden border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="grid md:grid-cols-[.9fr_1.1fr]">
              <div className="relative min-h-56 overflow-hidden bg-parchment sm:min-h-72 md:min-h-full">
                <img src="/images/blognest-editorial-hero.svg" alt="An open journal and books on a sunlit writing desk" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#25231f]/35 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-5 text-xs font-semibold uppercase tracking-[.18em] text-white drop-shadow sm:bottom-6 sm:left-7">Make room for a new idea</p>
              </div>
              <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
                <p className="page-kicker">A note from BlogNest</p>
                <h3 className="font-editorial mt-2 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl dark:text-white">Every great story starts somewhere.</h3>
                <p className="mt-4 max-w-xl leading-7 text-slate-600 dark:text-slate-300">BlogNest is a place to discover new perspectives, share the experiences that shaped you, and turn a small idea into a story worth passing along.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/all-posts" className="inline-flex min-h-11 items-center gap-2 bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"><BookOpen size={16} /> Explore stories</Link>
                  <Link to="/add-post" className="inline-flex min-h-11 items-center gap-2 border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-indigo-400 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:text-indigo-200"><PenLine size={16} /> Start writing</Link>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 text-sm dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="text-slate-500 dark:text-slate-400" role="status">Community stories are temporarily unavailable. {loadError}</p>
              <button type="button" onClick={loadPosts} className="inline-flex min-h-9 items-center gap-2 self-start font-semibold text-indigo-800 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-200 dark:hover:text-white sm:self-auto"><ArrowRight size={15} /> Retry feed</button>
            </div>
          </div>
        ) : featured ? (
          <article className="grid overflow-hidden border border-slate-300 bg-white md:grid-cols-[1.1fr_.9fr] dark:border-slate-700 dark:bg-slate-900">
            <Link to={`/post/${featured.$id}`} className="group order-2 flex flex-col justify-center p-6 sm:p-9 md:order-1 lg:p-12" aria-label={`Read ${featured.title}`}>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[.12em] text-slate-500 dark:text-slate-400">
                {featured.category && <span className="text-indigo-700 dark:text-indigo-300">{featured.category}</span>}
                <span>{dateLabel(featured.$createdAt)}</span>
                <span>{calculateReadingTime(featured.content)} min read</span>
              </div>
              <h3 className="font-editorial mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-950 group-hover:text-indigo-700 sm:text-4xl lg:text-5xl dark:text-white dark:group-hover:text-indigo-300">{featured.title}</h3>
              <p className="mt-4 line-clamp-4 text-base leading-7 text-slate-600 dark:text-slate-300">{excerptFor(featured.content) || "Open this story from the BlogNest community."}</p>
              {featured.authorName && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">By {featured.userId ? <Link to={`/author/${featured.userId}`} onClick={(event) => event.stopPropagation()} className="font-semibold text-slate-800 hover:text-indigo-700 dark:text-slate-100 dark:hover:text-indigo-300">{featured.authorName}</Link> : <span className="font-semibold text-slate-800 dark:text-slate-100">{featured.authorName}</span>}</p>}
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">Read the story <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
            <Link to={`/post/${featured.$id}`} className="order-1 min-h-60 bg-slate-200 md:order-2 md:min-h-[25rem]" aria-label={`Read ${featured.title}`}>
              {featured.featuredImage ? <img src={appwriteService.getFilePreview(featured.featuredImage)} alt={featured.title ? `Cover image for ${featured.title}` : ""} className="h-full w-full object-cover" /> : <div aria-hidden="true" className="flex h-full min-h-60 items-center justify-center bg-parchment text-indigo-700 dark:text-indigo-300"><BookOpen size={56} strokeWidth={1} /></div>}
            </Link>
          </article>
        ) : (
          <div className="border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <h3 className="font-editorial text-2xl font-semibold text-slate-900 dark:text-white">{search ? "No stories match that search." : "The first story is waiting to be written."}</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{search ? "Try another title, topic, or tag." : "Browse the library or share a thought of your own."}</p>
          </div>
        )}
      </section>

      {!loading && !loadError && moreStories.length > 0 && <section className="mt-12 sm:mt-16" aria-labelledby="latest-heading">
        <div className="mb-6 flex items-end justify-between border-b border-slate-300 pb-3">
          <div><p className="page-kicker">Keep exploring</p><h2 id="latest-heading" className="font-editorial mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">More stories</h2></div>
          <Link to="/all-posts" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300">Browse all <ArrowRight size={16} /></Link>
        </div>
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {moreStories.map((post) => <PostCard key={post.$id} {...post} />)}
        </div>
      </section>}

      {userData && <section className="mt-16 border-t border-slate-300 pt-10 dark:border-slate-700" aria-label="Your BlogNest activity"><DashboardSummary /></section>}

    </Container>
  </div>;
}

export default Home;
