import conf from "../conf/conf.js";
import { Account, Client, ID } from "appwrite";

export class AuthService {
  client = new Client();
  account;
  currentUserRequest = null;
  loginRequest = null;

  constructor() {
    this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
  }

  async createAccount({ email, password, name }) {
    return this.account.create(ID.unique(), email.trim(), password, name.trim());
  }

  async login({ email, password }) {
    if (this.loginRequest) return this.loginRequest;

    // Appwrite rejects a second session creation while a valid session exists.
    // Reuse it so repeated clicks and restored sessions stay idempotent.
    this.loginRequest = (async () => {
      const currentUser = await this.getCurrentUser();
      if (currentUser) return { user: currentUser, reusedSession: true };

      const session = await this.account.createEmailPasswordSession(email.trim(), password);
      const user = await this.account.get();
      return { session, user, reusedSession: false };
    })().finally(() => { this.loginRequest = null; });

    return this.loginRequest;
  }

  async getCurrentUser() {
    if (this.currentUserRequest) return this.currentUserRequest;
    this.currentUserRequest = this.account.get()
      .catch((error) => {
        // A missing or expired session is an expected unauthenticated state.
        if (error?.code === 401) return null;
        if (import.meta.env.DEV) console.error("AuthService :: getCurrentUser", error);
        throw error;
      })
      .finally(() => { this.currentUserRequest = null; });
    return this.currentUserRequest;
  }

  async logout() {
    try {
      await this.account.deleteSession("current");
      return true;
    } catch (error) {
      // Delete is idempotent from the UI's perspective: a stale session means logged out.
      if (error?.code !== 401 && import.meta.env.DEV) {
        console.error("AuthService :: logout", error);
      }
      return error?.code === 401;
    }
  }
}

const authService = new AuthService();
export default authService;
