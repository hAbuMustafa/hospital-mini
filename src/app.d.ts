import type { drugs, narcoticsDispensed } from "$lib/server/db/schema";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  type StaleData = {
    ward: string;
    narcotics: (typeof narcoticsDispensed.$inferSelect)[];
  };

  type InvoiceDrugT = typeof drugs.$inferSelect & {
    amount: number;
    total: () => number;
  };
}

export {};
