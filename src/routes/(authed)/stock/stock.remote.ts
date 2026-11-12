import { command, form, getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import {
  departments,
  drugs,
  stockDrugs,
  stockDrugTransferItems,
  stockDrugTransferStatus,
  stockDrugTransferTicket,
  user,
} from "$lib/server/db/schema";
import { invalid } from "@sveltejs/kit";
import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
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
      unit_price: drugs.price,
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

export const getPendingTransfers = query(async () => {
  const currentUser = getRequestEvent().locals.user!;

  const fromPharmacy = alias(departments, "d1");
  const toPharmacy = alias(departments, "d2");

  return await db
    .select({
      record_id: stockDrugTransferTicket.record_id,
      ticket_id: stockDrugTransferTicket.id,
      id: stockDrugTransferItems.id,

      from_pharmacy_name: fromPharmacy.name,
      from_pharmacy_id: fromPharmacy.id,

      to_pharmacy_name: toPharmacy.name,
      to_pharmacy_id: toPharmacy.id,

      stock_id: stockDrugs.id,
      drug_id: drugs.id,
      drug_name: drugs.name_ar,

      qty: stockDrugTransferItems.qty,
      status: stockDrugTransferStatus.is_accepted,
      status_time: stockDrugTransferStatus.timestamp,
      status_by: user.id,
      status_by_name: user.name,
    })
    .from(stockDrugTransferItems)
    .leftJoin(
      stockDrugTransferTicket,
      eq(stockDrugTransferItems.ticket_id, stockDrugTransferTicket.id)
    )
    .leftJoin(stockDrugs, eq(stockDrugTransferItems.stock_id, stockDrugs.id))
    .leftJoin(toPharmacy, eq(stockDrugTransferTicket.to_pharmacy_id, toPharmacy.id))
    .leftJoin(fromPharmacy, eq(stockDrugs.pharmacy_id, fromPharmacy.id))
    .leftJoin(drugs, eq(stockDrugs.drug_id, drugs.id))
    .leftJoin(
      stockDrugTransferStatus,
      eq(stockDrugTransferItems.id, stockDrugTransferStatus.transfer_id)
    )
    .leftJoin(user, eq(stockDrugTransferStatus.user_id, user.id))
    .where(
      currentUser.role === "admin"
        ? undefined
        : or(
            eq(toPharmacy.id, currentUser.affiliation!),
            eq(fromPharmacy.id, currentUser.affiliation!)
          )
    );
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

export const transferStock = form(
  v.object({
    record_id: v.number(),
    to_pharmacy_id: v.picklist(departmentsIds),
    items: v.array(
      v.object({
        stock_id: v.number(),
        unit_price: v.number(),
        qty: v.number(),
      })
    ),
  }),
  async (data, issue) => {
    const currentUser = getRequestEvent().locals.user!;

    const stockItems = await db
      .select()
      .from(stockDrugs)
      .where(
        inArray(
          stockDrugs.id,
          data.items.map((item) => item.stock_id)
        )
      );

    if (stockItems.length < data.items.length) {
      invalid(issue.items("بعض الأصناف لا تخص جهتك"));
    }

    for (let i = 0; i < data.items.length; i++) {
      const subtractedAmount = data.items[i].qty;
      const stockAmount = stockItems.find(
        (item) => item.id === data.items[i].stock_id
      )!.qty;

      if (subtractedAmount > stockAmount) {
        invalid(
          issue.items[i].qty(`الكمية المحولة أكبر من الرصيد الحالي (${stockAmount})`)
        );
      }
    }

    const transferTicketId = await db.transaction(async (tx) => {
      const [ticket] = await tx
        .insert(stockDrugTransferTicket)
        .values({
          to_pharmacy_id: Number(data.to_pharmacy_id),
          user_id: currentUser.id,
          record_id: data.record_id,
        })
        .returning();

      // insert transfer items
      await tx.insert(stockDrugTransferItems).values(
        data.items.map((item) => ({
          ticket_id: ticket.id,
          stock_id: item.stock_id,
          unit_price: item.unit_price,
          qty: item.qty,
        }))
      );

      // subtract transferred items qty from current stock
      await tx
        .insert(stockDrugs)
        .values(
          data.items.map((item) => ({
            id: item.stock_id,
            qty: -item.qty,
            // arbitrary numbers for required column because we only need the `on conflict` clause
            drug_id: 0,
            pharmacy_id: 0,
          }))
        )
        .onConflictDoUpdate({
          target: stockDrugs.id,
          set: {
            qty: sql`qty + excluded.qty`,
          },
        });
      return ticket.id;
    });

    return { success: true, transferTicketId };
  }
);

async function getTransferItem(transferItemId: number) {
  const currentUser = getRequestEvent().locals.user!;

  const [transferItem] = await db
    .select()
    .from(stockDrugTransferItems)
    .leftJoin(stockDrugs, eq(stockDrugTransferItems.stock_id, stockDrugs.id))
    .leftJoin(
      stockDrugTransferTicket,
      eq(stockDrugTransferItems.ticket_id, stockDrugTransferTicket.id)
    )
    .leftJoin(
      stockDrugTransferStatus,
      eq(stockDrugTransferItems.id, stockDrugTransferStatus.transfer_id)
    )
    .where(
      and(
        eq(stockDrugTransferItems.id, transferItemId),
        currentUser.role === "admin"
          ? undefined
          : eq(stockDrugTransferTicket.to_pharmacy_id, currentUser.affiliation)
      )
    );

  return transferItem;
}

export const acceptTransferItem = command(v.number(), async (transferItemId) => {
  // 1. check authorization
  const currentUser = getRequestEvent().locals.user!;

  const transferItem = await getTransferItem(transferItemId);

  if (!transferItem) {
    console.error("⚠️ NO TXN");
    invalid("التحويل المطلوب غير موجود");
  }

  // 2. check if already fulfilled (accepted/rejected)
  if (transferItem.stockDrugTransferStatus !== null) {
    console.error("⚠️ ALREADY FULFILLED");
    invalid(
      `الصنف المختار تم ${transferItem.stockDrugTransferStatus?.is_accepted ? "قبول" : "رفض"}ه سابقًا.`
    );
  }

  await db.transaction(async (tx) => {
    // 3. mark accepted
    await tx.insert(stockDrugTransferStatus).values({
      transfer_id: transferItemId,
      user_id: currentUser.id,
      is_accepted: true,
    });

    // 4. add stock to target store
    await tx
      .insert(stockDrugs)
      .values({
        pharmacy_id: transferItem.stockDrugTransferTicket?.to_pharmacy_id!,
        batch_number: transferItem.stockDrugs?.batch_number,
        expiry_date: transferItem.stockDrugs?.expiry_date,
        qty: transferItem.stockDrugTransferItems.qty,
        drug_id: transferItem.stockDrugs?.drug_id!,
      })
      .onConflictDoUpdate({
        target: [stockDrugs.drug_id, stockDrugs.pharmacy_id, stockDrugs.batch_number],
        set: {
          qty: sql`qty + excluded.qty`,
        },
      });
  });

  void getPendingTransfers().refresh();

  return { success: true };
});

export const rejectTransferItem = command(v.number(), async (transferItemId) => {
  // 1. check authorization
  const currentUser = getRequestEvent().locals.user!;

  const transferItem = await getTransferItem(transferItemId);

  if (!transferItem) {
    console.error("⚠️ NO TXN");
    invalid("التحويل المطلوب غير موجود");
  }

  // 2. check if already fulfilled (accepted/rejected)
  if (transferItem.stockDrugTransferStatus !== null) {
    console.error("⚠️ ALREADY FULFILLED");
    invalid(
      `الصنف المختار تم ${transferItem.stockDrugTransferStatus?.is_accepted ? "قبول" : "رفض"}ه سابقًا.`
    );
  }

  await db.transaction(async (tx) => {
    // 3. mark rejected
    await tx.insert(stockDrugTransferStatus).values({
      transfer_id: transferItemId,
      user_id: currentUser.id,
      is_accepted: false,
    });

    // 4. return stock to original store
    await tx
      .update(stockDrugs)
      .set({ qty: sql`qty + ${transferItem.stockDrugTransferItems.qty}` })
      .where(eq(stockDrugs.id, transferItem.stockDrugTransferItems.stock_id));
  });

  void getPendingTransfers().refresh();

  return { success: true };
});
