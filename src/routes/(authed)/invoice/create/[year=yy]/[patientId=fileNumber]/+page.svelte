<script lang="ts">
  import { page } from "$app/state";
  import { formatDate } from "$lib/date/utils";
  import { getPatient } from "../../../invoice.remote";

  const patientGetter = getPatient([page.params.year, page.params.patientId].join("/"));

  const patient = await patientGetter;

  let range = $state({ from: 0, to: 0 });

  function getDate(date: Date | null) {
    return formatDate(date!, "YYYY/MM/DD (HH:mm)").replace(" (00:00)", "");
  }
</script>

<h1>{patient.name}</h1>

<table>
  <thead>
    <tr>
      <th></th>
      <th>القسم</th>
      <th>من</th>
      <th>إلى</th>
    </tr>
  </thead>
  <tbody>
    {#each patient.transfers as stay, i (stay.id)}
      <tr>
        <td>
          <input
            type="checkbox"
            name={stay.id + ""}
            id={stay.id + ""}
            bind:checked={
              () => range.from <= i && range.to >= i,
              (v) => {
                console.log(v);
                console.log(range);
              }
            }
          />
        </td>
        <td>{stay.to_ward}</td>
        <td>{getDate(stay.timestamp)}</td>
        <td
          >{#if i === patient.transfers.length - 1}
            {#if patient.discharge_date}
              {getDate(patient.discharge_date)}
            {:else}
              الآن
            {/if}
          {:else}
            {getDate(patient.transfers[i + 1]?.timestamp)}
          {/if}</td
        >
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    border-collapse: collapse;
  }

  th,
  td {
    border: var(--main-border);

    padding: 0.25rem 0.5rem;
  }
</style>
