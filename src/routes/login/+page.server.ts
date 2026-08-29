import { formatDate } from "$lib/date/utils";
import { syncDrugs, syncPatients } from "$lib/server/db/sync";
import { auth } from "$lib/server/utils/auth";
import { egyptianPhoneNumber, emailPattern, usernamePattern } from "$lib/utils/patterns";
import { fail } from "@sveltejs/kit";

type IdentifierT = "email" | "phone" | "username";

const loginErrorMessage = "فشل تسجيل الدخول. تأكد من اسم المستخدم وكلمة المرور";

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const identifier = data.get("identifier") as string;
    const password = data.get("password") as string;

    const identifierType = getIdentifierType(identifier);

    if (!identifierType) {
      return fail(400, {
        message: loginErrorMessage,
      });
    }

    try {
      let result;

      switch (identifierType) {
        case "email":
          result = await auth.api.signInEmail({
            body: {
              email: identifier,
              password,
              rememberMe: false,
            },
            headers: request.headers,
          });
          break;

        case "phone":
          result = await auth.api.signInPhoneNumber({
            body: {
              phoneNumber: identifier,
              password,
              rememberMe: false,
            },
            headers: request.headers,
          });
          break;

        case "username":
          result = await auth.api.signInUsername({
            body: {
              username: identifier,
              password,
              rememberMe: false,
            },
            headers: request.headers,
          });
          break;

        default:
          return fail(400, {
            message: loginErrorMessage,
          });
      }

      if (!result?.user) {
        return fail(400, {
          message: loginErrorMessage,
        });
      }

      Promise.all([syncDrugs(), syncPatients()]).then(
        () => {
          console.log(
            formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
            "✔️ Sync on login Success"
          );
        },
        (e) => {
          console.error(
            formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
            "⚠️ Error in sync at login:"
          );
          console.error(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), e);
        }
      );
    } catch (e) {
      console.error(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), e);

      return fail(400, "المستخدم غير موجود");
    }
  },
};

function getIdentifierType(identifier: string): IdentifierT | undefined {
  if (emailPattern.test(identifier)) {
    return "email";
  } else if (egyptianPhoneNumber.test(identifier)) {
    return "phone";
  } else if (usernamePattern.test(identifier)) {
    return "username";
  }
}
