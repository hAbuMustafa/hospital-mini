import { auth } from "$lib/server/utils/auth";
import { fail } from "@sveltejs/kit";
import type { BetterAuthError } from "better-auth";

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    let name = data.get("name") as string;
    let email = data.get("email") as string;
    const password = data.get("password") as string;
    const confirmPassword = data.get("confirm-password") as string;

    if (password !== confirmPassword)
      return fail(400, { message: "كلمة المرور غير متطابقة" });

    name = name.trim();
    email = email.trim();

    try {
      await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
        },
      });

      return { message: "تم التسجيل بنجاح" };
    } catch (e) {
      console.error(e);
      return fail(400, {
        message: (e as BetterAuthError).message,
      });
    }
  },
};
