import type { auth } from "$lib/server/utils/auth";
import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  inferAdditionalFields,
  phoneNumberClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    usernameClient(),
    phoneNumberClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
