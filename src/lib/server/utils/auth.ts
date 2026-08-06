import { betterAuth } from "better-auth/minimal";
import { admin, customSession, username, phoneNumber } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "$lib/server/db";
import { PUBLIC_ORIGIN, PUBLIC_ORIGIN_PROD } from "$env/static/public";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { BETTER_AUTH_SECRET } from "$env/static/private";
import { dev } from "$app/environment";
import { egyptianPhoneNumber } from "$lib/utils/patterns";
import { otp } from "../db/schema";

const sessionEndTimes = [8, 14, 20];

function getNextExpiration() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const hour of sessionEndTimes) {
    const target = new Date(today);
    target.setHours(hour, 0, 0, 0);

    if (target > now) {
      return target.getTime();
    }
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextTarget = new Date(tomorrow);
  nextTarget.setHours(sessionEndTimes[0], 0, 0, 0);

  return nextTarget.getTime();
}

export const auth = betterAuth({
  baseURL: dev ? PUBLIC_ORIGIN : PUBLIC_ORIGIN_PROD,
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 0,
  },
  user: {
    additionalFields: {
      affiliation: {
        type: "number",
        defaultValue: 0,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
    customSession(async ({ session, user }) => {
      const nextEndTimestamp = getNextExpiration();
      return {
        user,
        session: {
          ...session,
          expiresAt: new Date(nextEndTimestamp),
        },
      };
    }),
    username({
      maxUsernameLength: 15,
    }),
    phoneNumber({
      phoneNumberValidator: (phNumber) => egyptianPhoneNumber.test(phNumber),
      sendOTP: async ({ code, phoneNumber }) => {
        await db
          .insert(otp)
          .values({ phoneNumber, otp: code })
          .onConflictDoUpdate({
            target: otp.phoneNumber,
            set: { otp: code },
          });
      },
    }),
    sveltekitCookies(getRequestEvent),
  ],
  trustedOrigins: [PUBLIC_ORIGIN, PUBLIC_ORIGIN_PROD],
  secret: BETTER_AUTH_SECRET,
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const nextEndTimestamp = getNextExpiration();
          return {
            data: {
              ...session,
              expiresAt: new Date(nextEndTimestamp),
            },
          };
        },
      },
      update: {
        before: async (session) => {
          const nextEndTimestamp = getNextExpiration();
          return {
            data: {
              ...session,
              expiresAt: new Date(nextEndTimestamp),
            },
          };
        },
      },
    },
  },
  appName: "مستشفى 23 يوليو للأمراض الصدرية",
});
