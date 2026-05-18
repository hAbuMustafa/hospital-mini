import { BETTER_AUTH_URL } from "$env/static/private";
import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
  plugins: [adminClient()],
});
