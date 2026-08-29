import React, { useEffect, useState } from "react";
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

     const loadFollowData = async() => {
            if(!userId) return 

            const followerData = await followService.getFollowers(userId)
            setFollowers(followerData?.rows?.length || 0)

            const followingData = await followService.getFollowing(userId)
            setFollowing(followingData?.rows?.length || 0)

            if(userData && userData.$id !== userId){
                const follow = await followService.getFollow(
                    userData.$id,
                    userId
                )

                if(follow?.rows?.length > 0){
                    setIsFollowing(true)
                    setFollowId(follow.rows[0].$id)
                }else{
                    setIsFollowing(false)
                    setFollowId(null)
                }
            }
        }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const profileData = await profileService.getProfile(userId);
            setProfile(profileData);

            const postData = await appwriteService.getPostsByUser(userId);
            setPosts(postData);
            await loadFollowData();

            setLoading(false);
        };

        fetchData();

    }, [userId, userData]);

    const handleFollow = async() => {
        if(!userData){
            toast.error("Please login first")
            return
        }

        if(followLoading) return 
        setFollowLoading(true)

        try {
            if(isFollowing){
                const success = await followService.unfollowAuthor(followId)

                if(success){
                    toast.success("Unfollowed")
                }
            }else{

                const existing = await followService.getFollow(
                    userData.$id,
                    userId
                );

                if (existing?.rows?.length > 0) {
                toast("You're already following this author.");
                await loadFollowData();
                 return;
                }

               const success =  await followService.followAuthor(
                    userData.$id,
                    userId
                )
                if(success){

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

            await loadFollowData()

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
            if (import.meta.env.DEV) { console.log(error); }
        }finally{
            setFollowLoading(false)
        }
    }

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

    <p className="text-slate-500 dark:text-slate-400 mt-2">
        {profile?.bio || "No bio available"}
    </p>

    <p className="text-slate-400 dark:text-gray-400 mt-2">
        Joined{" "}
        {new Date(profile.$createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })}
    </p>

    <div className="flex flex-wrap justify-center gap-8 mt-6">

    <div className="text-center">
        <h3 className="font-bold text-2xl">
            {followers}
        </h3>

        <p className="text-gray-500 dark:text-gray-400">
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


{userData && userData.$id !== userId && (
    <div className="flex justify-center mt-8">
        <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`px-8 py-3 rounded-xl font-semibold transition ${
                isFollowing
                    ? "bg-gray-700 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
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

<h2 className="text-3xl font-bold mt-12 mb-6 dark:text-white">
    Published Posts
</h2>

          
{posts.length === 0 ? (

    <div className="text-center py-20">
        <h2 className="text-2xl font-bold dark:text-white">
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

</Container>
    );
}

export default AuthorProfile;