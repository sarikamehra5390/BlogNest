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
- Do not add explanations.
- Do not use markdown.
- Return ONLY a valid JSON array of strings.

Example format:

[
  "Understanding React Hooks for Modern Applications",
  "A Practical Guide to React Hooks",
  "How React Hooks Simplify Component Development",
  "Mastering React Hooks Step by Step",
  "React Hooks: Concepts Every Developer Should Know"
]

BLOG ARTICLE:

${content}
`;

            const response = await ai.models.generateContent({
                model: "gemini-3.6-flash",

                contents: prompt,

                config: {
                    temperature: 0.7,
                    maxOutputTokens: 300,
                },
            });

            const rawResult = response.text?.trim();

            if (!rawResult) {
                throw new Error(
                    "Gemini returned an empty response."
                );
            }

            log(
                `Raw title response received: ${rawResult}`
            );

            let titles;

            try {
                /*
                 * Gemini may occasionally wrap JSON
                 * inside markdown code fences.
                 */
                const cleanedResult = rawResult
                    .replace(/^```json\s*/i, "")
                    .replace(/^```\s*/i, "")
                    .replace(/\s*```$/i, "")
                    .trim();

                titles = JSON.parse(cleanedResult);
            } catch (parseError) {
                error(
                    `Failed to parse title response: ${rawResult}`
                );

                throw new Error(
                    "Gemini returned an invalid title response."
                );
            }

            if (!Array.isArray(titles)) {
                throw new Error(
                    "Invalid title response format."
                );
            }

            const cleanTitles = titles
                .filter(
                    (title) =>
                        typeof title === "string" &&
                        title.trim().length > 0
                )
                .map((title) => title.trim())
                .slice(0, 5);

            if (cleanTitles.length === 0) {
                throw new Error(
                    "No valid titles were generated."
                );
            }

            log(
                `Generated ${cleanTitles.length} AI titles successfully.`
            );

            return res.json({
                success: true,
                action: "titles",
                result: cleanTitles,
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