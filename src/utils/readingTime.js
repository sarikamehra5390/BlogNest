export function calculateReadingTime(content = "") {
    // Remove HTML tags from TinyMCE content
    const text = content.replace(/<[^>]*>/g, "").trim();

    if (!text) return 1;

    const words = text.split(/\s+/).length;

    // Average reading speed: 200 words/minute
    return Math.max(1, Math.ceil(words / 200));
}