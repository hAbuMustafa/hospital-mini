export function load({ params }) {
  return {
    title: `بيانات الملف ${params.year}/${params.patientId}`,
  };
}
