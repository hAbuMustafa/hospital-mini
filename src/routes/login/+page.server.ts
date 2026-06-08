import { syncDrugs, syncPatients } from "$lib/server/db/sync";
import { auth } from "$lib/server/utils/auth";
import { fail } from "@sveltejs/kit";

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    try {
      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
          rememberMe: false,
        },
        headers: request.headers,
      });

      if (!result?.user) {
        return fail(400, {
          message: "فشل تسجيل الدخول. تأكد من اسم المستخدم وكلمة المرور",
        });
      }

      Promise.all([syncDrugs(), syncPatients()]).then(
        () => {
          console.log("✔️ Sync on login Success");
        },
        (e) => {
          console.error("⚠️ Error in sync at login:");
          console.error(e);
        }
      );
    } catch (e) {
      console.error(e);

      return fail(400, "المستخدم غير موجود");
    }
  },
};
