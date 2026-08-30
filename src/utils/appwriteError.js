export function getAppwriteErrorMessage(error, context = "request") {
  const code = error?.code || error?.response?.status;
  const type = error?.type || "";

  if (error?.message?.includes("not configured")) {
    return "This feature is not configured yet. Please contact the site administrator.";
  }

  if (code === 401) {
    return context === "login"
      ? "Invalid email or password. Please check your details and try again."
      : "Your session has expired. Please sign in again.";
  }
  if (code === 409 || type.includes("user_already_exists")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (code === 429) return "Too many attempts. Please wait a moment and try again.";
  if (code === 403 || type.includes("not_authorized")) {
    return "You don’t have permission to perform this action.";
  }
  if (!error?.response && !error?.code && !navigator.onLine) {
    return "Unable to connect. Check your internet connection and try again.";
  }
  if (context === "login") return "Unable to sign in. Please try again.";
  if (context === "signup") return "Unable to create your account. Please try again.";
  if (context === "like") return "Unable to update your like. Please try again.";
  if (context === "bookmark") return "Unable to update your saved post. Please try again.";
  return "Something went wrong. Please try again.";
}
