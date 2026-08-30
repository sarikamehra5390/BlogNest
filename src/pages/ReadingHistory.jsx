import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import historyService from "../appwrite/historyService";
import appwriteService from "../appwrite/config";
import { Container } from "../components";
import ReadingStreak from "../components/ReadingStreak";

function ReadingHistory() {

    const userData = useSelector(
        (state) => state.auth.userData
    );

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadHistory = async () => {

            if (!userData) {

                setLoading(false);
                return;

            }

            try {

                const response =
                    await historyService.getHistory(
                        userData.$id
                    );

                const rows = response?.rows || [];

                const posts = await Promise.all(

                    rows.map(async (item) => {

                        const post =
                            await appwriteService.getPost(
                                item.postId
                            );

                        return {

                            ...item,

                            post,

                        };

                    })

                );

                setHistory(posts);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

        loadHistory();

    }, [userData]);

    const removeHistory = async (historyId) => {

        const success =
            await historyService.removeHistory(
                historyId
            );

        if (success) {

            setHistory((prev) =>
                prev.filter(
                    (item) =>
                        item.$id !== historyId
                )
            );

        }

    };

    const clearHistory = async () => {

        const success =
            await historyService.clearHistory(
                userData.$id
            );

        if (success) {

            setHistory([]);

        }

    };

    if (loading) {

        return (

            <div className="page-shell"><Container><div className="mx-auto max-w-4xl space-y-5 py-10"><div className="h-44 rounded-2xl shimmer" />{[0, 1, 2].map((item) => <div key={item} className="h-28 rounded-2xl shimmer" />)}</div></Container></div>

        );

    }

    return (

        <div className="page-shell"><Container>

            <div className="max-w-4xl mx-auto py-2 sm:py-6">

                <ReadingStreak />

                <div className="surface-card flex flex-wrap justify-between items-center gap-4 mb-8 mt-12 p-5 sm:p-6">

                    <div><p className="page-kicker">Your library</p><h1 className="mt-2 text-3xl font-bold tracking-tight dark:text-white">Reading history</h1></div>

                    {

                        history.length > 0 && (

                            <button

                                onClick={clearHistory}

                                className="
                                    rounded-xl bg-red-500
                                    text-white
                                    px-4
                                    py-2
                                    rounded-lg
                                    hover:bg-red-600
                                "

                            >

                                Clear All

                            </button>

                        )

                    }

                </div>

                {

                    history.length === 0 ? (

                        <div
                            className="
                                empty-state
                            "
                        >

                            <div className="text-5xl" aria-hidden="true">📚</div><h2 className="mt-4 text-2xl font-bold dark:text-white">No reading history yet</h2><p className="mt-2 text-slate-500 dark:text-slate-400">Articles you open will appear here, ready for your next visit.</p>

                        </div>

                    ) : (

                        <div className="space-y-6">

                            {

                                history.map((item) => (

                                    <div

                                        key={item.$id}

                                        className="
                                            surface-card p-5 sm:p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-md
                                        "

                                    >

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">

                                            <div>

                                                <h2
                                                    className="
                                                        text-2xl
                                                        font-bold
                                                        dark:text-white
                                                    "
                                                >

                                                    {

                                                        item.post?.title ||

                                                        "Post Deleted"

                                                    }

                                                </h2>

                                                <p
                                                    className="
                                                        mt-2
                                                        text-gray-500
                                                        dark:text-gray-400
                                                    "
                                                >

                                                    Viewed on{" "}

                                                    {

                                                        new Date(
                                                            item.viewedAt
                                                        ).toLocaleString()

                                                    }

                                                </p>

                                            </div>

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    gap-3
                                                "
                                            >

                                                {

                                                    item.post && (

                                                        <Link

                                                            to={`/post/${item.post.$id}`}

                                                            className="
                                                        rounded-xl bg-indigo-600
                                                                text-white
                                                                px-4
                                                                py-2
                                                                rounded-lg
                                                            "

                                                        >

                                                            Read Again

                                                        </Link>

                                                    )

                                                }

                                                <button

                                                    onClick={() =>
                                                        removeHistory(
                                                            item.$id
                                                        )
                                                    }

                                                    className="
                                                        text-red-500
                                                        hover:text-red-700
                                                    "

                                                >

                                                    Delete

                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                ))

                            }

                        </div>

                    )

                }

            </div>

        </Container></div>

    );

}

export default ReadingHistory;
