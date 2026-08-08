export default async ({ req, res, log, error }) => {
    log("BlogNest AI function started");

    return res.json({
        success: true,
        message: "BlogNest AI function is working!",
    });
};