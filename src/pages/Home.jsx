import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/config";
import { Container, PostCard, SkeletonCard } from "../components";
import { useContext } from "react";
import SearchContext from "../context/SearchContext";
import { DashboardSummary } from "../components";
import { useSelector } from "react-redux";
import { TrendingPosts , TopAuthors} from "../components";

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
    userData && (
        <>
            <DashboardSummary />
            <TrendingPosts />
            <TopAuthors />
        </>
    )
}

      </Container>
    </div>
  );
}

export default Home;