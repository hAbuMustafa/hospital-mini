import { formatDate } from "$lib/date/utils.js";
import { error } from "@sveltejs/kit";

export function load({ locals, url }) {
  if (locals.user?.role !== "admin") {
    console.log(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm)"),
      401,
      url.pathname,
      locals.user?.username
    );

    return error(401, { message: "دخول غير مصرح" });
  }
}
