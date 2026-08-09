import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export default async ({ req, res, log, error }) => {
    try {
        if (req.method !== "POST") {
            return res.json(
                {
                    success: false,
                    message: "Only POST requests are allowed.",
                },
                405
            );
        }

        const body = JSON.parse(req.body || "{}");

        const { action, content } = body;

        if (!action) {
            return res.json(
                {
                    success: false,
                    message: "Action is required.",
                },
                400
            );
        }

        if (!content || !content.trim()) {
            return res.json(
                {
                    success: false,
                    message: "Content is required.",
                },
                400
            );
        }

        /*
         * ==========================================
         * AI SUMMARY
         * ==========================================
         */

        if (action === "summary") {
            log(
                `Generating AI summary for content length: ${content.length}`
            );

            const prompt = `
You are an expert editor for a professional blogging platform called BlogNest.

Summarize the following blog article.

Requirements:

- Produce a concise summary.
- Preserve the main ideas and important information.
- Do not invent facts.
- Do not mention that you are an AI.
- Do not use markdown headings.
- Keep the summary between 80 and 150 words.
- Make it easy to understand.
- Return only the summary.

BLOG ARTICLE:

${content}
`;

            const response = await ai.models.generateContent({
                model: "gemini-3.6-flash",

                contents: prompt,

                config: {
                    temperature: 0.3,
                    maxOutputTokens: 300,
                },
            });

            const summary = response.text?.trim();

            if (!summary) {
                throw new Error(
                    "Gemini returned an empty response."
                );
            }

            log("AI summary generated successfully.");

            return res.json({
                success: true,
                action: "summary",
                result: summary,
            });
        }

        /*
         * ==========================================
         * AI TITLE GENERATOR
         * ==========================================
         */
/*
 * ==========================================
 * AI TITLE GENERATOR
 * ==========================================
 */

if (action === "titles") {
    log(
        `Generating AI titles for content length: ${content.length}`
    );

    const prompt = `
You are an expert headline writer for a professional blogging platform called BlogNest.

Read the following blog article and generate exactly 5 strong title suggestions.

Requirements:

- Generate exactly 5 titles.
- Titles must accurately represent the article.
- Do not invent information.
- Make the titles clear and engaging.
- Avoid clickbait.
- Keep each title between 5 and 12 words.
- Make every title different.
- Do not add numbering.
- Do not add bullet points.
- Do not add explanations.
- Do not use markdown.
- Return exactly one title per line.
- Return ONLY the 5 titles.

Example:

Understanding React Components and Hooks
A Practical Guide to Modern React Development
How React Helps Build Scalable Applications
Mastering React for Frontend Development
React Development Best Practices

BLOG ARTICLE:

${content}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: prompt,

        config: {
            temperature: 0.7,
            maxOutputTokens: 500,
        },
    });

    const rawResult = response.text?.trim();

    if (!rawResult) {
        throw new Error(
            "Gemini returned an empty title response."
        );
    }

    log(`Raw title response: ${rawResult}`);

    /*
     * Convert Gemini's response into individual titles.
     */
    const titles = rawResult
        .split("\n")
        .map((title) => title.trim())

        // Remove empty lines
        .filter(Boolean)

        // Remove accidental numbering
        .map((title) =>
            title.replace(/^\d+[\).\-\:]\s*/, "")
        )

        // Remove accidental bullet points
        .map((title) =>
            title.replace(/^[-*•]\s*/, "")
        )

        // Remove surrounding quotes
        .map((title) =>
            title.replace(/^["']|["']$/g, "")
        )

        // Remove markdown code fences if Gemini adds them
        .filter(
            (title) =>
                title !== "```" &&
                title.toLowerCase() !== "```text"
        )

        // Remove duplicates
        .filter(
            (title, index, array) =>
                array.indexOf(title) === index
        )

        // Maximum 5 titles
        .slice(0, 5);

    if (titles.length === 0) {
        throw new Error(
            "No valid titles were generated."
        );
    }

    if (titles.length < 5) {
        log(
            `Gemini returned ${titles.length} titles instead of 5.`
        );
    }

    log(
        `Generated ${titles.length} AI titles successfully.`
    );

    return res.json({
        success: true,
        action: "titles",
        result: titles,
    });
}

        /*
         * ==========================================
         * UNSUPPORTED ACTION
         * ==========================================
         */

        return res.json(
            {
                success: false,
                message: "Unsupported AI action.",
            },
            400
        );

    } catch (err) {
        error(
            `BlogNest AI error: ${err?.message || String(err)}`
        );

        return res.json(
            {
                success: false,
                message: "Unable to generate AI response.",
            },
            500
        );
    }
};