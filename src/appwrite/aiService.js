import { Client, Functions} from "appwrite";
import conf from "../conf/conf";

class AIService {

    client;
    functions;

    constructor() {

        this.client = new Client()
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.functions = new Functions(this.client);

    }

    async generateSummary(content) {

        if (!content || !content.trim()) {
            throw new Error("Post content is required.");
        }

        if (!conf.appwriteAiFunctionId) {
            throw new Error("AI function ID is not configured.");
        }

        try {

            const response =
                await this.functions.createExecution({

                    functionId:
                        conf.appwriteAiFunctionId,

                    body: JSON.stringify({

                        action: "summary",

                        content,

                    }),

                    async: false,

                    path: "/",

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                });

            if (
                response?.responseStatusCode &&
                response.responseStatusCode >= 400
            ) {

                throw new Error(
                    `AI function failed with status ${response.responseStatusCode}`
                );

            }

            if (!response?.responseBody) {
                throw new Error(
                    "AI function returned an empty response."
                );
            }

            let data;

            try {

                data = JSON.parse(
                    response.responseBody
                );

            } catch (parseError) {

                console.error(
                    "AIService :: Invalid response:",
                    response.responseBody
                );

                throw new Error(
                    "Invalid response received from AI service."
                );

            }

            if (!data?.success) {

                throw new Error(
                    data?.message ||
                    "Unable to generate AI summary."
                );

            }

            return data.result || "";

        } catch (error) {

            console.error(
                "AIService :: generateSummary ::",
                error
            );

            throw error;

        }

    }

    // ==========================================
    // AI TITLE GENERATOR
    // ==========================================

    async generateTitles(content) {

        if (!content || !content.trim()) {
            throw new Error("Post content is required.");
        }

        if (!conf.appwriteAiFunctionId) {
            throw new Error("AI function ID is not configured.");
        }

        try {

            const response =
                await this.functions.createExecution({

                    functionId:
                        conf.appwriteAiFunctionId,

                    body: JSON.stringify({

                        action: "title",

                        content,

                    }),

                    async: false,

                    path: "/",

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                });

            if (
                response?.responseStatusCode &&
                response.responseStatusCode >= 400
            ) {

                throw new Error(
                    `AI function failed with status ${response.responseStatusCode}`
                );

            }

            if (!response?.responseBody) {
                throw new Error(
                    "AI function returned an empty response."
                );
            }

            let data;

            try {

                data = JSON.parse(
                    response.responseBody
                );

            } catch (parseError) {

                console.error(
                    "AIService :: Invalid title response:",
                    response.responseBody
                );

                throw new Error(
                    "Invalid response received from AI service."
                );

            }

            if (!data?.success) {

                throw new Error(
                    data?.message ||
                    "Unable to generate AI titles."
                );

            }

            return Array.isArray(data.result)
                ? data.result
                : [];

        } catch (error) {

            console.error(
                "AIService :: generateTitles ::",
                error
            );

            throw error;

        }

    }

}

const aiService = new AIService();

export default aiService;