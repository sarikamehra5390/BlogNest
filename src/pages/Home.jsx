import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/config";
import { Container, PostCard, SkeletonCard } from "../components";
import { useContext } from "react";
import SearchContext from "../context/SearchContext";
import { DashboardSummary } from "../components";
import { useSelector } from "react-redux";

function Home() {

 const userData = useSelector((state) => state.auth.userData);
 const [posts, setPosts] = useState([]);
 const [loading, setLoading] = useState(true);
 const { search } = useContext(SearchContext);
 const [selectedCategory, setSelectedCategory] = useState("All");

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

   const categories = [
  "All",
  "General",
  "Java",
  "React",
  "DSA",
  "AI",
  "Web Development",
];


  const filteredPosts = posts.filter((post) => {
  const query = search.trim().toLowerCase();

  const matchesSearch =
    !query ||
    (post.title || "").toLowerCase().includes(query) ||
    (post.content || "")
      .replace(/<[^>]*>/g, "")
      .toLowerCase()
      .includes(query) ||
    (post.tags || "").toLowerCase().includes(query);

  const matchesCategory =
    selectedCategory === "All" ||
    post.category === selectedCategory;

  return matchesSearch && matchesCategory;
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

         {
        userData &&

        <DashboardSummary />

         } 


        {/* Heading */}
        <div className="mb-10 text-center">

          <h1 className="text-5xl font-bold text-slate-800 dark:text-white">
            Latest Posts
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
            Explore articles shared by the community.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">

  {categories.map((category) => (
    <button
      key={category}
      onClick={() => setSelectedCategory(category)}
      className={`px-5 py-2 rounded-full font-medium transition-all duration-300
      ${
        selectedCategory === category
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-blue-100 dark:hover:bg-slate-700"
      }`}
    >
      {category}
    </button>
  ))}

</div>

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