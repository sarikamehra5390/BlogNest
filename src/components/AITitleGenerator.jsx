import React, { useState } from "react";
import toast from "react-hot-toast";
import aiService from "../appwrite/aiService";

function AITitleGenerator({ content, onSelectTitle }) {
    const [titles, setTitles] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateTitles = async () => {
        if (!content || !content.trim()) {
            toast.error(
                "Write some content before generating titles."
            );
            return;
        }

        if (loading) return;

        setLoading(true);

        try {
            const result = await aiService.generateTitles(
                content
            );

            if (!Array.isArray(result) || result.length === 0) {
                throw new Error(
                    "No title suggestions were generated."
                );
            }

            setTitles(result);

            toast.success(
                "AI titles generated successfully ✨"
            );
        } catch (error) {
            console.error(
                "AITitleGenerator :: generateTitles ::",
                error
            );

            toast.error(
                error?.message ||
                    "Unable to generate AI titles."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTitle = (title) => {
        onSelectTitle(title);

        toast.success("Title selected ✨");
    };

    return (
        <div
            className="
                mt-6
                bg-gradient-to-br
                from-blue-50
                to-indigo-50
                dark:from-slate-900
                dark:to-slate-800
                rounded-2xl
                border
                border-blue-100
                dark:border-slate-700
                p-6
            "
        >
            <div
                className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-4
                "
            >
                <div>
                    <h3
                        className="
                            text-xl
                            font-bold
                            text-slate-800
                            dark:text-white
                        "
                    >
                        ✨ AI Title Generator
                    </h3>

                    <p
                        className="
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                            mt-1
                        "
                    >
                        Generate engaging titles for your article.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={generateTitles}
                    disabled={loading}
                    className="
                        px-5
                        py-2.5
                        rounded-xl
                        bg-blue-600
                        hover:bg-blue-700
                        disabled:bg-blue-400
                        text-white
                        font-semibold
                        transition-all
                        duration-200
                        shadow-md
                        hover:shadow-lg
                        disabled:cursor-not-allowed
                    "
                >
                    {loading
                        ? "Generating..."
                        : "Generate Titles ✨"}
                </button>
            </div>

            {titles.length > 0 && (
                <div className="mt-6 space-y-3">
                    <h4
                        className="
                            text-sm
                            font-semibold
                            text-slate-700
                            dark:text-slate-200
                        "
                    >
                        Suggested Titles
                    </h4>

                    {titles.map((title, index) => (
                        <div
                            key={`${title}-${index}`}
                            className="
                                flex
                                flex-col
                                sm:flex-row
                                sm:items-center
                                justify-between
                                gap-3
                                bg-white
                                dark:bg-slate-800
                                border
                                border-slate-200
                                dark:border-slate-700
                                rounded-xl
                                p-4
                                transition-all
                                hover:border-blue-400
                                dark:hover:border-blue-500
                            "
                        >
                            <p
                                className="
                                    text-slate-800
                                    dark:text-slate-100
                                    font-medium
                                "
                            >
                                {title}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    handleSelectTitle(title)
                                }
                                className="
                                    shrink-0
                                    px-4
                                    py-2
                                    rounded-lg
                                    bg-slate-100
                                    hover:bg-blue-600
                                    hover:text-white
                                    dark:bg-slate-700
                                    dark:hover:bg-blue-600
                                    text-slate-700
                                    dark:text-slate-200
                                    text-sm
                                    font-semibold
                                    transition-all
                                "
                            >
                                Use This
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AITitleGenerator;