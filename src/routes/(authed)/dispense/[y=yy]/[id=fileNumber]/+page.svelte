<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { formatDate, getAge, getTermed } from "$lib/date/utils";
  import { toast } from "svelte-sonner";
  import { getPatient, postTicket } from "./ticket.remote";
  import { onMount } from "svelte";
  import Combobox from "$lib/components/Combobox.svelte";
  import { scale } from "svelte/transition";
  import { useKeyboardNavigation } from "$lib/attachments";

  const patient = await getPatient(`${page.params.y}/${page.params.id}`);

  onMount(() => {
    if (patient?.discharge_date !== null) {
      goto("/patient");

      toast.error(
        `لا يمكنك الصرف لمريض غير مقيم بالمستشفى.\nالمريض ${patient?.name} خرج يوم ${formatDate(patient?.discharge_date!, "YYYY/MM/DD الساعة HH:mm")}`
      );
    }
  });

  let ticketItemsBody: HTMLElement | undefined = $state();

  let ticketDrugs: (DrugT & { amount: number })[] = $state([]);

  function selectDrug(item: DrugT) {
    const foundItemIndexInList = ticketDrugs.findIndex((d) => d.id === item.id);
    if (foundItemIndexInList > -1) {
      ticketDrugs[foundItemIndexInList].amount++;
      toast.info(
        `الصنف مضاف سابقا في السطر ${foundItemIndexInList + 1} تم زيادة الكمية لتصبح ${ticketDrugs[foundItemIndexInList].amount}`
      );
      return;
    }

    ticketDrugs.push({ ...item, amount: 1 });
  }

  let drugQuery = $state("");
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

  <Combobox
    bind:query={drugQuery}
    filterFn={(d: DrugT) => d.is_used !== "لاغي" && !d.is_used?.includes("فواتير")}
    endpoint={`/api/v1/drug?q=${encodeURIComponent(drugQuery.replaceAll("%", "\\%"))}`}
    placeholder="اسم الصنف (مثلا: بالميكورت أو أوندانسيترون أو adrenaline)"
    className="hide-in-print"
    onSelect={(drug: DrugT) => selectDrug(drug)}
  >
    {#snippet itemSnippet(drug: DrugT)}
      <button type="button" class="drug-select" onclick={() => selectDrug(drug as DrugT)}>
        <strong class="name-ar">{@render markMatches(drug.name_ar!)}</strong>
        <span class="name">{@render markMatches(drug.tradename_ar!)}</span>
        <span class="price">{drug.price_resale?.toFixed(3)} جنيه</span>
      </button>
    {/snippet}
  </Combobox>

  {#snippet markMatches(text: string)}
    {@html text.replaceAll(
      new RegExp(drugQuery.replaceAll(" ", ".*"), "g"),
      (match) => `<mark>${match}</mark>`
    )}
  {/snippet}

  <form {...postTicket}>
    {#if ticketDrugs.length}
      <input {...postTicket.fields.patientId.as("text", patient.id)} />
      {#each ticketDrugs as drug, i (drug.id)}
        <input {...postTicket.fields.drugs[i].item_id.as("hidden", drug.id)} />
        <label for="amount-{drug.id}">{drug.name_ar}</label>
        <input {...postTicket.fields.drugs[i].qty.as("number", drug.amount)} />
        <input {...postTicket.fields.drugs[i].unit_price.as("hidden", drug.price!)} />
      {/each}
    {/if}
  </form>

  <!-- todo: replace table with form -->

  <table class="ticket-items">
    <colgroup>
      <col />
      <col />
      <col class="num-input-column" />
    </colgroup>
    <thead>
      <tr>
        <th>م</th>
        <th>اسم الصنف</th>
        <th>الكمية</th>
      </tr>
    </thead>
    {#if ticketDrugs.length}
      <tbody bind:this={ticketItemsBody}>
        {#each ticketDrugs as drug, i (drug.id)}
          <tr transition:scale>
            <td>
              <button
                onclick={() => {
                  ticketDrugs = ticketDrugs.filter((d) => d.id !== drug.id);
                }}
              >
                {i + 1}
              </button>
            </td>
            <td>{drug.name_ar}</td>
            <td>
              <input
                type="number"
                name="amount-{drug.id}"
                id="amount-{drug.id}"
                min="0"
                bind:value={drug.amount}
                {@attach useKeyboardNavigation("amount", ticketItemsBody)}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    {:else}
      <tbody>
        <tr>
          <td colspan="4">لم يتم إدخال أدوية</td>
        </tr>
      </tbody>
    {/if}
  </table>
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

  button.drug-select {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: none;

    &:focus {
      border: 3px double var(--main-accent-color);
      outline: none;
    }
  }
</style>
