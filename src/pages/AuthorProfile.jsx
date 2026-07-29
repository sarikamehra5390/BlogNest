import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import profileService from "../appwrite/profileService";
import service from "../appwrite/config";
import { Link } from "react-router-dom";
import { Container, PostCard } from "../components";
import appwriteService from "../appwrite/config";

function AuthorProfile() {
    const { userId } = useParams();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const profileData = await profileService.getProfile(userId);
            setProfile(profileData);

            const postData = await service.getPostsByUser(userId);
            setPosts(postData);

            setLoading(false);
        };

        fetchData();
    }, [userId]);

    if (loading) {
    return (
        <Container>
            <h1 className="text-center text-2xl">
                Loading author...
            </h1>
        </Container>
    );
}

if (!profile) {
    return (
        <Container>
            <h1 className="text-center text-2xl mt-20 dark:text-white">
                Author not found
            </h1>
        </Container>
    );
}

return (
    <Container>
    {/*Back Button*/}
    <Link
    to="/"
    className="inline-flex items-center mb-8 text-blue-600 hover:text-blue-700"
    >
    ← Back to Home
</Link>

  {/*Profile card*/}
  <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg p-8 text-center">

    <img
        src={
            profile?.avatar
                ? appwriteService.getFilePreview(profile.avatar)
                : `https://ui-avatars.com/api/?name=${profile?.name}`
        }
        alt={profile?.name}
        className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-blue-500"
    />

    <h1 className="text-3xl font-bold mt-4 dark:text-white">
        {profile?.name}
    </h1>

    <p className="text-slate-500 mt-2">
        {profile?.bio || "No bio available"}
    </p>

    <p className="text-slate-400 mt-2">
        Joined{" "}
        {new Date(profile.$createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })}
    </p>

    <div className="mt-6 inline-flex items-center px-5 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <span className="text-blue-700 dark:text-blue-300 font-semibold">
            📝 {posts.length} Published Posts
        </span>
    </div>

</div>

{/*Publised post heading*/}

<h2 className="text-3xl font-bold mt-12 mb-6 dark:text-white">
    Published Posts
</h2>

          
{posts.length === 0 ? (

    <div className="text-center py-20">
        <h2 className="text-2xl font-bold dark:text-white">
            No posts yet
        </h2>

        <p className="text-slate-500 mt-2">
            This author hasn't published any articles.
        </p>
    </div>

) : (

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
        {posts.map((post) => (
            <PostCard
                key={post.$id}
                {...post}
            />
        ))}
    </div>

)}

</Container>
    );
}

export default AuthorProfile;