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
  plugins: [
    adminClient(),
    customSessionClient(),
    usernameClient(),
    phoneNumberClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
