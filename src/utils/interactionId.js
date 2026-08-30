// A deterministic, Appwrite-safe id makes one user/post interaction atomic.
// The SHA-256 digest avoids exceeding Appwrite's 36-character row-id limit.
export async function createInteractionId(type, userId, postId) {
  const value = `${type}:${userId}:${postId}`;
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
