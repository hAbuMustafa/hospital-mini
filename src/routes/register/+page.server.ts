import { auth } from "$lib/server/utils/auth";
import { fail, redirect, isRedirect } from "@sveltejs/kit";

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const confirmPassword = data.get("confirm-password") as string;

    if (password !== confirmPassword)
      return fail(400, { message: "كلمة المرور غير متطابقة" });

    try {
      const result = await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
        },
      });

      if (!result.token) {
        return fail(400, { message: "فشل إنشاء الحساب. برجاء التواصل مع مدير النظام" });
      }

      return { message: "تم التسجيل بنجاح" };
    } catch (e) {
      return fail(400, {
        message: "البريد الإلكتروني مسجل مسبقا",
      });
    }
  },
};
