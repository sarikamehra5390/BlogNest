import { useMemo } from "react";
import { TopicDiscovery } from "./ExploreDiscovery";

function PopularTags({ posts = [], unavailable = false, selectedTopic, onSelectTopic }) {
  const tags = useMemo(() => {
    const frequency = new Map();
    posts.forEach((post) => {
      const values = Array.isArray(post.tags) ? post.tags : String(post.tags || "").split(",");
      values.map((tag) => String(tag).trim()).filter(Boolean).forEach((name) => {
        const key = name.toLowerCase();
        const current = frequency.get(key);
        frequency.set(key, { name: current?.name || name, count: (current?.count || 0) + 1 });
      });
    });
    return [...frequency.values()].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [posts]);

  return (
    <div className="mt-9">
      <TopicDiscovery
        tags={tags}
        unavailable={unavailable}
        selectedTopic={selectedTopic}
        onSelectTopic={onSelectTopic}
      />
      {!unavailable && tags.length > 0 && (
        <p className="sr-only">{tags.map((tag) => `${tag.name}: ${tag.count} loaded stories`).join(". ")}</p>
      )}
    </div>
  );
}

export default PopularTags;
