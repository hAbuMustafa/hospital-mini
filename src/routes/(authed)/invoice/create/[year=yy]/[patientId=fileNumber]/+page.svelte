<script lang="ts">
  import { page } from "$app/state";
  import { formatDate } from "$lib/date/utils";
  import { getPatient } from "../../../invoice.remote";

  const patientGetter = getPatient([page.params.year, page.params.patientId].join("/"));

  const patient = await patientGetter;

  let from = $state(0);
  let to = $state(0);

  let lastTransferIndex = patient.transfers.length - 1;

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
              () => from <= i && to >= i,
              (v) => {
                if (v === true) {
                  if (i >= to) {
                    to = i;
                  } else {
                    from = i;
                  }
                } else if (v === false) {
                  if (i > from) {
                    if (i < lastTransferIndex) {
                      from = i + 1;
                    } else {
                      from = i;
                    }
                  } else {
                    if (i > 0) {
                      to = i - 1;
                    } else {
                      to = i;
                    }
                  }
                }
              }
            }
          />
        </td>
        <td>{stay.to_ward}</td>
        <td class:from={i === from}>{getDate(stay.timestamp)}</td>
        <td class:to={i === to}>
          {#if i === lastTransferIndex}
            {#if patient.discharge_date}
              {getDate(patient.discharge_date)}
            {:else}
              الآن
            {/if}
          {:else}
            {getDate(patient.transfers[i + 1]?.timestamp)}
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<p>
  تسعير من <span class="from">{getDate(patient.transfers[from].timestamp)}</span> إلى
  <span class="to">
    {#if to < lastTransferIndex}
      {getDate(patient.transfers[to + 1].timestamp)}
    {:else if patient.discharge_date}{getDate(patient.discharge_date)}{:else}الآن{/if}
  </span>
</p>

<style>
  table {
    border-collapse: collapse;
  }

  th,
  td {
    border: var(--main-border);

    padding: 0.25rem 0.5rem;
  }

  span.from,
  span.to {
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
  }

  .from {
    background-color: hsla(from green h s l / 0.5);
  }

  .to {
    background-color: hsla(from red h s l / 0.5);
  }
</style>
