<script lang="ts">
  import { goto } from "$app/navigation";
  import { formatDate } from "$lib/date/utils";
  import Highlight from "./Highlight.svelte";

  type PropsT = {
    patient: PatientT;
    query: string;
    href?: string;
    onSelect?: Function;
  };

  let { patient, query, href, onSelect }: PropsT = $props();
</script>

<button
  type="button"
  class="patient-select"
  onclick={() => {
    if (href) {
      goto(href);
    } else if (onSelect) {
      onSelect();
    }
  }}
>
  <span class="pii"><Highlight text={patient.id} {query} /></span>
  <strong class="pii"><Highlight text={patient.name!} {query} /></strong>
  <span>
    من <span class="date">{formatDate(patient.admission_date, "YYYY/MM/DD")}</span>
    {#if patient.discharge_date}
      إلى <span class="date">{formatDate(patient.discharge_date, "YYYY/MM/DD")}</span>
    {/if}
  </span>
  {#if patient.id_number}
    <span>
      <span class="id-type">{patient.id_type}:</span>
      <span class="id-number pii">
        <Highlight text={patient.id_number!} {query} />
      </span>
    </span>
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
