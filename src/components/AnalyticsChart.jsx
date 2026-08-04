import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function AnalyticsChart({ posts }) {

    const monthlyPosts = {};

    posts.forEach((post) => {

        const month = new Date(post.$createdAt).toLocaleString(
            "default",
            {
                month: "short",
            }
        );

        monthlyPosts[month] =
            (monthlyPosts[month] || 0) + 1;

    });

    const chartData = Object.keys(monthlyPosts).map((month) => ({
        month,
        posts: monthlyPosts[month],
    }));

    return (

        <div className="mt-12 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg">

            <h2 className="text-2xl font-bold mb-6 dark:text-white">

                📈 Posts Per Month

            </h2>

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <BarChart data={chartData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="posts"
                        radius={[10, 10, 0, 0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

export default AnalyticsChart;