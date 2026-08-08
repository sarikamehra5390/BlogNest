export default async ({ req, res, log }) => {
    log("BlogNest AI Function is running");

    return res.json({
        success: true,
        message: "BlogNest AI Function is working!",
    });
};