<script lang="ts">
  import Combobox from "$lib/components/Combobox.svelte";
  import SelectItemPatient from "$lib/components/SelectItem_Patient.svelte";

  let query = $state("");
</script>

<h1>بحث عن مريض</h1>

<Combobox
  bind:query
  endpoint={`/api/v1/patient?q=${query}`}
  placeholder="اسم المريض/رقم الملف/ رقم الهوية"
>
  {#snippet itemSnippet(patient: PatientT)}
    <SelectItemPatient {patient} {query} href={`/patient/${patient.id}`} />
  {/snippet}
</Combobox>
