import { PUBLIC_BETTER_AUTH_URL } from "$env/static/public";
import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: PUBLIC_BETTER_AUTH_URL,
  plugins: [adminClient()],
});
