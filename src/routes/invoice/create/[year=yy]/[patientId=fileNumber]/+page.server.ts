import { db } from '$lib/server/db/';
import { patients } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export async function load({ params }) {
  const patientId = [params.year, params.patientId].join('/');

  const [patient] = await db.select().from(patients).where(eq(patients.id, patientId));

  return {
    patient,
  };
}
