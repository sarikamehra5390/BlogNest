import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
    Container,
    BadgesList,
    PostCard,
} from "../components";
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
        if (!userData?.$id) {
            setProfile(null);
            setPosts([]);
            setFollowers(0);
            setFollowing(0);
            setError("Please sign in to view your profile.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Load the user's profile first.
            const data = await profileService.ensureProfile({
                userId: userData.$id,
                name: userData.name || "",
            });

            if (!data) {
                throw new Error("Profile data could not be loaded.");
            }

            setProfile(data);

            // Load posts, followers, and following independently.
            // A failure in one request won't block the other results.
            const results = await Promise.allSettled([
                appwriteService.getPostsByUser(userData.$id),
                followService.getFollowers(userData.$id),
                followService.getFollowing(userData.$id),
            ]);

            const [postsResult, followersResult, followingResult] = results;

            if (postsResult.status === "fulfilled") {
                setPosts(postsResult.value?.rows ?? postsResult.value ?? []);
            } else {
                console.error(
                    "Failed to load user posts:",
                    postsResult.reason
                );
                setPosts([]);
            }

            if (followersResult.status === "fulfilled") {
                setFollowers(
                    followersResult.value?.rows?.length ?? 0
                );
            } else {
                console.error(
                    "Failed to load followers:",
                    followersResult.reason
                );
                setFollowers(0);
            }

            if (followingResult.status === "fulfilled") {
                setFollowing(
                    followingResult.value?.rows?.length ?? 0
                );
            } else {
                console.error(
                    "Failed to load following:",
                    followingResult.reason
                );
                setFollowing(0);
            }
        } catch (err) {
            console.error("Failed to load profile:", err);
            setProfile(null);
            setError(
                "We couldn't load your profile. Please check your connection and try again."
            );
        } finally {
            setLoading(false);
        }
    }, [userData]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) {
        return (
            <div className="page-shell">
                <Container>
                    <div className="mx-auto max-w-3xl space-y-6">
                        <div className="surface-card p-8 sm:p-10">
                            <div className="mx-auto h-28 w-28 rounded-full shimmer" />
                            <div className="mx-auto mt-5 h-8 w-48 rounded-lg shimmer" />
                            <div className="mx-auto mt-4 h-5 w-72 max-w-full rounded-lg shimmer" />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[0, 1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="surface-card h-24 shimmer"
                                />
                            ))}
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="page-shell">
                <Container>
                    <div className="empty-state mt-12">
                        <div className="text-5xl" aria-hidden="true">
                            👤
                        </div>

                        <h2 className="mt-4 text-2xl font-bold dark:text-white">
                            Your profile needs a moment
                        </h2>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            {error ||
                                "We couldn't find the details for this account yet."}
                        </p>

                        <button
                            type="button"
                            onClick={fetchProfile}
                            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm shadow-indigo-500/25 hover:bg-indigo-700"
                        >
                            Try again
                        </button>
                    </div>
                </Container>
            </div>
        );
    }

    const avatarUrl = profile.avatar
        ? appwriteService.getFilePreview(profile.avatar)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              profile.name || userData.name || "User"
          )}`;

    return (
        <div className="page-shell">
            <Container>
                <div className="mx-auto max-w-3xl overflow-hidden border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <div className="h-3 bg-indigo-600" />

                    <div className="relative flex flex-col items-center px-7 pb-8 sm:px-10">
                        <Link to={`/author/${profile.userId}`}>
                            <img
                                src={avatarUrl}
                                alt={profile.name || "Profile avatar"}
                                className="h-28 w-28 cursor-pointer rounded-full border border-slate-300 object-cover transition-transform hover:scale-[1.02] dark:border-slate-700"
                            />
                        </Link>

                        <Link
                            to={`/author/${profile.userId}`}
                            className="block text-center"
                        >
                            <h1 className="font-editorial mt-5 cursor-pointer text-4xl font-semibold tracking-tight transition-colors hover:text-indigo-700 dark:text-white">
                                {profile.name || userData.name}
                            </h1>
                        </Link>

                        <p className="mt-2 max-w-xl text-center leading-7 text-slate-600 dark:text-slate-300">
                            {profile.bio || "No bio added yet."}
                        </p>

                        <p className="mt-4 text-sm text-gray-400">
                            Joined{" "}
                            {profile.$createdAt
                                ? new Date(
                                      profile.$createdAt
                                  ).toLocaleDateString()
                                : "recently"}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/edit-profile")}
                            className="mt-7 inline-flex min-h-11 items-center rounded-md bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Edit Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-3 border-t border-slate-200/80 dark:border-slate-800">
                        {[
                            ["Posts", posts.length],
                            ["Followers", followers],
                            ["Following", following],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="border-t border-slate-200 px-3 py-5 text-center first:border-r dark:border-slate-700"
                            >
                                <p className="font-editorial text-3xl font-semibold text-slate-900 dark:text-white">
                                    {value}
                                </p>

                                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    {label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <BadgesList />

                <section className="mt-12">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="page-kicker">Your writing</p>
                            <h2 className="page-heading mt-2">
                                Published stories
                            </h2>
                        </div>

                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {posts.length}{" "}
                            {posts.length === 1 ? "article" : "articles"}
                        </span>
                    </div>

                    {posts.length > 0 ? (
                        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.$id}
                                    {...post}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state mt-7">
                            <div className="text-4xl" aria-hidden="true">
                                ✍️
                            </div>

                            <h3 className="mt-4 text-xl font-bold dark:text-white">
                                Your first story starts here
                            </h3>

                            <p className="mt-2 text-slate-500 dark:text-slate-400">
                                Share an idea with the BlogNest community
                                when you're ready.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/add-post")}
                                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
                            >
                                Write an article
                            </button>
                        </div>
                    )}
                </section>
            </Container>
        </div>
    );
}
