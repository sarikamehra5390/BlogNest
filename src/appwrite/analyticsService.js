import conf from "../conf/conf";

const WEEK_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
});

function floorToStartOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
}

function buildLastNWeeksLabels(n) {
    const now = floorToStartOfWeek(new Date());
    const labels = [];
    for (let i = n - 1; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - i * 7);
        labels.push({
            key: start.toISOString().slice(0, 10),
            label: WEEK_LABEL_FORMATTER.format(start),
            start,
        });
    }
    return labels;
}

function isoWeekKey(dateLike) {
    return floorToStartOfWeek(new Date(dateLike)).toISOString().slice(0, 10);
}

function calcGrowth(currentWeek, previousWeek) {
    const prev = Number(previousWeek) || 0;
    const curr = Number(currentWeek) || 0;
    if (prev === 0 && curr === 0) return 0;
    if (prev === 0) return 100;
    const raw = ((curr - prev) / prev) * 100;
    return Math.round((raw + Number.EPSILON) * 100) / 100;
}

function aggregateRowsIntoWeeks(rows, weeks, createdAtKey = "$createdAt") {
    const totalsByKey = Object.fromEntries(weeks.map((w) => [w.key, 0]));
    for (const row of rows) {
        const ts = row?.[createdAtKey];
        if (!ts) continue;
        const key = isoWeekKey(ts);
        if (key in totalsByKey) totalsByKey[key] += 1;
    }
    return totalsByKey;
}

export class AnalyticsService {

    getLastNWeeks(n = 8) {
        return buildLastNWeeksLabels(n);
    }

    computeWeeklySeries(weeks, rows, createdAtKey = "$createdAt") {
        const totals = aggregateRowsIntoWeeks(rows, weeks, createdAtKey);
        return weeks.map((w, idx) => {
            const value = totals[w.key] || 0;
            const prevW = idx > 0 ? weeks[idx - 1] : null;
            const prevValue = prevW ? (totals[prevW.key] || 0) : 0;
            return {
                label: w.label,
                weekKey: w.key,
                value,
                growth: idx === 0 ? null : calcGrowth(value, prevValue),
            };
        });
    }

    buildChartData(series, valueKey) {
        return series.map((s) => ({
            label: s.label,
            [valueKey]: s.value,
        }));
    }

    async getWeeklyPostsData(posts, nWeeks = 8) {
        const weeks = this.getLastNWeeks(nWeeks);
        const series = this.computeWeeklySeries(weeks, posts, "$createdAt");
        const last = series[series.length - 1] || { value: 0 };
        const beforeLast = series.length > 1 ? series[series.length - 2] : { value: 0 };
        return {
            weeks,
            series,
            chartData: this.buildChartData(series, "posts"),
            currentWeek: last.value,
            previousWeek: beforeLast.value,
            growth: calcGrowth(last.value, beforeLast.value),
            total: series.reduce((sum, s) => sum + s.value, 0),
        };
    }

    async getWeeklyLikesData(postIds, likeService, nWeeks = 8) {
        const weeks = this.getLastNWeeks(nWeeks);

        if (!postIds || postIds.length === 0) {
            const series = this.computeWeeklySeries(weeks, [], "$createdAt");
            return {
                weeks,
                series,
                chartData: this.buildChartData(series, "likes"),
                currentWeek: 0,
                previousWeek: 0,
                growth: 0,
                total: 0,
            };
        }

        const responses = await Promise.all(
            postIds.map((id) => likeService.getLikes(id))
        );

        const allLikes = [];
        responses.forEach((res) => {
            if (res?.rows && Array.isArray(res.rows)) {
                allLikes.push(...res.rows);
            }
        });

        const series = this.computeWeeklySeries(weeks, allLikes, "$createdAt");
        const last = series[series.length - 1] || { value: 0 };
        const beforeLast = series.length > 1 ? series[series.length - 2] : { value: 0 };
        return {
            weeks,
            series,
            chartData: this.buildChartData(series, "likes"),
            currentWeek: last.value,
            previousWeek: beforeLast.value,
            growth: calcGrowth(last.value, beforeLast.value),
            total: allLikes.length,
        };
    }

    async getWeeklyCommentsData(postIds, commentService, nWeeks = 8) {
        const weeks = this.getLastNWeeks(nWeeks);

        if (!postIds || postIds.length === 0) {
            const series = this.computeWeeklySeries(weeks, [], "$createdAt");
            return {
                weeks,
                series,
                chartData: this.buildChartData(series, "comments"),
                currentWeek: 0,
                previousWeek: 0,
                growth: 0,
                total: 0,
            };
        }

        const responses = await Promise.all(
            postIds.map((id) => commentService.getComments(id))
        );

        const allComments = [];
        responses.forEach((res) => {
            if (res?.rows && Array.isArray(res.rows)) {
                allComments.push(...res.rows);
            }
        });

        const series = this.computeWeeklySeries(weeks, allComments, "$createdAt");
        const last = series[series.length - 1] || { value: 0 };
        const beforeLast = series.length > 1 ? series[series.length - 2] : { value: 0 };
        return {
            weeks,
            series,
            chartData: this.buildChartData(series, "comments"),
            currentWeek: last.value,
            previousWeek: beforeLast.value,
            growth: calcGrowth(last.value, beforeLast.value),
            total: allComments.length,
        };
    }

