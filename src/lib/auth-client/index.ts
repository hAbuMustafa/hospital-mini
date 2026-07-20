import { dev } from "$app/environment";
import { PUBLIC_ORIGIN, PUBLIC_ORIGIN_PROD } from "$env/static/public";
import type { auth } from "$lib/server/utils/auth";
import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  customSessionClient,
  inferAdditionalFields,
  phoneNumberClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: dev ? PUBLIC_ORIGIN : PUBLIC_ORIGIN_PROD,
  plugins: [
    adminClient(),
    customSessionClient(),
    usernameClient(),
    phoneNumberClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
