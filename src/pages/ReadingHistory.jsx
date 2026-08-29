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

            <Container>

                <div className="py-10 text-center">

                    Loading History...

                </div>

            </Container>

        );

    }

    return (

        <Container>

            <div className="max-w-4xl mx-auto py-10">

                <ReadingStreak />

                <div className="flex justify-between items-center mb-8 mt-12">

                    <h1 className="text-4xl font-bold dark:text-white">

                        📖 Reading History

                    </h1>

                    {

                        history.length > 0 && (

                            <button

                                onClick={clearHistory}

                                className="
                                    bg-red-500
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
                                bg-white
                                dark:bg-slate-900
                                rounded-2xl
                                shadow-lg
                                p-10
                                text-center
                            "
                        >

                            <span className="dark:text-white">No Reading History Yet 📚</span>

                        </div>

                    ) : (

                        <div className="space-y-6">

                            {

                                history.map((item) => (

                                    <div

                                        key={item.$id}

                                        className="
                                            bg-white
                                            dark:bg-slate-900
                                            rounded-2xl
                                            shadow-lg
                                            p-6
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
                                                                bg-blue-600
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

        </Container>

    );

}

export default ReadingHistory;