    async getWeeklyBookmarksData(postIds, bookmarkService, nWeeks = 8) {
        const weeks = this.getLastNWeeks(nWeeks);

        if (!postIds || postIds.length === 0) {
            const series = this.computeWeeklySeries(weeks, [], "$createdAt");
            return {
                weeks,
                series,
                chartData: this.buildChartData(series, "bookmarks"),
                currentWeek: 0,
                previousWeek: 0,
                growth: 0,
                total: 0,
            };
        }

        const responses = await Promise.all(
            postIds.map((id) => bookmarkService.getBookmarksByPost(id))
        );

        const allBookmarks = [];
        responses.forEach((res) => {
            if (res?.rows && Array.isArray(res.rows)) {
                allBookmarks.push(...res.rows);
            }
        });

        const series = this.computeWeeklySeries(weeks, allBookmarks, "$createdAt");
        const last = series[series.length - 1] || { value: 0 };
        const beforeLast = series.length > 1 ? series[series.length - 2] : { value: 0 };
        return {
            weeks,
            series,
            chartData: this.buildChartData(series, "bookmarks"),
            currentWeek: last.value,
            previousWeek: beforeLast.value,
            growth: calcGrowth(last.value, beforeLast.value),
            total: allBookmarks.length,
        };
    }

    async getWeeklyViewsData(postIds, viewService, nWeeks = 8) {
        const weeks = this.getLastNWeeks(nWeeks);

        if (!postIds || postIds.length === 0) {
            const series = this.computeWeeklySeries(weeks, [], "$createdAt");
            return {
                weeks,
                series,
                chartData: this.buildChartData(series, "views"),
                currentWeek: 0,
                previousWeek: 0,
                growth: 0,
                total: 0,
            };
        }

        const responses = await Promise.all(
            postIds.map((id) => viewService.getViews(id))
        );

        const allViews = [];
        responses.forEach((res) => {
            if (res?.rows && Array.isArray(res.rows)) {
                allViews.push(...res.rows);
            }
        });

        const series = this.computeWeeklySeries(weeks, allViews, "$createdAt");
        const last = series[series.length - 1] || { value: 0 };
        const beforeLast = series.length > 1 ? series[series.length - 2] : { value: 0 };
        return {
            weeks,
            series,
            chartData: this.buildChartData(series, "views"),
            currentWeek: last.value,
            previousWeek: beforeLast.value,
            growth: calcGrowth(last.value, beforeLast.value),
            total: allViews.length,
        };
    }

    async getWeeklyFollowersData(userId, followService, nWeeks = 8) {
        const weeks = this.getLastNWeeks(nWeeks);

        const followersRes = await followService.getFollowers(userId);
        const allFollows = followersRes?.rows || [];

        const series = this.computeWeeklySeries(weeks, allFollows, "$createdAt");
        const last = series[series.length - 1] || { value: 0 };
        const beforeLast = series.length > 1 ? series[series.length - 2] : { value: 0 };
        return {
            weeks,
            series,
            chartData: this.buildChartData(series, "followers"),
            currentWeek: last.value,
            previousWeek: beforeLast.value,
            growth: calcGrowth(last.value, beforeLast.value),
            total: allFollows.length,
        };
    }

    async loadAllWeekly({ userId, posts, likeService, commentService, bookmarkService, viewService, followService, nWeeks = 8 }) {
        const postIds = posts.map((p) => p.$id).filter(Boolean);

        const [
            postsData,
            likesData,
            commentsData,
            bookmarksData,
            viewsData,
            followersData,
        ] = await Promise.all([
            this.getWeeklyPostsData(posts, nWeeks),
            this.getWeeklyLikesData(postIds, likeService, nWeeks),
            this.getWeeklyCommentsData(postIds, commentService, nWeeks),
            this.getWeeklyBookmarksData(postIds, bookmarkService, nWeeks),
            this.getWeeklyViewsData(postIds, viewService, nWeeks),
            this.getWeeklyFollowersData(userId, followService, nWeeks),
        ]);

        return {
            posts: postsData,
            likes: likesData,
            comments: commentsData,
            bookmarks: bookmarksData,
            views: viewsData,
            followers: followersData,
        };
    }
}

const analyticsService = new AnalyticsService();

export default analyticsService;
