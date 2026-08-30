import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Container, BadgesList, PostCard, SkeletonCard } from "../components";
import profileService from "../appwrite/profileService";
import { useNavigate, Link } from "react-router-dom";
import appwriteService from "../appwrite/config";
import followService from "../appwrite/followService";


export default function Profile() {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [posts, setPosts] = useState([]);
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);

    const fetchProfile = useCallback(async () => {
        if (!userData) {
            setLoading(false);
            return;
        }
        setError("");
        setLoading(true);
        try {
            const data = await profileService.ensureProfile({
                userId: userData.$id,
                name: userData.name,
            });
            setProfile(data);
            const [userPosts, followerRows, followingRows] = await Promise.all([
                appwriteService.getPostsByUser(userData.$id),
                followService.getFollowers(userData.$id),
                followService.getFollowing(userData.$id),
            ]);
            setPosts(userPosts || []);
            setFollowers(followerRows?.rows?.length || 0);
            setFollowing(followingRows?.rows?.length || 0);
        } catch (error) {
            if (import.meta.env.DEV) { console.error(error); }
            setError("We couldn’t load your profile. Please try again shortly.");
        } finally {
            setLoading(false);
        }
    }, [userData]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) {
        return (
            <div className="page-shell"><Container><div className="mx-auto max-w-3xl space-y-6"><div className="surface-card p-8 sm:p-10"><div className="mx-auto h-28 w-28 rounded-full shimmer" /><div className="mx-auto mt-5 h-8 w-48 rounded-lg shimmer" /><div className="mx-auto mt-4 h-5 w-72 max-w-full rounded-lg shimmer" /></div><div className="grid grid-cols-3 gap-3">{[0, 1, 2].map((item) => <div key={item} className="surface-card h-24 shimmer" />)}</div></div></Container></div>
        );
    }

    if (error || !profile) {
        return (
            <div className="page-shell"><Container><div className="empty-state mt-12"><div className="text-5xl" aria-hidden="true">👤</div><h2 className="mt-4 text-2xl font-bold dark:text-white">Your profile needs a moment</h2><p className="mt-2 text-slate-500 dark:text-slate-400">{error || "We couldn’t find the details for this account yet."}</p><button onClick={fetchProfile} className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm shadow-indigo-500/25 hover:bg-indigo-700">Try again</button></div></Container></div>
        );
    }


    return (
        <div className="page-shell">
            <Container>

                <div className="max-w-3xl mx-auto overflow-hidden surface-card">

                    <div className="h-28 bg-[radial-gradient(circle_at_80%_20%,rgba(129,140,248,.75),transparent_18rem),linear-gradient(120deg,#312e81,#4f46e5)]" />

                    <div className="relative flex flex-col items-center px-7 pb-8 sm:px-10">

                    <Link to={`/author/${profile?.userId}`}>
                        <img
                          src={
                            profile?.avatar
                            ? appwriteService.getFilePreview(profile.avatar)
                            : `https://ui-avatars.com/api/?name=${profile?.name}`
                          }
                           alt={profile?.name}
                            className="-mt-14 h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg ring-4 ring-indigo-500/20 transition-transform hover:scale-105 dark:border-slate-900 cursor-pointer"
                          />
                    </Link>

                       <Link
                         to={`/author/${profile?.userId}`}
                         className="block text-center"
                        >
                         <h1 className="text-3xl font-bold tracking-tight mt-5 dark:text-white hover:text-indigo-600 transition-colors cursor-pointer">
                           {profile?.name}
                         </h1>
                        </Link>

                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {profile.bio || "No bio added yet."}
                        </p>

                        <p className="text-sm text-gray-400 mt-4">
                            Joined{" "}
                            {new Date(profile.$createdAt).toLocaleDateString()}
                        </p>

                        <button
                           onClick={() => navigate("/edit-profile")}
                           className="mt-7 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-500/25 transition"
                        >
                            Edit Profile
                        </button>

                    </div>

                    <div className="grid grid-cols-3 border-t border-slate-200/80 dark:border-slate-800">
                        {[['Posts', posts.length], ['Followers', followers], ['Following', following]].map(([label, value]) => <div key={label} className="px-3 py-5 text-center"><p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p></div>)}
                    </div>
                </div>

                <BadgesList />

                <section className="mt-12">
                    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="page-kicker">Your writing</p><h2 className="page-heading mt-2">Published stories</h2></div><span className="text-sm font-medium text-slate-500 dark:text-slate-400">{posts.length} {posts.length === 1 ? "article" : "articles"}</span></div>
                    {posts.length ? <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.$id} {...post} />)}</div> : <div className="empty-state mt-7"><div className="text-4xl" aria-hidden="true">✍️</div><h3 className="mt-4 text-xl font-bold dark:text-white">Your first story starts here</h3><p className="mt-2 text-slate-500 dark:text-slate-400">Share an idea with the BlogNest community when you’re ready.</p><button onClick={() => navigate('/add-post')} className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">Write an article</button></div>}
                </section>

            </Container>
        </div>
    );
}
