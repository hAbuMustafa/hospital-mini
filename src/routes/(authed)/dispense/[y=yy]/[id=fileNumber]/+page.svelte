<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { formatDate, getAge, getTermed } from "$lib/date/utils";
  import { toast } from "svelte-sonner";
  import { getPatient, postTicket } from "./ticket.remote";
  import { onMount } from "svelte";

  const patient = await getPatient(`${page.params.y}/${page.params.id}`);

  onMount(() => {
    if (patient?.discharge_date !== null) {
      goto("/patient");

      toast.error(
        `لا يمكنك الصرف لمريض غير مقيم بالمستشفى.\nالمريض ${patient?.name} خرج يوم ${formatDate(patient?.discharge_date!, "YYYY/MM/DD الساعة HH:mm")}`
      );
    }
  });
</script>

{#if patient}
  <div class="patient_data" class:insured={patient.insured}>
    <h1>
      {#if typeof patient.gender === "boolean"}
        <span class="patient_gender">
          {patient.gender !== false ? "♂️" : "♀️"}
        </span>
      {/if}
      <span class="patient_name">
        <a href="/patient/{patient.id}" class="patient_link">
          {patient.name}
        </a>
      </span>
      {#if patient.birthdate}
        <span class="patient_age">
          ({patient.birthdate
            ? getTermed(getAge(patient.birthdate), "عام", "أعوام")
            : ""})
        </span>
      {/if}
    </h1>
    <h2>{patient.ward_recent ?? patient.ward_on_admission}</h2>

    <div class="diagnoses">
      {#each patient.diagnosis?.split(" + ") as diagnosis, i (i)}
        <span class="diagnosis">{diagnosis}</span>
      {/each}
    </div>
  </div>
{/if}

<style>
  .patient_data {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;

    position: relative;

    &.insured::after {
      content: "مؤمن عليه";
      font-size: 1rem;
      position: absolute;
      inset-inline-start: 100%;
      inset-block-start: 0;
      rotate: -45deg;
      white-space: nowrap;

      background-color: orange;
      color: contrast-color(orange);
      border-radius: 4px;
      padding: 0.25rem 0.2rem;
    }
  }

  h1,
  h2 {
    margin: 0;
  }

  a.patient_link {
    all: unset;
    cursor: pointer;
    border-radius: 4px;

    &:hover,
    &:focus {
      background-color: var(--main-accent-color);
    }
  }

  .diagnoses {
    display: flex;
    gap: 1rem;

    .diagnosis {
      background-color: var(--main-text-color);
      color: var(--main-bg-color);
      border-radius: 4px;
      padding: 0.25rem 0.2rem;
    }
  }
</style>
