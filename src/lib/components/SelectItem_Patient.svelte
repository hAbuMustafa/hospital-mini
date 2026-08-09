<script lang="ts">
  import { goto } from "$app/navigation";
  import { formatDate } from "$lib/date/utils";
  import Highlight from "./Highlight.svelte";

  type PropsT = {
    patient: PatientT;
    query: string;
    href: string;
  };

  let { patient, query, href }: PropsT = $props();
</script>

<button
  class="patient-select"
  onclick={() => {
    goto(href);
  }}
>
  <span><Highlight text={patient.id} {query} /></span>
  <strong><Highlight text={patient.name!} {query} /></strong>
  <span>
    من <span class="date">{formatDate(patient.admission_date, "YYYY/MM/DD")}</span>
    {#if patient.discharge_date}
      إلى <span class="date">{formatDate(patient.discharge_date, "YYYY/MM/DD")}</span>
    {/if}
  </span>
  {#if patient.id_number}
    <span>{patient.id_type}: <Highlight text={patient.id_number!} {query} /></span>
  {/if}
</button>

<style>
  button.patient-select {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border: none;

    & > span > span.date {
      border: var(--main-border);
      padding-inline: 0.25rem;
      border-radius: 4px;
    }

    &:focus {
      border: 3px double var(--main-accent-color);
      outline: none;
    }
  }
</style>
