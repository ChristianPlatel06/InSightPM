export const SESSION_COOKIE = "insightpm_session";

export type AuthTokenPayload = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/cancelled-popup-request":
      return "Google sign-in was interrupted.";
    case "auth/popup-blocked":
      return "The browser blocked the Google sign-in popup.";
    default:
      return error instanceof Error ? error.message : "Authentication failed.";
  }
}
