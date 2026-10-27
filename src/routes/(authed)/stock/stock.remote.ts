import { form, getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import { departments, drugs, stockDrugs } from "$lib/server/db/schema";
import { invalid } from "@sveltejs/kit";
import { and, eq, isNotNull } from "drizzle-orm";
import * as v from "valibot";

export const getPharmacyStock = query(async () => {
  const currentUser = getRequestEvent().locals.user!;

  return await db
    .select({
      stock_id: stockDrugs.id,
      pharmacy_id: departments.id,
      pharmacy_name: departments.name,
      id: drugs.id,
      name: drugs.name_ar,
      tradename: drugs.tradename_ar,
      category: drugs.category,
      qty: stockDrugs.qty,
      batch_number: stockDrugs.batch_number,
      expiry_date: stockDrugs.expiry_date,
    })
    .from(drugs)
    .leftJoin(stockDrugs, eq(drugs.id, stockDrugs.drug_id))
    .leftJoin(departments, eq(stockDrugs.pharmacy_id, departments.id))
    .where(
      currentUser.role === "admin"
        ? isNotNull(drugs.id)
        : eq(stockDrugs.pharmacy_id, currentUser.affiliation)
    )
    .orderBy((t) => [t.category, t.id]);
});

export const editStock = form(
  v.object({
    stock_id: v.number(),
    qty: v.number(),
    batch_number: v.string(),
    expiry_date: v.string(),
  }),
  async (data, issue) => {
    const currentUser = getRequestEvent().locals.user!;

    const [item] = await db
      .select({
        stock_id: stockDrugs.id,
        pharmacy_id: departments.id,
        pharmacy_name: departments.name,
        id: drugs.id,
        name: drugs.name_ar,
        tradename: drugs.tradename_ar,
        category: drugs.category,
        qty: stockDrugs.qty,
        batch_number: stockDrugs.batch_number,
        expiry_date: stockDrugs.expiry_date,
      })
      .from(drugs)
      .innerJoin(stockDrugs, eq(drugs.id, stockDrugs.drug_id))
      .innerJoin(departments, eq(stockDrugs.pharmacy_id, departments.id))
      .where(
        and(
          currentUser.role === "admin"
            ? isNotNull(drugs.id)
            : eq(stockDrugs.pharmacy_id, currentUser.affiliation),
          eq(stockDrugs.id, data.stock_id)
        )
      );

    if (!item) invalid(issue("الصنف المختار غير موجود"));

    await db
      .update(stockDrugs)
      .set({
        qty: data.qty,
        batch_number: data.batch_number,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
      })
      .where(eq(stockDrugs.id, data.stock_id));

    void getPharmacyStock().refresh();
  }
);

const departmentsIds = await db
  .select()
  .from(departments)
  .then((deps) => deps.map((dep) => String(dep.id)));

export const addStock = form(
  v.object({
    pharmacy_id: v.optional(v.picklist(departmentsIds)),

    drug_id: v.number(),
    qty: v.number(),
    batch_number: v.string(),
    expiry_date: v.string(),
  }),
  async (data, issue) => {
    console.info(data);
    const currentUser = getRequestEvent().locals.user!;

    if (currentUser.role === "admin" && data.pharmacy_id) {
      const [pharmacy] = await db
        .select()
        .from(departments)
        .where(eq(departments.id, Number(data.pharmacy_id)));

      if (!pharmacy) invalid(issue.pharmacy_id("الصيدلية المختارة غير موجودة"));
    }

    const [item] = await db.select().from(drugs).where(eq(drugs.id, data.drug_id));

    if (!item) invalid(issue.drug_id("الصنف غير موجود"));

    if (data.qty < 1) invalid(issue.qty("الكمية المضافة لا يمكن أن تكون أقل من 1"));

    if (!data.batch_number) invalid(issue.batch_number("يجب كتابة رقم التشغيلة"));

    try {
      await db.insert(stockDrugs).values({
        pharmacy_id:
          currentUser.role === "admin"
            ? Number(data.pharmacy_id!)
            : currentUser.affiliation,
        drug_id: data.drug_id,
        qty: data.qty!,
        batch_number: data.batch_number ? data.batch_number : undefined,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
      });
    } catch (err) {
      if (err instanceof Error) {
        invalid(err.message);
      }
    }

    void getPharmacyStock().refresh();
  }
);
