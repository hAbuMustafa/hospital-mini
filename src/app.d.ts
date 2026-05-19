import type { drugs, narcoticsDispensed, patients_view } from "$lib/server/db/schema";
import type { Session, User } from "better-auth";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: User | null;
      session: Session | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  type DrugT = typeof drugs.$inferSelect;
  type PatientT = typeof patients_view.$inferSelect;

  type StaleData = {
    ward: string;
    narcotics: InvoiceNarcoticDrugT[];
  };

  type InvoiceSelectedDrugT = DrugT & {
    amount: number;
    total: () => number;
    editable: boolean;
  };

  type InvoiceNarcoticDrugT = DrugT & {
    amount: number;
    total: number;
    editable?: boolean;
  };
}

export {};
