import { Client } from "appwrite";
import conf from "../conf/conf";

// Keep authentication and the services that rely on the current user on the
// same Appwrite client instance. The Web SDK sends the user's session cookie
// automatically; no API key or manually supplied JWT belongs in this client.
const appwriteClient = new Client()
    .setEndpoint(conf.appwriteUrl)
    .setProject(conf.appwriteProjectId);

export default appwriteClient;
