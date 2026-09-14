export function load({ params }) {
  return {
    title: `إنشاء فاتورة للملف ${params.year}/${params.patientId}`,
  };
}
