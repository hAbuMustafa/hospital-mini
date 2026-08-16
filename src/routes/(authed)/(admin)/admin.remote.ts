import { form, query } from "$app/server";
import { db } from "$lib/server/db";
import { departments, user } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import * as v from "valibot";

export const getDepartments = query(async () => {
  return await db.select().from(departments);
});

export const getUsers = query(async () => {
  return await db.select().from(user);
});

const departmentsIds = await db
  .select()
  .from(departments)
  .then((deps) => deps.map((dep) => String(dep.id)));

export const changeAffiliation = form(
  v.object({
    userId: v.string(),
    departmentId: v.picklist(departmentsIds),
  }),
  async (data) => {
    try {
      await db
        .update(user)
        .set({ affiliation: Number(data.departmentId) })
        .where(eq(user.id, data.userId));
      return { success: true };
    } catch (err) {
      console.error(err);
      return {
        error: err,
      };
    }
  }
);
