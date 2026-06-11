import { dev } from "$app/environment";
import { PUBLIC_ORIGIN, PUBLIC_ORIGIN_PROD } from "$env/static/public";
import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: dev ? PUBLIC_ORIGIN : PUBLIC_ORIGIN_PROD,
  plugins: [adminClient()],
});
