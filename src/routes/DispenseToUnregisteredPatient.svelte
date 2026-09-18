<script lang="ts">
  let patientName = $state("");
  let fileNumber = $state("");

  const THIS_YEAR = new Date().getFullYear() - 2000;
</script>

<div class="forms-wrapper">
  <form action="/dispense/{THIS_YEAR}/0" method="GET">
    <input
      type="text"
      name="patient_name"
      bind:value={patientName}
      placeholder="اسم المريض"
    />
    <input type="submit" class="btn" value="صرف تذكرة" />
  </form>

  <form
    action="/dispense/{fileNumber.includes('/')
      ? fileNumber
      : `${THIS_YEAR}/${fileNumber}`}"
    method="GET"
  >
    <input type="text" bind:value={fileNumber} placeholder="رقم الملف" />
    <input type="submit" class="btn" value="صرف تذكرة" />
  </form>
</div>

<style>
  .forms-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  form {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    --bg: green;
  }
</style>
