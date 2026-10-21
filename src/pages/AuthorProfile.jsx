import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import profileService from "../appwrite/profileService";
import { Link } from "react-router-dom";
import { Container, PostCard, BadgesList } from "../components";
import appwriteService from "../appwrite/config";
import { useSelector } from "react-redux";
import followService from "../appwrite/followService";
import toast from "react-hot-toast";
import notificationService from "../appwrite/notificationService";
import badgeService from "../appwrite/badgeService";
import { getAppwriteErrorMessage } from "../utils/appwriteError";
import { ArrowLeft, PenLine } from "lucide-react";
import SignInPrompt from "../components/SignInPrompt";

async function fetchFollowData(userId, currentUserId) {
    if (!userId) return null;
    const [followerData, followingData] = await Promise.all([
        followService.getFollowers(userId),
        followService.getFollowing(userId),
    ]);
    const follow = currentUserId && currentUserId !== userId
        ? await followService.getFollow(currentUserId, userId)
        : null;
    const row = follow?.rows?.[0];
    return {
        followers: followerData?.total ?? followerData?.rows?.length ?? 0,
        following: followingData?.total ?? followingData?.rows?.length ?? 0,
        followId: row?.$id || null,
        isFollowing: Boolean(row),
    };
}

function AuthorProfile() {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const userData = useSelector((state) => state.auth.userData);
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const[isFollowing, setIsFollowing] = useState(false);
    const [followId, setFollowId] = useState(null);
    const [followLoading, setFollowLoading] = useState(false);
    const [error, setError] = useState("");
    const [signInOpen, setSignInOpen] = useState(false);

    useEffect(() => {
        let active = true;
        const fetchData = async () => {
            setLoading(true);
            setProfile(null);
            setPosts([]);
            setError("");
            setFollowers(0);
            setFollowing(0);
            setIsFollowing(false);
            setFollowId(null);
            try {
                if (!userId) throw new Error("This author link is missing a user ID.");
                const [profileData, postData] = await Promise.all([
                    profileService.getProfile(userId),
                    appwriteService.getPostsByUser(userId),
                ]);
                if (!active) return;
                setProfile(profileData);
                setPosts(postData || []);
                try {
                    const followData = await fetchFollowData(userId, userData?.$id);
                    if (active && followData) {
                        setFollowers(followData.followers);
                        setFollowing(followData.following);
                        setIsFollowing(followData.isFollowing);
                        setFollowId(followData.followId);
                    }
                } catch (followError) {
                    if (active) toast.error(getAppwriteErrorMessage(followError));
                    if (import.meta.env.DEV) console.error("Author follow data failed", followError);
                }
            } catch (fetchError) {
                if (active) setError(getAppwriteErrorMessage(fetchError, "author profile"));
                if (import.meta.env.DEV) console.error("Author profile failed", fetchError);
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchData();
        return () => { active = false; };
    }, [userId, userData?.$id]);

    const handleFollow = async() => {
        if(!userData){
            setSignInOpen(true);
            return
        }
        if (userData.$id === userId) return;

        if(followLoading) return 
        setFollowLoading(true)

        try {
            if(isFollowing){
                const success = await followService.unfollowAuthor(followId)

                if(success){
                    toast.success("Unfollowed")
                    setIsFollowing(false);
                    setFollowId(null);
                    setFollowers((count) => Math.max(0, count - 1));
                }
            }else{

                const existing = await followService.getFollow(
                    userData.$id,
                    userId
                );

                if (existing?.rows?.length > 0) {
                toast("You're already following this author.");
                 const followData = await fetchFollowData(userId, userData.$id);
                 setFollowers(followData.followers);
                 setFollowing(followData.following);
                 setIsFollowing(followData.isFollowing);
                 setFollowId(followData.followId);
                 return;
                }

               const success =  await followService.followAuthor(
                    userData.$id,
                    userId
                )
                if(success){
                setIsFollowing(true);
                setFollowers((count) => count + 1);

                if (profile?.name) {

                    await notificationService.createNotification({

                        receiverId: userId,

                        senderId: userData.$id,

                        senderName: userData.name,

                        type: "follow",

                        message: `${userData.name} started following you`,

                        isRead: false,

                    });

                }

                toast.success("Following")
                }
            }

            const followData = await fetchFollowData(userId, userData.$id);
            if (followData) {
                setFollowers(followData.followers);
                setFollowing(followData.following);
                setIsFollowing(followData.isFollowing);
                setFollowId(followData.followId);
            }

            try {
                const followerBadges =
                    await badgeService.checkFollowerMilestones(
                        userId,
                        followService
                    );

                const earned = (followerBadges || []).filter(Boolean);

                earned.forEach((b) => {
                    if (userData.$id === userId) {
                        toast.success(
                            `🎉 Badge Earned: ${b?.name || "New Badge"}!`,
                            { duration: 5000 }
                        );
                    }
                });
            } catch (badgeErr) {
                if (import.meta.env.DEV) { console.log("Badge check error (follow):", badgeErr); }
            }
            
        } catch (error) {
            toast.error(getAppwriteErrorMessage(error, "follow"));
            if (import.meta.env.DEV) console.error("Follow action failed", error);
        }finally{
            setFollowLoading(false)
        }
    }

    if (loading) {
    return (
        <div className="page-shell"><Container>
            <h1 className="text-center text-2xl">
                Loading author...
            </h1>
        </Container></div>
    );
}

if (!profile) {
    return (
        <div className="page-shell"><Container>
            <h1 className="text-center text-2xl mt-20 dark:text-white">
                {error || "Author not found"}
            </h1>
        </Container></div>
    );
}

return (
    <>
    <div className="page-shell"><Container>
    {/*Back Button*/}
    <Link
    to="/"
    className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700 dark:text-slate-300"
    >
    <ArrowLeft size={16} /> Back to stories
</Link>

  {/*Profile card*/}
  <section className="grid gap-7 border-y border-slate-300 bg-white p-6 sm:p-9 md:grid-cols-[auto_1fr] md:items-center dark:border-slate-700 dark:bg-slate-900">

    <img
        src={
            profile?.avatar
                ? appwriteService.getFilePreview(profile.avatar)
                : `https://ui-avatars.com/api/?name=${profile?.name}`
        }
        alt={profile?.name}
        className="mx-auto h-28 w-28 rounded-full border border-slate-300 object-cover md:mx-0 md:h-36 md:w-36 dark:border-slate-700"
    />

    <div className="text-center md:text-left">
    <p className="page-kicker">Writer in the community</p>
    <h1 className="font-editorial mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
        {profile?.name}
    </h1>

    <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
        {profile?.bio || "No bio available"}
    </p>

    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Joined{" "}
        {new Date(profile.$createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })}
    </p>

    <div className="mt-6 flex flex-wrap justify-center gap-x-9 gap-y-3 border-t border-slate-200 pt-4 md:justify-start dark:border-slate-700">

    <div className="text-center">
        <h3 className="font-editorial text-3xl font-semibold text-slate-900 dark:text-white">
            {followers}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400">
            Followers
        </p>
    </div>

    <div className="text-center">
        <h3 className="font-bold text-2xl">
            {following}
        </h3>

        <p className="text-gray-500 dark:text-gray-400">
            Following
        </p>
    </div>

    <div className="text-center">
        <h3 className="font-bold text-2xl">
            {posts.length}
        </h3>

        <p className="text-gray-500 dark:text-gray-400">
            Posts
        </p>
    </div>

</div>
    </div>
</section>


{userData?.$id === userId ? (
    <div className="mt-5 flex justify-end">
        <Link to="/edit-profile" className="inline-flex min-h-11 items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"><PenLine size={16} /> Edit profile</Link>
    </div>
) : (
    <div className="mt-5 flex justify-center">
        <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`inline-flex min-h-12 items-center rounded-md px-7 py-3 font-semibold transition ${
                isFollowing
                    ? "border border-slate-400 bg-transparent text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
        >
            {followLoading
                ? "Loading..."
                : isFollowing
                ? "Following ✓"
                : "Follow"}
        </button>
    </div>
)}

<BadgesList userId={userId} title={`🏅 ${profile?.name || "Author"}'s Achievements`} />

{/*Publised post heading*/}

<h2 className="font-editorial mt-12 mb-6 border-b border-slate-300 pb-3 text-3xl font-semibold text-slate-950 dark:border-slate-700 dark:text-white">
    Published Posts
</h2>

          
{posts.length === 0 ? (

    <div className="border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-editorial text-2xl font-semibold dark:text-white">
            No posts yet
        </h2>

        <p className="text-slate-500 dark:text-slate-400 mt-2">
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

</Container></div>
<SignInPrompt open={signInOpen} onClose={() => setSignInOpen(false)} returnTo={`/author/${userId}`} action="follow this author" />
</>
    );
}

export default AuthorProfile;
