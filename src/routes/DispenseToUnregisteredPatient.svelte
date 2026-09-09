<script lang="ts">
  let patientName = $state("");
</script>

<h2>صرف لمريض غير مسجل</h2>

<form action="/dispense/26/0" method="GET">
  <input
    type="text"
    name="patient_name"
    bind:value={patientName}
    placeholder="اسم المريض"
  />
  <input type="submit" class="btn" value="صرف تذكرة" />
</form>

<style>
  .btn {
    --bg: green;
  }
</style>
