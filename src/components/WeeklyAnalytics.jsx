import { useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    LineChart,
    Line,
    Area,
} from "recharts";

function MetricSummary({ icon, label, current, previous, growth }) {

    const isPositive = growth > 0;
    const isNeutral = growth === 0;
    const trendEmoji = isPositive ? "📈" : "📉";
    const trendColor = isPositive
        ? "text-emerald-600 dark:text-emerald-400"
        : isNeutral
        ? "text-slate-500 dark:text-slate-400"
        : "text-rose-600 dark:text-rose-400";

    const growthLabel = isNeutral
        ? "—"
        : `${isPositive ? "+" : ""}${growth}%`;

    return (

        <div
            className="
                flex
                flex-col
                gap-2
                bg-slate-50
                dark:bg-slate-800/50
                rounded-xl
                p-4
                border
                border-slate-100
                dark:border-slate-700
            "
        >

            <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                    <span className="text-xl">{icon}</span>

                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">

                        {label}

                    </span>

                </div>

                <span
                    className={`text-sm font-semibold ${trendColor}`}
                >

                    {trendEmoji} {growthLabel}

                </span>

            </div>

            <div className="flex items-baseline gap-2">

                <span className="text-2xl font-bold text-slate-800 dark:text-white">

                    {current}

                </span>

                <span className="text-xs text-slate-500 dark:text-slate-400">

                    vs {previous} prev week

                </span>

            </div>

        </div>

    );

}

function MiniBarChart({ data, dataKey, color, gradientId }) {

    return (

        <div className="w-full h-56">

            <ResponsiveContainer width="100%" height="100%">

                <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>

                    <defs>

                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">

                            <stop offset="0%" stopColor={color} stopOpacity="0.95" />

                            <stop offset="100%" stopColor={color} stopOpacity="0.55" />

                        </linearGradient>

                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e180" vertical={false} />

                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />

                    <Tooltip
                        cursor={{ fill: "#0f172a" }}
                        contentStyle={{
                            backgroundColor: "#0f172a",
                            color: "#f8fafc",
                            border: "none",
                            borderRadius: 12,
                            fontSize: 12,
                        }}
                    />

                    <Bar
                        dataKey={dataKey}
                        fill={`url(#${gradientId})`}
                        radius={[8, 8, 0, 0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

function MiniLineChart({ data, dataKey, color, gradientId }) {

    return (

        <div className="w-full h-56">

            <ResponsiveContainer width="100%" height="100%">

                <LineChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>

                    <defs>

                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">

                            <stop offset="0%" stopColor={color} stopOpacity="0.35" />

                            <stop offset="100%" stopColor={color} stopOpacity="0" />

                        </linearGradient>

                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e180" vertical={false} />

                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#0f172a",
                            color: "#f8fafc",
                            border: "none",
                            borderRadius: 12,
                            fontSize: 12,
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke="none"
                        fill={`url(#${gradientId})`}
                    />

                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: color, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

}

function MetricCard({ icon, title, data, color, type = "bar", gradientId, dataKey }) {

    if (!data) return null;

    const current = data.currentWeek ?? 0;
    const previous = data.previousWeek ?? 0;
    const growth = data.growth ?? 0;
    const chartData = data.chartData || [];

    return (

        <div
            className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                shadow-lg
                p-6
                border
                border-slate-100
                dark:border-slate-800
            "
        >

            <div className="flex items-center justify-between mb-4">

                <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">

                    <span className="text-xl">{icon}</span>

                    {title}

                </h3>

            </div>

            <MetricSummary
                icon={icon}
                label="Current"
                current={current}
                previous={previous}
                growth={growth}
            />

            <div className="mt-4">

                {type === "bar" ? (

                    <MiniBarChart
                        data={chartData}
                        dataKey={dataKey}
                        color={color}
                        gradientId={gradientId}
                    />

                ) : (

                    <MiniLineChart
                        data={chartData}
                        dataKey={dataKey}
                        color={color}
                        gradientId={gradientId}
                    />

                )}

            </div>

        </div>

    );

}

function WeeklyAnalytics({ weekly }) {

    const hasAnyData = useMemo(() => Boolean(weekly), [weekly]);

    if (!hasAnyData) {

        return (

            <div
                className="
                    mt-12
                    bg-white
                    dark:bg-slate-900
                    rounded-2xl
                    shadow-lg
                    p-8
                    text-center
                "
            >

                <div className="text-5xl mb-4">📊</div>

                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">

                    Loading weekly analytics...

                </h3>

            </div>

        );

    }

    const totalsPanel = (

        <div className="mb-8">

            <h2 className="text-2xl font-bold mb-4 dark:text-white">

                📊 Weekly Analytics

            </h2>

            <p className="text-slate-500 dark:text-slate-400 mb-6">

                Last 8 weeks of activity on your content, versus previous week.

            </p>

        </div>

    );

    return (

        <div className="mt-12">

            {totalsPanel}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                <MetricCard
                    icon="📝"
                    title="Posts Published"
                    data={weekly.posts}
                    color="#2563eb"
                    gradientId="postsGrad"
                    dataKey="posts"
                    type="bar"
                />

                <MetricCard
                    icon="❤️"
                    title="Likes Received"
                    data={weekly.likes}
                    color="#e11d48"
                    gradientId="likesGrad"
                    dataKey="likes"
                    type="bar"
                />

                <MetricCard
                    icon="👁️"
                    title="Post Views"
                    data={weekly.views}
                    color="#0ea5e9"
                    gradientId="viewsGrad"
                    dataKey="views"
                    type="line"
                />

                <MetricCard
                    icon="💬"
                    title="Comments"
                    data={weekly.comments}
                    color="#7c3aed"
                    gradientId="commentsGrad"
                    dataKey="comments"
                    type="bar"
                />

                <MetricCard
                    icon="🔖"
                    title="Bookmarks"
                    data={weekly.bookmarks}
                    color="#f59e0b"
                    gradientId="bookmarksGrad"
                    dataKey="bookmarks"
                    type="line"
                />

                <MetricCard
                    icon="👥"
                    title="New Followers"
                    data={weekly.followers}
                    color="#10b981"
                    gradientId="followersGrad"
                    dataKey="followers"
                    type="line"
                />

            </div>

        </div>

    );

}

export default WeeklyAnalytics;
