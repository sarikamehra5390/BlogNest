import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import service from "../appwrite/config";
import followService from "../appwrite/followService";
import likeService from "../appwrite/likeService";
import commentService from "../appwrite/commentService";
import bookmarkService from "../appwrite/bookmarkService";
import viewService from "../appwrite/viewService";
import RecentPosts from "./RecentPosts";
import RecentlyViewed from "./RecentlyViewed";
import BadgesList from "./BadgesList";

import StatCard from "./StatCard";
import AnalyticsChart from "./AnalyticsChart";
import WeeklyAnalytics from "./WeeklyAnalytics";
import ReadingStreak from "./ReadingStreak";
import badgeService from "../appwrite/badgeService";
import profileService from "../appwrite/profileService";
import analyticsService from "../appwrite/analyticsService";
import toast from "react-hot-toast";

function DashboardSummary() {
   


    const userData = useSelector((state) => state.auth.userData);

    const [posts, setPosts] = useState([]);
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState(0);
    const [bookmarks, setBookmarks] = useState(0);
    const [views, setViews] = useState(0);
    const [topPost, setTopPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [justEarnedBadges, setJustEarnedBadges] = useState([]);
    const [weekly, setWeekly] = useState(null);

    useEffect(() => {

        if (justEarnedBadges.length === 0) return;

        justEarnedBadges.forEach((b) => {
            toast.success(
                `🎉 Badge Earned: ${b?.name || "New Badge"}!`,
                { duration: 5000 }
            );
        });

        setJustEarnedBadges([]);

    }, [justEarnedBadges]);

    useEffect(() => {

        const loadDashboard = async () => {

            if (!userData) return;

            try {

                setLoading(true);

                // ==========================
                // Fetch User Posts
                // ==========================
                const myPosts = await service.getPostsByUser(userData.$id);

                setPosts(myPosts);

                // ==========================
                // Followers & Following
                // ==========================
                const [followerData, followingData] = await Promise.all([
                    followService.getFollowers(userData.$id),
                    followService.getFollowing(userData.$id),
                ]);

                setFollowers(followerData?.rows?.length || 0);
                setFollowing(followingData?.rows?.length || 0);

                // ==========================
                // Fetch Analytics
                // ==========================
                const likeResponses = await Promise.all(
                    myPosts.map(post => likeService.getLikes(post.$id))
                );

                const commentResponses = await Promise.all(
                    myPosts.map(post => commentService.getComments(post.$id))
                );

                const bookmarkResponses = await Promise.all(
                    myPosts.map(post => bookmarkService.getBookmarks(post.$id))
                );

                const viewResponses = await Promise.all(
                    myPosts.map(post => viewService.getViews(post.$id))
                );

                // ==========================
                // Calculate Totals
                // ==========================
                const postAnalytics = [];

                let totalLikes = 0;
                let totalComments = 0;
                let totalBookmarks = 0;
                let totalViews = 0;

                myPosts.forEach((post, index) => {

                    const likes = likeResponses[index]?.rows?.length || 0;
                    const comments = commentResponses[index]?.rows?.length || 0;
                    const bookmarks = bookmarkResponses[index]?.rows?.length || 0;
                    const views = viewResponses[index]?.rows?.length || 0;

                    totalLikes += likes;
                    totalComments += comments;
                    totalBookmarks += bookmarks;
                    totalViews += views;

                    postAnalytics.push({

                        ...post,

                        likes,

                        comments,

                        bookmarks,

                        views,

                        score:
                            (likes * 3) +
                            (comments * 2) +
                            bookmarks +
                            views,

                    });

                });

                setLikes(totalLikes);
                setComments(totalComments);
                setBookmarks(totalBookmarks);
                setViews(totalViews);

                // ==========================
                // Top Performing Post
                // ==========================
                const bestPost = postAnalytics.reduce(

                    (best, current) => {

                        if (!best) return current;

                        return current.score > best.score
                            ? current
                            : best;

                    },

                    null

                );

                setTopPost(bestPost);

                // ==========================
                // Weekly Analytics + Achievements (Parallel)
                // ==========================

                try {

                    const userId = userData.$id;

                    const [weeklyResult, badgesResult] = await Promise.all([

                        analyticsService.loadAllWeekly({
                            userId,
                            posts: myPosts,
                            likeService,
                            commentService,
                            bookmarkService,
                            viewService,
                            followService,
                            nWeeks: 8,
                        }),

                        Promise.all([

                            (myPosts.length > 0)
                                ? badgeService.awardIfNotEarned(userId, "first_post")
                                : null,

                            badgeService.checkLikeMilestones(
                                userId,
                                service,
                                likeService
                            ),

                            badgeService.checkFollowerMilestones(
                                userId,
                                followService
                            ),

                            badgeService.checkTrendingAuthor(
                                userId,
                                service,
                                likeService,
                                commentService,
                                bookmarkService,
                                viewService
                            ),

                            badgeService.checkTopAuthor(
                                userId,
                                service,
                                likeService,
                                commentService,
                                bookmarkService,
                                viewService,
                                profileService
                            ),

                        ]),

                    ]);

                    if (weeklyResult) setWeekly(weeklyResult);

                    const [
                        firstPostBadge,
                        likeBadges,
                        followerBadges,
                        trendingBadge,
                        topAuthorBadge,
                    ] = badgesResult;

                    const allEarned = [
                        firstPostBadge,
                        ...(likeBadges || []),
                        ...(followerBadges || []),
                        trendingBadge,
                        topAuthorBadge,
                    ].filter(Boolean);

                    if (allEarned.length > 0) {
                        setJustEarnedBadges(allEarned);
                    }

                } catch (badgeErr) {
                    if (import.meta.env.DEV) {
                        console.log("Dashboard badge check error:", badgeErr);
                    }
                }

            } catch (error) {

                if (import.meta.env.DEV) {
                    console.log("Dashboard Error:", error);
                }

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, [userData]);

    if (loading) {

        return (

            <div className="text-center py-10 text-xl dark:text-white">

                Loading Dashboard...

            </div>

        );

    }

    const recentPosts = [...posts]
    .sort(
        (a, b) =>
            new Date(b.$createdAt) -
            new Date(a.$createdAt)
    )
    .slice(0, 5);

    return (

        <div className="mb-12">

            <h1 className="text-4xl font-bold mb-8 dark:text-white">

                Welcome back 👋

            </h1>

            {/* ========================= */}
            {/* Statistics */}
            {/* ========================= */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                <StatCard
                    title="Posts"
                    value={posts.length}
                    icon="📝"
                />

                <StatCard
                    title="Followers"
                    value={followers}
                    icon="👥"
                />

                <StatCard
                    title="Following"
                    value={following}
                    icon="⭐"
                />

                <StatCard
                    title="Likes"
                    value={likes}
                    icon="❤️"
                />

                <StatCard
                    title="Comments"
                    value={comments}
                    icon="💬"
                />

                <StatCard
                    title="Bookmarks"
                    value={bookmarks}
                    icon="🔖"
                />

                <StatCard
                    title="Views"
                    value={views}
                    icon="👁️"
                />

            </div>

            {/* ========================= */}
            {/* Top Performing Post */}
            {/* ========================= */}

            {topPost && (

                <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">

                    <h2 className="text-2xl font-bold mb-6 dark:text-white">

                        🔥 Top Performing Post

                    </h2>

                    <Link
                        to={`/post/${topPost.$id}`}
                        className="block"
                    >

                        <h3 className="text-2xl font-semibold hover:text-blue-500 dark:text-white">

                            {topPost.title}

                        </h3>

                    </Link>

                    <div className="flex flex-wrap gap-8 mt-6 text-lg">

                        <span>❤️ {topPost.likes}</span>

                        <span>💬 {topPost.comments}</span>

                        <span>🔖 {topPost.bookmarks}</span>

                        <span>👁️ {topPost.views}</span>

                    </div>

                    <div className="mt-6">

                        <Link
                            to={`/edit-post/${topPost.$id}`}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Edit Post
                        </Link>

                    </div>

                </div>

            )}

            <RecentPosts posts={recentPosts} />

            <RecentlyViewed />

            <BadgesList />

            <AnalyticsChart posts={posts} />

            <WeeklyAnalytics weekly={weekly} />

            <ReadingStreak />


        </div>

    );

}

export default DashboardSummary;