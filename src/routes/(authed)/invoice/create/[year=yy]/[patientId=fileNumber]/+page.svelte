<script lang="ts">
  let { data } = $props();
  const { patient } = $derived(data);
</script>

<header>
  <h1>فاتورة أدوية</h1>
  <div class="patient-data">
    <dl>
      <dt>اسم المريض:</dt>
      <dd>{patient.name}</dd>

      <dt>القسم:</dt>
      <dd>{patient.ward_recent}</dd>

      <dt>التشخيص:</dt>
      <dd>{patient.diagnosis}</dd>

      <dt>{patient.id_type}:</dt>
      <dd>{patient.id_number}</dd>

      <dt>تاريخ الدخول:</dt>
      <dd></dd>

      <dt>تاريخ الخروج:</dt>
      <dd></dd>
    </dl>
  </div>
  <h2>سداد فاتورة</h2>
</header>
