import { auth } from "$lib/server/utils/auth";
import { triadicArabicName } from "$lib/utils/patterns";
import { fail } from "@sveltejs/kit";

export const actions = {
  change_name: async ({ request, locals }) => {
    const data = await request.formData();

    const name = data.get("name") as string;

    if (!name) return fail(400, { message: "لم يتم كتابة الاسم الشخصي" });
    if (!triadicArabicName.test(name))
      return fail(400, { message: "اسم المستخدم بصيغة غير صحيحة" });

    if (name === locals.user?.name)
      return fail(400, { message: "لم يتم كتابة اسم مختلف" });

    try {
      const result = await auth.api.updateUser({
        body: {
          name,
        },
        headers: request.headers,
      });
    } catch (e) {
      console.error(e);
      return fail(500, {
        message: "فشل تعديل الاسم",
      });
    }
  },

  change_email: async ({ request, locals }) => {
    const data = await request.formData();

    const email = data.get("email") as string;

    if (!email) return fail(400, { message: "لم يتم كتابة البريد الإلكتروني" });

    if (email === locals.user?.email)
      return fail(400, { message: "لم يتم كتابة بريد إلكتروني مختلف" });

    try {
      const result = await auth.api.changeEmail({
        body: {
          newEmail: email,
        },
        headers: request.headers,
      });
    } catch (e) {
      console.error(e);
      return fail(500, {
        message: "فشل تعديل البريد الإلكتروني",
      });
    }
  },

  change_password: async ({ request, locals }) => {
    const data = await request.formData();

    const currentPassword = data.get("password") as string;
    const newPassword = data.get("new-password") as string;
    const confirmPassword = data.get("confirm-password") as string;

    if (!currentPassword || !newPassword || !confirmPassword)
      return fail(400, { message: "يلزم ملء خانات كلمة المرور" });

    if (newPassword !== confirmPassword)
      return fail(400, { message: "كلمات المرور الجديدة غير متطابقة" });

    try {
      const result = await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: request.headers,
      });
    } catch (e) {
      console.error(e);
      return fail(500, {
        message: "فشل تعديل كلمة المرور",
      });
    }
  },
};
