import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, PenLine, Sparkles } from "lucide-react";
import appwriteService from "../appwrite/config";
import { Container, DashboardSummary, PostCard, SkeletonCard, TopAuthors, TrendingPosts } from "../components";
import SearchContext from "../context/SearchContext";
import { useSelector } from "react-redux";

function Home() {
  const userData = useSelector((state) => state.auth.userData);
  const { search } = useContext(SearchContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const response = await appwriteService.getPosts(); setPosts(response?.rows || response?.documents || (Array.isArray(response) ? response : [])); } catch { setPosts([]); } finally { setLoading(false); } })(); }, []);
  const filteredPosts = posts.filter((post) => !search || `${post.title} ${post.category} ${post.tags}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="page-shell">
    <Container>
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white shadow-xl shadow-indigo-950/15 sm:px-10 sm:py-16 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(129,140,248,.45),transparent_24rem),radial-gradient(circle_at_65%_100%,rgba(37,99,235,.25),transparent_28rem)]" />
        <div className="relative max-w-3xl"><p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-indigo-100"><Sparkles size={15} /> A better place for ideas</p><h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Read deeply. <span className="text-indigo-300">Write bravely.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">BlogNest brings curious readers and thoughtful writers together in one focused, beautiful space.</p><div className="mt-8 flex flex-wrap gap-3">{userData ? <Link to="/add-post" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-indigo-50"><PenLine size={17} /> Write an article</Link> : <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-indigo-50">Start writing <ArrowRight size={17} /></Link>}<Link to="/all-posts" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"><BookOpen size={17} /> Explore stories</Link></div></div>
      </section>

      {userData && <section className="mt-10 space-y-10"><DashboardSummary /><TrendingPosts /><TopAuthors /></section>}
      <section className="mt-14"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="page-kicker">From the community</p><h2 className="page-heading mt-2">Fresh perspectives</h2><p className="page-subtitle">Discover ideas worth keeping open in another tab.</p></div><Link to="/all-posts" className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View all posts <ArrowRight size={16} /></Link></div>
        {loading ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div> : filteredPosts.length ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filteredPosts.slice(0, 6).map((post) => <PostCard key={post.$id} {...post} />)}</div> : <div className="empty-state mt-8"><div className="text-4xl" aria-hidden="true">📚</div><h2 className="mt-4 text-xl font-bold dark:text-white">No stories found</h2><p className="mt-2 text-slate-500 dark:text-slate-400">Try another search or check back soon for new writing.</p></div>}
      </section>
    </Container>
  </div>;
}
export default Home;
