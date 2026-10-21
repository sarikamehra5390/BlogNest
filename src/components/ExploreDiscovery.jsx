import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Compass,
  Lightbulb,
  PenLine,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import TOPIC_PROMPTS from "./topicPrompts";

export function ExploreHero({ search, onSearchChange }) {
  return (
    <section className="relative isolate mb-10 overflow-hidden border border-slate-300 bg-[#efe6d9] dark:border-slate-700 dark:bg-slate-900" aria-labelledby="explore-heading">
      <img src="/images/blognest-editorial-hero.svg" alt="An open journal, books, and a sunlit writing desk" className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f8f5ef] via-[#f8f5ef]/95 to-[#f8f5ef]/55 dark:from-[#1c1a18] dark:via-[#1c1a18]/95 dark:to-[#1c1a18]/65" />
      <div className="max-w-4xl px-5 py-10 sm:px-9 sm:py-14 lg:px-12 lg:py-16">
        <p className="page-kicker">Explore the library</p>
        <h1 id="explore-heading" className="page-heading scroll-mt-36 mt-3 max-w-3xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">Find your next perspective.</h1>
        <p className="page-subtitle max-w-2xl">Discover ideas, experiences, and stories worth sharing.</p>
        <label className="relative mt-7 block max-w-xl">
          <span className="sr-only">Search stories by topic or phrase</span>
          <Search aria-hidden="true" size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search a topic or phrase"
            className="min-h-13 w-full border border-slate-300 bg-white/95 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-600 dark:bg-slate-900/95 dark:text-white dark:placeholder:text-slate-400"
          />
        </label>
        <a href="#topic-discovery" className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-indigo-800 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-950 dark:text-indigo-200 dark:hover:text-white">
          Browse topics <ArrowDown aria-hidden="true" size={15} />
        </a>
      </div>
    </section>
  );
}

export function TopicDiscovery({ tags, unavailable, selectedTopic, onSelectTopic }) {
  const topics = unavailable ? TOPIC_PROMPTS.map((name) => ({ name })) : tags;

  return (
    <section id="topic-discovery" className="scroll-mt-36" aria-labelledby="topics-heading">
      <div className="flex flex-col gap-2 border-b border-slate-300 pb-4 dark:border-slate-700 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="page-kicker">{unavailable ? "A few places to begin" : "From published stories"}</p>
          <h2 id="topics-heading" className="font-editorial mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Topics to explore</h2>
        </div>
        {unavailable && <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">These are discovery prompts, not a list of live articles or community tags.</p>}
      </div>

      {topics.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2.5">
          {topics.map((topic) => unavailable ? (
            <button
              key={topic.name}
              type="button"
              onClick={() => onSelectTopic(topic.name)}
              aria-pressed={selectedTopic === topic.name}
              className={`min-h-10 border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:border-indigo-400 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-indigo-200 ${selectedTopic === topic.name ? "border-indigo-700 bg-indigo-50 text-indigo-900 dark:border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100" : "border-slate-300 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"}`}
            >
              {topic.name}
            </button>
          ) : (
            <Link key={topic.name} to={`/tag/${encodeURIComponent(topic.name)}`} className="inline-flex min-h-10 items-center border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-400 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-indigo-200">
              #{topic.name}<span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{topic.count}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">No topic tags have been added to published stories yet.</p>
      )}

      {unavailable && selectedTopic && (
        <p className="mt-4 border-l-2 border-indigo-600 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-700 dark:bg-slate-900/70 dark:text-slate-200" role="status">
          You chose <strong>{selectedTopic}</strong>. Matching published stories can’t be retrieved while the live feed is unavailable.
        </p>
      )}
    </section>
  );
}

export function DiscoveryActivities() {
  const cards = [
    {
      eyebrow: "WANDER",
      title: "Ideas worth exploring",
      description: "Follow a question, a passing thought, or a topic you have always wanted to understand.",
      action: "Browse topic prompts",
      href: "#topic-discovery",
      icon: Compass,
      tone: "bg-[#e8e2d4] text-[#52634d] dark:bg-[#30352e] dark:text-[#c6d3b8]",
    },
    {
      eyebrow: "REFLECT",
      title: "Your experience matters",
      description: "Small lessons and honest stories can give someone else a new way forward.",
      action: "Share your story",
      href: "/add-post",
      icon: Lightbulb,
      tone: "bg-[#eee0dc] text-[#873c43] dark:bg-[#3b2929] dark:text-[#d3aead]",
    },
    {
      eyebrow: "MAKE A PRACTICE",
      title: "Build your writing habit",
      description: "Give your ideas a little room each day. Your next draft can begin with one sentence.",
      action: "Start writing",
      href: "/add-post",
      icon: PenLine,
      tone: "bg-[#e2e8e5] text-[#49675a] dark:bg-[#29342f] dark:text-[#b8d0c3]",
    },
    {
      eyebrow: "PUBLISH",
      title: "A home for your next story",
      description: "Shape a perspective, polish it at your pace, and publish it for curious readers.",
      action: "Create a story",
      href: "/add-post",
      icon: BookOpen,
      tone: "bg-[#e5e3ed] text-[#625879] dark:bg-[#302d39] dark:text-[#c9c1dc]",
    },
  ];

  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="activities-heading">
      <div className="mb-6 flex items-end gap-3 border-b border-slate-300 pb-4 dark:border-slate-700">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"><Sparkles aria-hidden="true" size={18} /></span>
        <div>
          <p className="page-kicker">The BlogNest experience</p>
          <h2 id="activities-heading" className="font-editorial mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">A place to read, reflect, and write</h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ eyebrow, title, description, action, href, icon: Icon, tone }) => (
          <article key={title} className="group flex min-h-64 flex-col border border-slate-300 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-900/5 focus-within:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:shadow-black/20 sm:p-6">
            <span className={`grid h-12 w-12 place-items-center rounded-full ${tone}`}><Icon aria-hidden="true" size={21} strokeWidth={1.7} /></span>
            <p className="mt-5 text-[.68rem] font-semibold tracking-[.16em] text-slate-500 dark:text-slate-400">{eyebrow}</p>
            <h3 className="font-editorial mt-1 text-2xl font-semibold leading-tight text-slate-950 dark:text-white">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            <Link to={href} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-indigo-800 underline decoration-indigo-300 underline-offset-4 group-hover:text-indigo-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-200 dark:group-hover:text-white">
              {action} <ArrowRight aria-hidden="true" size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FeedUnavailable({ message, onRetry, retrying = false }) {
  return (
    <div className="mt-7 flex flex-col gap-3 border-y border-slate-300 py-4 text-sm dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between" role="status">
      <p className="max-w-3xl leading-6 text-slate-600 dark:text-slate-300">Live stories are temporarily unavailable. You can still explore BlogNest and discover what you can read, write, and share. <span className="text-slate-500 dark:text-slate-400">{message}</span></p>
      <button type="button" onClick={onRetry} disabled={retrying} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-200 sm:self-auto">
        <RefreshCw aria-hidden="true" size={15} className={retrying ? "animate-spin" : ""} /> {retrying ? "Checking…" : "Retry feed"}
      </button>
    </div>
  );
}
