import { Link } from "react-router-dom";

function RecentPosts({ posts }) {

    if (!posts || posts.length === 0) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">
                    📄 Recent Posts
                </h2>

                <p className="text-gray-500 dark:text-gray-400">
                    You haven't created any posts yet.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-12">

            <h2 className="text-2xl font-bold mb-6 dark:text-white">
                📄 Recent Posts
            </h2>

            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg">

                <table className="min-w-full">

                    <thead className="border-b">

                        <tr>

                            <th className="px-6 py-4 text-left">Title</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {posts.map((post) => (

                            <tr
                                key={post.$id}
                                className="border-b hover:bg-slate-100 dark:hover:bg-slate-800"
                            >

                                <td className="px-6 py-4">
                                    {post.title}
                                </td>

                                <td className="px-6 py-4 capitalize">
                                    {post.status}
                                </td>

                                <td className="px-6 py-4">

                                    <div className="flex justify-center gap-3">

                                        <Link
                                            to={`/post/${post.$id}`}
                                            className="bg-blue-600 text-white px-3 py-1 rounded"
                                        >
                                            View
                                        </Link>

                                        <Link
                                            to={`/edit-post/${post.$id}`}
                                            className="bg-green-600 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </Link>

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default RecentPosts;