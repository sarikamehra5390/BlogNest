import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export default async ({ req, res, log, error }) => {
    try {
        // Only allow POST requests
        if (req.method !== "POST") {
            return res.json(
                {
                    success: false,
                    message: "Only POST requests are allowed.",
                },
                405
            );
        }

        // Appwrite already parses application/json requests
        const body = req.bodyJson || {};

        const { action, content } = body;

        // Validate action
        if (!action) {
            return res.json(
                {
                    success: false,
                    message: "Action is required.",
                },
                400
            );
        }

        // Validate content
        if (
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.json(
                {
                    success: false,
                    message: "Content is required.",
                },
                400
            );
        }

        // Validate supported action
        if (action !== "summary") {
            return res.json(
                {
                    success: false,
                    message: "Unsupported AI action.",
                },
                400
            );
        }

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
            throw new Error("Gemini returned an empty response.");
        }

        log("AI summary generated successfully.");

        return res.json({
            success: true,
            action: "summary",
            result: summary,
        });
    } catch (err) {
        error(`BlogNest AI error: ${err.message}`);

        return res.json(
            {
                success: false,
                message: "Unable to generate AI response.",
            },
            500
        );
    }
};