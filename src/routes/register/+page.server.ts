import { formatDate } from "$lib/date/utils";
import { auth } from "$lib/server/utils/auth";
import { fail } from "@sveltejs/kit";
import type { BetterAuthError } from "better-auth";

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    let name = data.get("name") as string;
    let displayName = data.get("display-name") as string;
    let email = data.get("email") as string;
    let phone = data.get("phone") as string;
    let username = data.get("username") as string;
    const password = data.get("password") as string;
    const confirmPassword = data.get("confirm-password") as string;

    if (password !== confirmPassword)
      return fail(400, { message: "كلمة المرور غير متطابقة" });

    name = name.trim();
    displayName = displayName.trim();
    email = email.trim();
    phone = phone.trim();
    username = username.trim();

    try {
      await auth.api.signUpEmail({
        body: {
          name,
          displayUsername: displayName,
          email,
          phoneNumber: phone,
          username,
          password,
        },
      });

      return { message: "تم التسجيل بنجاح" };
    } catch (e) {
      console.error(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), e);
      return fail(400, {
        message: (e as BetterAuthError).message,
      });
    }
  },
};
