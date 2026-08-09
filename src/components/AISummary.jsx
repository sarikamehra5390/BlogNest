import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import aiService from "../appwrite/aiService";

function stripHtml(html) {

    if (!html) return "";

    const parser = new DOMParser();
    const document = parser.parseFromString(
        html,
        "text/html"
    );

    return document.body.textContent
        ?.replace(/\s+/g, " ")
        .trim() || "";

}

function AISummary({ content }) {

    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const generateSummary = async () => {

        if (loading) return;

        const cleanContent = stripHtml(content);

        if (!cleanContent) {

            toast.error(
                "There is no content available to summarize."
            );

            return;

        }

        if (cleanContent.length < 100) {

            toast.error(
                "This article is too short to summarize."
            );

            return;

        }

        setLoading(true);

        try {

            const result =
                await aiService.generateSummary(
                    cleanContent
                );

            setSummary(result);

            toast.success(
                "AI summary generated ✨"
            );

        } catch (error) {

            console.error(
                "AISummary :: generateSummary ::",
                error
            );

            toast.error(
                error?.message ||
                "Unable to generate AI summary."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div
            className="
                mt-8
                mb-8
                bg-gradient-to-br
                from-blue-50
                to-indigo-50
                dark:from-slate-900
                dark:to-slate-800
                border
                border-blue-100
                dark:border-slate-700
                rounded-2xl
                p-6
                shadow-sm
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

                    <h2
                        className="
                            text-xl
                            font-bold
                            text-slate-800
                            dark:text-white
                            flex
                            items-center
                            gap-2
                        "
                    >
                        ✨ AI Summary
                    </h2>

                    <p
                        className="
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                            mt-1
                        "
                    >
                        Get a quick summary of this article.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={generateSummary}
                    disabled={loading}
                    className="
                        px-5
                        py-2.5
                        rounded-xl
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        font-semibold
                        transition-all
                        duration-200
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                        hover:scale-[1.02]
                        active:scale-[0.98]
                        whitespace-nowrap
                    "
                >

                    {loading
                        ? "Generating..."
                        : summary
                        ? "Regenerate Summary"
                        : "Generate Summary ✨"}

                </button>

            </div>

            {loading && (

                <div className="mt-6">

                    <div
                        className="
                            h-4
                            bg-slate-200
                            dark:bg-slate-700
                            rounded
                            animate-pulse
                            w-full
                        "
                    />

                    <div
                        className="
                            h-4
                            bg-slate-200
                            dark:bg-slate-700
                            rounded
                            animate-pulse
                            w-11/12
                            mt-3
                        "
                    />

                    <div
                        className="
                            h-4
                            bg-slate-200
                            dark:bg-slate-700
                            rounded
                            animate-pulse
                            w-4/5
                            mt-3
                        "
                    />

                </div>

            )}

            {!loading && summary && (

                <motion.div
                    className="
                        mt-6
                        pt-6
                        border-t
                        border-blue-100
                        dark:border-slate-700
                    "
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.3,
                    }}
                >

                    <p
                        className="
                            text-slate-700
                            dark:text-slate-300
                            leading-7
                        "
                    >
                        {summary}
                    </p>

                </motion.div>

            )}

        </div>

    );

}

export default AISummary;