import conf from "../conf/conf";
import { Client, TablesDB, ID, Query } from "appwrite";
import notificationService from "./notificationService";

export const BADGE_DEFINITIONS = {

    FIRST_POST: {
        id: "first_post",
        name: "First Post",
        description: "Published your very first article",
        icon: "✍️",
        color: "from-amber-400 to-orange-500",
    },

    TEN_LIKES: {
        id: "ten_likes",
        name: "10 Likes",
        description: "Reached 10 likes across your posts",
        icon: "❤️",
        color: "from-rose-400 to-red-500",
    },

    HUNDRED_LIKES: {
        id: "hundred_likes",
        name: "100 Likes",
        description: "Reached 100 likes across your posts",
        icon: "💖",
        color: "from-pink-500 to-rose-600",
    },

    TEN_FOLLOWERS: {
        id: "ten_followers",
        name: "10 Followers",
        description: "Reached 10 followers",
        icon: "👥",
        color: "from-blue-400 to-indigo-500",
    },

    HUNDRED_FOLLOWERS: {
        id: "hundred_followers",
        name: "100 Followers",
        description: "Reached 100 followers",
        icon: "🌟",
        color: "from-indigo-500 to-purple-600",
    },

    TOP_AUTHOR: {
        id: "top_author",
        name: "Top Author",
        description: "Ranked among the top 3 authors by engagement",
        icon: "🏆",
        color: "from-yellow-400 to-amber-500",
    },

    TRENDING_AUTHOR: {
        id: "trending_author",
        name: "Trending Author",
        description: "Have a post in the top 5 trending",
        icon: "🔥",
        color: "from-orange-500 to-red-500",
    },

};

const _badgeCheckDebounce = new Map();

