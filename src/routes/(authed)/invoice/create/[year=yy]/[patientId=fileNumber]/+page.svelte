<script lang="ts">
  import { authState } from "$lib/auth-client/auth.svelte";
  import PageBorder from "$lib/components/PageBorder.svelte";
  import Combobox from "$lib/components/Combobox.svelte";
  import {
    formatDate,
    getDuration,
    getTermed,
    getToday,
    setToEndOfDay,
  } from "$lib/date/utils";

  import debounce from "lodash-es/debounce";
  import { toast } from "svelte-sonner";
  import { scale } from "svelte/transition";
  import { narcoticsIds, nonDivisibleBoxes } from "$lib/CONSTANTS";
  import { useKeyboardNavigation } from "$lib/attachments";

  const today = getToday();
  setToEndOfDay(today);

  let { data } = $props();

  const { patient } = $derived(data);
  const stringifiedAdmissionDate = $derived(formatDate(patient.admission_date));
  const stringifiedDischargeDate = $derived(
    patient.discharge_date ? formatDate(patient.discharge_date) : ""
  );

  let fromDateString = $derived(stringifiedAdmissionDate);
  let toDateString = $derived(stringifiedDischargeDate);

  let periodSameAsStay = $derived(
    fromDateString === stringifiedAdmissionDate &&
      toDateString === stringifiedDischargeDate
  );

  const pricingDuration = $derived(
    getTermed(
      getDuration(new Date(fromDateString), new Date(toDateString) || today) || 1,
      "يوم",
      "أيام"
    )
  );

  let staleData = $derived(data.staleData);

  let fromInput: HTMLInputElement;
  let toInput: HTMLInputElement;

  function updateStaleDataOnInput(node: HTMLInputElement) {
    node.addEventListener(
      "change",
      debounce(async () => {
        if (!fromInput.reportValidity() || !toInput.reportValidity()) return;

        staleData = (await fetch(
          `/api/v1/patient/getStaleData?patient_id=${patient.id}&f=${formatDate(fromDateString)}&t=${formatDate(toDateString)}`
        ).then((d) => d.json())) as StaleData;

        if (staleData.narcotics.length) {
          invoiceDrugs
            .filter((n) => typeof n.total === "function")
            .unshift(...staleData.narcotics);
        }
      }, 1000)
    );
  }

  let selectedDrugs: InvoiceSelectedDrugT[] = $state([]);

  let invoiceDrugs: (InvoiceNarcoticDrugT | InvoiceSelectedDrugT)[] = $derived([
    ...staleData.narcotics,
    ...selectedDrugs,
  ]);

  let pageTitle = $derived.by(() => {
    if (periodSameAsStay) return patient.name;

    return `${patient.name} (من ${fromDateString.split("-").reverse().join("-")} إلى ${toDateString.split("-").reverse().join("-")})`;
  });

  let isCashPricing = $state(false);

  function selectDrug(item: InvoiceSelectedDrugT) {
    const foundItemIndexInList = invoiceDrugs.findIndex((d) => d.id === item.id);
    if (foundItemIndexInList > -1) {
      invoiceDrugs[foundItemIndexInList].amount++;
      toast.info(
        `الصنف مضاف سابقا في السطر ${foundItemIndexInList + 1} تم زيادة الكمية لتصبح ${invoiceDrugs[foundItemIndexInList].amount}`
      );
      return;
    }

    item.amount = 1;
    item.total = () =>
      item.amount *
      (isCashPricing && item.editable ? item.cashPrice : (item.price_resale ?? 0));
    item.editable = true;
    item.cashPrice = 0;
    selectedDrugs.push(item);
  }

  let drugQuery = $state("");

  let invoiceItemsBody: HTMLElement | undefined = $state();
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<header>
  <h1>فاتورة أدوية</h1>
  <table class="patient-data">
    <tbody>
      <tr>
        <th>رقم القيد:</th>
        <td>{patient.id}</td>

        <th>مدة الإقامة:</th>
        <td>
          {pricingDuration}
        </td>
      </tr>
      <tr>
        <th>اسم المريض:</th>
        <td>{patient.name}</td>

        <th>{patient.id_type}:</th>
        <td>{patient.id_number}</td>
      </tr>
      <tr>
        <th>القسم:</th>
        <td>{staleData.ward}</td>

        <th>تاريخ الدخول:</th>
        <td>{formatDate(patient.admission_date, "YYYY/MM/DD")}</td>
      </tr>
      <tr>
        <th>التشخيص:</th>
        <td>{patient.diagnosis}</td>

        <th>تاريخ الخروج:</th>
        <td>
          {#if patient.discharge_date}
            {formatDate(patient.discharge_date, "YYYY/MM/DD")}
          {/if}
        </td>
      </tr>
    </tbody>
  </table>
  <fieldset class="pricing-type hide-in-print">
    <legend>نوع المحاسبة</legend>
    <label><input type="radio" bind:group={isCashPricing} value={false} />عادي</label>
    <label><input type="radio" bind:group={isCashPricing} value={true} />نقدي</label>
  </fieldset>
  <div class="pricing-range" class:hide-in-print={periodSameAsStay}>
    <table>
      <thead>
        <tr>
          <th colspan="4">فترة التسعير</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>من:</th>
          <td>
            <input
              type="date"
              bind:value={fromDateString}
              min={stringifiedAdmissionDate}
              max={stringifiedDischargeDate}
              bind:this={fromInput}
              use:updateStaleDataOnInput
            />
            <span class="selected-date">{fromDateString.replaceAll("-", "/")}</span>
          </td>
          <th>إلى:</th>
          <td>
            <input
              type="date"
              bind:value={toDateString}
              min={fromDateString}
              max={stringifiedDischargeDate}
              bind:this={toInput}
              use:updateStaleDataOnInput
            />
            <span class="selected-date">{toDateString.replaceAll("-", "/")}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <h2>
    سداد فاتورة {#if isCashPricing}نقدي{/if}
  </h2>
</header>

<Combobox
  bind:query={drugQuery}
  filterFn={(d: DrugT) =>
    d.is_used !== "لاغي" &&
    !d.is_used?.includes("فواتير") &&
    narcoticsIds.every((id) => id !== d.id)}
  endpoint="/api/v1/drug?q={encodeURIComponent(drugQuery.replaceAll('%', '\\%'))}"
  placeholder="اسم الصنف (مثلا: بالميكورت أو أوندانسيترون أو adrenaline)"
  className="hide-in-print"
  onSelect={(drug: InvoiceSelectedDrugT) => selectDrug(drug)}
>
  {#snippet itemSnippet(drug: DrugT)}
    <button
      type="button"
      class="drug-select"
      class:already-selected={selectedDrugs.findIndex((item) => item.id === drug.id) > -1}
      onclick={() => selectDrug(drug as InvoiceSelectedDrugT)}
    >
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

<table class="invoice-items">
  <colgroup>
    <col />
    {#if !patient.insured}
      <col />
    {/if}
    <col />
    <col class="num-input-column" />
    <col class="num-input-column" />
    <col />
  </colgroup>
  <thead>
    <tr>
      <th>م</th>
      {#if !patient.insured}
        <th>كود النفقة</th>
      {/if}
      <th>اسم الصنف</th>
      <th>الكمية</th>
      <th>سعر الوحدة</th>
      <th>الإجمالي</th>
    </tr>
  </thead>
  {#if invoiceDrugs.length}
    <tbody bind:this={invoiceItemsBody}>
      {#each invoiceDrugs as drug, i (drug.id)}
        <tr
          class:hide-in-print={typeof drug.total === "number"
            ? drug.total === 0
            : drug.total() === 0}
          class:amount-not-allowed={nonDivisibleBoxes
            .map((item) => item.id)
            .some((id) => id === drug.id) &&
            drug.amount % nonDivisibleBoxes.find((item) => item.id === drug.id)?.min! > 0}
          transition:scale
        >
          <td>
            {#if !drug.editable}
              {i + 1}
            {:else}
              <button
                onclick={() => {
                  selectedDrugs = selectedDrugs.filter((d) => d.id !== drug.id);
                }}
              >
                {i + 1}
              </button>
            {/if}
          </td>
          {#if !patient.insured}
            <td>{drug.smc_code}</td>
          {/if}
          <td>{drug.name_ar}</td>
          <td>
            {#if !drug.editable}
              {drug.amount}
            {:else}
              <input
                type="number"
                name="amount-{drug.id}"
                id="amount-{drug.id}"
                min="0"
                bind:value={drug.amount}
                {@attach useKeyboardNavigation("amount", invoiceItemsBody)}
              />
            {/if}
          </td>
          <td
            >{#if isCashPricing && drug.editable}
              <input
                type="number"
                name="price-{drug.id}"
                id="price-{drug.id}"
                min="0"
                step="0.01"
                bind:value={drug.cashPrice}
                {@attach useKeyboardNavigation("price", invoiceItemsBody)}
              />
            {:else}{drug.price_resale?.toFixed(2)}{/if}</td
          >
          <td>
            {#if typeof drug.total === "number"}
              {drug.total.toFixed(2)}
            {:else}
              {drug.total().toFixed(2)}
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th colspan="3">إجمالي الأدوية المنصرفة:</th>
        <td colspan="3">
          {invoiceDrugs
            .reduce((acc, curr) => {
              if (typeof curr.total === "number") {
                return acc + curr.total;
              } else {
                return acc + curr.total();
              }
            }, 0)
            .toFixed(2)}
        </td>
      </tr>
    </tfoot>
  {:else}
    <tbody>
      <tr>
        <td colspan="7">لم يتم إدخال أدوية</td>
      </tr>
    </tbody>
  {/if}
</table>

<table class="signatures">
  <thead>
    <tr>
      <th>مشرف القسم</th>
      <th>طبيب صيدلي</th>
      <th>مدير الرعاية</th>
      <th>يعتمد،<br />مدير المستشفى/</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td></td>
      <td>{authState.user?.name}</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

<PageBorder />

<style>
  table {
    td {
      text-align: center;
    }

    thead {
      background-color: var(--main-table-header-bg-color);
      th {
        padding: 0.25rem 0.75rem;
      }
    }
  }

  table.patient-data {
    th {
      text-align: end;
    }

    td {
      padding-inline: 3vw;
    }
  }

  fieldset.pricing-type {
    display: flex;
    justify-content: space-around;

    margin-block-end: 1rem;
  }

  .pricing-range {
    table {
      width: 100%;
      border-collapse: collapse;

      &,
      th,
      td {
        border: var(--main-border);
      }

      input[type="date"] {
        width: 80%;
        text-align: center;
        font-size: inherit;
      }

      span.selected-date {
        display: none;
      }

      @media print {
        input[type="date"] {
          display: none;
        }

        span.selected-date {
          display: inline-block;
        }
      }
    }
  }

  table.invoice-items {
    border-collapse: collapse;
    max-width: 80vw;

    th,
    td {
      border: var(--main-border);
      padding-inline: 0.75rem;
    }

    .num-input-column {
      width: 8vw;
    }

    thead {
      @media print {
        display: table-header-group;
      }
    }

    tbody {
      @media print {
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        td {
          page-break-inside: avoid;
        }
      }

      tr {
        td {
          &:has(input[type="number"]) {
            padding: 0;

            & > input[type="number"] {
              box-sizing: border-box;
              width: 100%;
              text-align: center;

              @media print {
                appearance: textfield;
                border: none;
                font-size: 1rem;
                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
              }
            }
          }

          &:has(> button) {
            padding: 0;

            & > button {
              all: unset;
              cursor: pointer;
              position: relative;
              width: 100%;

              &:is(:hover, :focus-within)::after {
                content: "❌";
                position: absolute;
                inset: 0;
                padding: 0;
                pointer-events: none;
              }

              &:focus-within {
                outline: 2px double var(--main-accent-color);
              }
            }
          }
        }

        &.amount-not-allowed {
          background-color: salmon;
          text-decoration: line-through;

          @media print {
            background-color: unset;
            text-decoration: unset;
          }
        }
      }
    }

    tfoot {
      th {
        background-color: var(--main-table-header-bg-color);
        text-align: end;
      }

      td {
        font-size: 1.5rem;
        font-weight: bold;
      }

      @media print {
        display: table-row-group; /* to prevent tfoot from repeating at the end of every table on a page */
      }
    }
  }

  table.signatures {
    display: none;
    margin-top: 1rem;
    width: 80vw;

    thead {
      background-color: unset;
    }

    @media print {
      display: table;
    }
  }

  @media print {
    @page {
      margin-bottom: 1.5cm;

      @bottom-left {
        content: "صفحة " counter(page) " من " counter(pages);
        vertical-align: top;
      }
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

    &.already-selected {
      background-color: green;
    }
  }
</style>
