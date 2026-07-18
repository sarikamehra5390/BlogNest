import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/config";
import { Container, PostCard, SkeletonCard } from "../components";
import { useContext } from "react";
import SearchContext from "../context/SearchContext";

function Home() {
 const [posts, setPosts] = useState([]);
 const [loading, setLoading] = useState(true);
 const { search } = useContext(SearchContext);

  useEffect(() => {
    const fetchPosts = async () => {
      try {

        
        const response = await appwriteService.getPosts();

        console.log(response.rows);

        // TablesDB
        if (response?.rows) {
          setPosts(response.rows);
          
        }

        // Old Databases API
        else if (response?.documents) {
          setPosts(response.documents);
         
        }

        // Already an array
        else if (Array.isArray(response)) {
          setPosts(response);
          
        }

        // Fallback
        else {
          setPosts([]);
         
        }

         setLoading(false);

      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);


  const filteredPosts = posts.filter((post) => {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  const title = (post.title || "").toLowerCase();

  const content = (post.content || "")
    .replace(/<[^>]*>/g, "")
    .toLowerCase();

  const category = (post.category || "").toLowerCase();

  const tags = (post.tags || "").toLowerCase();

  return (
    title.includes(query) ||
    content.includes(query) ||
    category.includes(query) ||
    tags.includes(query)
  );
});

  


  if (loading) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </Container>
    </div>
  );
}

  if (posts.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-100">
        <Container>
          <div className="text-center">

            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Welcome to BlogNest
            </h1>

            <p className="text-slate-500 text-lg mb-8">
              Sign in to discover amazing articles written by our community.
            </p>

            <div className="text-7xl mb-6">📚</div>

          </div>
        </Container>
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12 transition-colors">
      <Container>

        {/* Heading */}
        <div className="mb-10 text-center">

          <h1 className="text-5xl font-bold text-slate-800 dark:text-white">
            Latest Posts
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
            Explore articles shared by the community.
          </p>

        </div>

        {filteredPosts.length === 0 && search !== "" && (
  <div className="text-center py-16">

    <div className="text-6xl mb-4">🔍</div>

    <h2 className="text-3xl font-bold text-slate-700 dark:text-white">
      No Posts Found
    </h2>

    <p className="mt-3 text-slate-500">
      No articles match "
      <span className="font-semibold">{search}</span>"
    </p>

  </div>
)}

        {/* Posts Grid */}
        {filteredPosts.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
         {filteredPosts.map((post) => (
            <PostCard
              key={post.$id || post.$sequence}
              {...post}
            />
          ))}
        </div>
        )}

      </Container>
    </div>
  );
}

export default Home;