export class BadgeService {

    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new TablesDB(this.client);
    }

    async getBadges(userId) {
        try {
            const response = await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteBadgesTableId,
                queries: [
                    Query.equal("userId", userId),
                    Query.orderDesc("$createdAt"),
                ],
            });

            return response?.rows || [];
        } catch (error) {
            console.log("BadgeService :: getBadges ::", error);
            return [];
        }
    }

    async hasBadge(userId, badgeId) {
        try {
            const response = await this.databases.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteBadgesTableId,
                queries: [
                    Query.equal("userId", userId),
                    Query.equal("badgeId", badgeId),
                ],
            });

            return (response?.rows?.length || 0) > 0;
        } catch (error) {
            console.log("BadgeService :: hasBadge ::", error);
            return false;
        }
    }

    async createBadge(userId, badgeId) {
        try {
            const defKey = Object.keys(BADGE_DEFINITIONS).find(
                k => BADGE_DEFINITIONS[k].id === badgeId
            );
            const def = BADGE_DEFINITIONS[defKey];

            if (!def) return null;

            const badge = await this.databases.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteBadgesTableId,
                rowId: ID.unique(),
                data: {
                    userId,
                    badgeId: def.id,
                    name: def.name,
                    description: def.description,
                    icon: def.icon,
                    color: def.color,
                    awardedAt: new Date().toISOString(),
                },
            });

            if (badge) {
                try {
                    await notificationService.createBadgeNotification({
                        receiverId: userId,
                        badgeId: def.id,
                        badgeName: def.name,
                        badgeIcon: def.icon,
                        badgeDescription: def.description,
                    });
                } catch (notifyErr) {
                    console.log("BadgeService :: notification create error ::", notifyErr);
                }
            }

            return badge;
        } catch (error) {
            console.log("BadgeService :: createBadge ::", error);
            return null;
        }
    }

    async awardIfNotEarned(userId, badgeId) {
        const alreadyEarned = await this.hasBadge(userId, badgeId);
        if (alreadyEarned) return null;
        return await this.createBadge(userId, badgeId);
    }

    debouncedCheckAllBadges(userId, services, waitMs = 3000) {
        if (!userId) return Promise.resolve([]);

        const now = Date.now();
        const last = _badgeCheckDebounce.get(userId);
        if (last && (now - last.timestamp) < waitMs) {
            return last.promise || Promise.resolve([]);
        }

        const promise = this.checkAllBadges(userId, services)
            .catch((err) => {
                console.log("BadgeService :: debouncedCheckAllBadges ::", err);
                return [];
            });

        _badgeCheckDebounce.set(userId, { timestamp: now, promise });
        return promise;
    }

    async checkAllBadges(userId, { postService, likeService, commentService, bookmarkService, viewService, profileService, followService }) {
        if (!userId) return [];

        try {
            const [
                firstPostBadge,
                likeBadges,
                followerBadges,
                trendingBadge,
                topAuthorBadge,
            ] = await Promise.all([
                postService ? this.checkFirstPost(userId, postService) : Promise.resolve(null),
                (postService && likeService) ? this.checkLikeMilestones(userId, postService, likeService) : Promise.resolve([]),
                followService ? this.checkFollowerMilestones(userId, followService) : Promise.resolve([]),
                (postService && likeService && commentService && bookmarkService && viewService)
                    ? this.checkTrendingAuthor(userId, postService, likeService, commentService, bookmarkService, viewService)
                    : Promise.resolve(null),
                (postService && likeService && commentService && bookmarkService && viewService && profileService)
                    ? this.checkTopAuthor(userId, postService, likeService, commentService, bookmarkService, viewService, profileService)
                    : Promise.resolve(null),
            ]);

            const allEarned = [
                firstPostBadge,
                ...(likeBadges || []),
                ...(followerBadges || []),
                trendingBadge,
                topAuthorBadge,
            ].filter(Boolean);

            return allEarned;
        } catch (error) {
            console.log("BadgeService :: checkAllBadges ::", error);
            return [];
        }
    }

    async checkFirstPost(userId, postService) {
        try {
            const posts = await postService.getPostsByUser(userId);
            if ((posts?.length || 0) >= 1) {
                return await this.awardIfNotEarned(
                    userId,
                    BADGE_DEFINITIONS.FIRST_POST.id
                );
            }
            return null;
        } catch (error) {
            console.log("BadgeService :: checkFirstPost ::", error);
            return null;
        }
    }

    async checkLikeMilestones(userId, postService, likeService) {
        try {
            const posts = await postService.getPostsByUser(userId);
            if (!posts || posts.length === 0) return [];

            const likeResponses = await Promise.all(
                posts.map(p => likeService.getLikes(p.$id))
            );

            const totalLikes = likeResponses.reduce(
                (sum, res) => sum + (res?.rows?.length || 0),
                0
            );

            const awarded = [];

            if (totalLikes >= 10) {
                const r = await this.awardIfNotEarned(
                    userId,
                    BADGE_DEFINITIONS.TEN_LIKES.id
                );
                if (r) awarded.push(r);
            }

            if (totalLikes >= 100) {
                const r = await this.awardIfNotEarned(
                    userId,
                    BADGE_DEFINITIONS.HUNDRED_LIKES.id
                );
                if (r) awarded.push(r);
            }

            return awarded;
        } catch (error) {
            console.log("BadgeService :: checkLikeMilestones ::", error);
            return [];
        }
    }

    async checkFollowerMilestones(userId, followService) {
        try {
            const result = await followService.getFollowers(userId);
            const count = result?.rows?.length || 0;

            const awarded = [];

            if (count >= 10) {
                const r = await this.awardIfNotEarned(
                    userId,
                    BADGE_DEFINITIONS.TEN_FOLLOWERS.id
                );
                if (r) awarded.push(r);
            }

            if (count >= 100) {
                const r = await this.awardIfNotEarned(
                    userId,
                    BADGE_DEFINITIONS.HUNDRED_FOLLOWERS.id
                );
                if (r) awarded.push(r);
            }

            return awarded;
        } catch (error) {
            console.log("BadgeService :: checkFollowerMilestones ::", error);
            return [];
        }
    }

    async checkTopAuthor(userId, postService, likeService, commentService, bookmarkService, viewService, profileService) {
        try {
            const allPostsResponse = await postService.getPosts();
            const allPosts =
                allPostsResponse?.rows ||
                allPostsResponse?.documents ||
                allPostsResponse ||
                [];

            if (allPosts.length === 0) return null;

            const authorMap = {};

            const [likesArr, commentsArr, bookmarksArr, viewsArr] =
                await Promise.all([
                    Promise.all(allPosts.map(p => likeService.getLikes(p.$id))),
                    Promise.all(allPosts.map(p => commentService.getComments(p.$id))),
                    Promise.all(allPosts.map(p => bookmarkService.getBookmarksByPost(p.$id))),
                    Promise.all(allPosts.map(p => viewService.getViews(p.$id))),
                ]);

            allPosts.forEach((post, i) => {
                const author = post.userId;
                if (!authorMap[author]) authorMap[author] = 0;

                const score =
                    (likesArr[i]?.rows?.length || 0) * 3 +
                    (commentsArr[i]?.rows?.length || 0) * 2 +
                    (bookmarksArr[i]?.rows?.length || 0) * 2 +
                    (viewsArr[i]?.rows?.length || 0);

                authorMap[author] += score;
            });

            const ranked = Object.entries(authorMap)
                .map(([uid, score]) => ({ userId: uid, score }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            const isTop = ranked.some(r => r.userId === userId);

            if (isTop) {
                return await this.awardIfNotEarned(
                    userId,
                    BADGE_DEFINITIONS.TOP_AUTHOR.id
                );
            }

            return null;
        } catch (error) {
            console.log("BadgeService :: checkTopAuthor ::", error);
            return null;
        }
    }

    async checkTrendingAuthor(userId, postService, likeService, commentService, bookmarkService, viewService) {
        try {
            const userPosts = await postService.getPostsByUser(userId);
            if (!userPosts || userPosts.length === 0) return null;

            const allPostsResponse = await postService.getPosts();
            const allPosts =
                allPostsResponse?.rows ||
                allPostsResponse?.documents ||
                allPostsResponse ||
                [];

            const [likesArr, commentsArr, bookmarksArr, viewsArr] =
                await Promise.all([
                    Promise.all(allPosts.map(p => likeService.getLikes(p.$id))),
                    Promise.all(allPosts.map(p => commentService.getComments(p.$id))),
                    Promise.all(allPosts.map(p => bookmarkService.getBookmarksByPost(p.$id))),
                    Promise.all(allPosts.map(p => viewService.getViews(p.$id))),
                ]);

            const scored = allPosts.map((post, i) => {
                const score =
                    (likesArr[i]?.rows?.length || 0) * 3 +
                    (commentsArr[i]?.rows?.length || 0) * 2 +
                    (bookmarksArr[i]?.rows?.length || 0) * 2 +
                    (viewsArr[i]?.rows?.length || 0);

                return { ...post, score };
            });

            const top5 = scored
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            const hasTrending = top5.some(p => p.userId === userId);

            if (hasTrending) {
                return await this.awardIfNotEarned(
                    userId,
                    BADGE_DEFINITIONS.TRENDING_AUTHOR.id
                );
            }

            return null;
        } catch (error) {
            console.log("BadgeService :: checkTrendingAuthor ::", error);
            return null;
        }
    }

}

const badgeService = new BadgeService();

export default badgeService;
