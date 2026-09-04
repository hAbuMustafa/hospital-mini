import type { drugs, patients_view } from "$lib/server/db/schema";
import type { authClient } from "$lib/auth-client";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: typeof authClient.$Infer.Session.user | null;
      session: typeof authClient.$Infer.Session.session | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  type DrugT = typeof drugs.$inferSelect;
  type PatientT = typeof patients_view.$inferSelect;

  type InvoiceDrugT = DrugT & {
    amount: number;
    total: number;
  };
}

export {};
