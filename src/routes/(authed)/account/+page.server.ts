import { db } from "$lib/server/db/index.js";
import { otp } from "$lib/server/db/schema.js";
import { auth } from "$lib/server/utils/auth";
import {
  egyptianPhoneNumber,
  triadicArabicName,
  usernamePattern,
} from "$lib/utils/patterns";
import { fail } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

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

  change_display_name: async ({ request, locals }) => {
    const data = await request.formData();

    const displayName = data.get("display-name") as string;

    if (!displayName) return fail(400, { message: "لم يتم كتابة الاسم المختصر" });

    if (displayName === locals.user?.displayUsername)
      return fail(400, { message: "لم يتم كتابة اسم مختصر مختلف" });

    try {
      const result = await auth.api.updateUser({
        body: {
          displayUsername: displayName,
        },
        headers: request.headers,
      });
    } catch (e) {
      console.error(e);
      return fail(500, {
        message: "فشل تعديل الاسم المختصر",
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

  change_phone: async ({ request, locals }) => {
    const data = await request.formData();

    const phoneNumber = data.get("phone-number") as string;

    if (!phoneNumber) return fail(400, { message: "لم يتم كتابة رقم موبايل" });
    if (!egyptianPhoneNumber.test(phoneNumber))
      return fail(400, { message: "رقم موبايل غير صحيح" });

    if (phoneNumber === locals.user?.phoneNumber)
      return fail(400, { message: "لم يتم كتابة رقم موبايل مختلف" });

    try {
      const result = await auth.api.sendPhoneNumberOTP({
        body: {
          phoneNumber,
        },
      });

      const [userOtp] = await db
        .select()
        .from(otp)
        .where(eq(otp.phoneNumber, phoneNumber));

      const updateResult = await auth.api.verifyPhoneNumber({
        body: {
          phoneNumber,
          code: userOtp.otp,
          updatePhoneNumber: true,
        },
        headers: request.headers,
      });
    } catch (e) {
      console.error(e);
      return fail(500, {
        message: "فشل تعديل رقم الموبايل",
      });
    }
  },

  change_username: async ({ request, locals }) => {
    const data = await request.formData();

    const username = data.get("username") as string;

    if (!username) return fail(400, { message: "لم يتم كتابة اسم مستخدم" });
    if (!usernamePattern.test(username))
      return fail(400, { message: "اسم مستخدم غير مقبول" });

    if (username === locals.user?.username)
      return fail(400, { message: "لم يتم كتابة اسم مستخدم مختلف" });

    try {
      const result = await auth.api.updateUser({
        body: {
          username,
        },
        headers: request.headers,
      });
    } catch (e) {
      console.error(e);
      return fail(500, {
        message: "فشل تعديل اسم المستخدم",
      });
    }
  },

  change_password: async ({ request }) => {
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
