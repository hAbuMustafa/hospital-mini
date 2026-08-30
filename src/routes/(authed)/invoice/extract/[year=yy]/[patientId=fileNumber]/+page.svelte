<script lang="ts">
  import { authState } from "$lib/auth-client/auth.svelte";
  import PageBorder from "$lib/components/PageBorder.svelte";
  import {
    formatDate,
    getDuration,
    getTermed,
    getToday,
    setToEndOfDay,
  } from "$lib/date/utils";

  import { scale } from "svelte/transition";
  import { useKeyboardNavigation } from "$lib/attachments";
  import { getDispenses, getPatient } from "../../../invoice.remote";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { encodeObjectToUrl } from "../../../encoding";
  import { PUBLIC_System_Started_Since } from "$env/static/public";
  import { browser } from "$app/env";
  import { isNarcotic } from "$lib/CONSTANTS";

  const today = getToday();
  setToEndOfDay(today);

  const patient = await getPatient(`${page.params.year}/${page.params.patientId}`);

  let fromDate = $derived(patient.admission_date);
  let toDate = $derived(patient.discharge_date ?? new Date());

  let periodSameAsStay = $derived(
    fromDate === patient.admission_date && toDate === patient.discharge_date
  );

  let dispensesGetter = $derived(
    getDispenses({ patientId: patient.id, fromDate, toDate })
  );

  let staleData = $derived(await dispensesGetter);

  let invoiceDrugs: InvoiceDrugT[] = $derived.by(() => {
    const arr: InvoiceDrugT[] = $state([]);

    for (const d of staleData.dispenses) {
      arr.push(d);
    }
    return arr;
  });

  const pricingDuration = $derived(
    getTermed(getDuration(fromDate, toDate) || 1, "يوم", "أيام")
  );

  let pageTitle = $derived.by(() => {
    if (periodSameAsStay) return patient.name;

    return `${patient.name} (من ${formatDate(fromDate)} إلى ${formatDate(toDate)})`;
  });

  let isCashPricing = $state(false);

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
        <td class="pii">{patient.id}</td>

        <th>مدة الإقامة:</th>
        <td>
          {pricingDuration}
        </td>
      </tr>
      <tr>
        <th>اسم المريض:</th>
        <td class="pii">{patient.name}</td>

        <th>{patient.id_type}:</th>
        <td class="pii">{patient.id_number}</td>
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
              type="datetime-local"
              bind:value={
                () => formatDate(fromDate, "YYYY-MM-DDThh:mm:ss"),
                (v) => {
                  const newDate = new Date(v);
                  if (
                    !isNaN(newDate.getTime()) &&
                    newDate >= patient.admission_date &&
                    newDate <= (patient.discharge_date ?? today)
                  ) {
                    fromDate = new Date(v);
                  }
                }
              }
              min={formatDate(patient.admission_date, "YYYY-MM-DDThh:mm:ss")}
              max={formatDate(patient.discharge_date ?? today, "YYYY-MM-DDThh:mm:ss")}
              step="1"
            />
            <span class="selected-date">{formatDate(fromDate)}</span>
          </td>
          <th>إلى:</th>
          <td>
            <input
              type="datetime-local"
              bind:value={
                () => formatDate(toDate, "YYYY-MM-DDThh:mm:ss"),
                (v) => {
                  const newDate = new Date(v);
                  if (
                    !isNaN(newDate.getTime()) &&
                    newDate >= fromDate &&
                    newDate <= (patient.discharge_date ?? today)
                  ) {
                    fromDate = new Date(v);
                  }
                }
              }
              min={formatDate(fromDate, "YYYY-MM-DDThh:mm:ss")}
              max={formatDate(patient.discharge_date ?? today, "YYYY-MM-DDThh:mm:ss")}
              step="1"
            />
            <span class="selected-date">{formatDate(toDate)}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  {#if new Date(PUBLIC_System_Started_Since) > fromDate}
    <div class="warning hide-in-print">
      {periodSameAsStay ? "المريض دخل" : "فترة التسعير تبدأ"} في فترة تسبق بداية تشغيل المنظومة،
      برجاء استخراج فاتورة يدوية
    </div>
  {/if}

  <h2>
    سداد فاتورة {#if isCashPricing}نقدي{/if}
    <button
      class="btn hide-in-print"
      onclick={() => {
        if (browser)
          goto(
            `/invoice/create/${patient.id}?items=${encodeObjectToUrl(invoiceDrugs.filter((item) => !isNarcotic(item as { category: string })))}`
          );
      }}>استخراج فاتورة يدوية</button
    >
  </h2>
</header>

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
      {#each invoiceDrugs as drug, i (drug.id!)}
        <tr class:hide-in-print={drug.total === 0} transition:scale>
          <td>{i + 1}</td>
          {#if !patient.insured}
            <td>{drug.smc_code}</td>
          {/if}
          <td>{drug.name_ar}</td>
          <td>{drug.amount}</td>
          <td>
            {#if isCashPricing}
              <input
                type="number"
                name="price-{drug.id}"
                id="price-{drug.id}"
                min="0"
                step="0.01"
                bind:value={
                  () => drug.cashPrice ?? 0,
                  (v) => {
                    drug.cashPrice = v;
                  }
                }
                {@attach useKeyboardNavigation("price", invoiceItemsBody)}
              />
            {:else}{drug.price_resale?.toFixed(2)}{/if}</td
          >
          <td>
            {#if !isCashPricing}
              {drug.total.toFixed(2)}
            {:else}
              {((drug.cashPrice ?? 0) * drug.amount).toFixed(2)}
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
              if (!isCashPricing) {
                return acc + curr.total;
              } else {
                return acc + (curr.cashPrice ?? 0) * curr.amount;
              }
            }, 0)
            .toFixed(2)}
        </td>
      </tr>
      <tr>
        <td colspan="7">
          <dl class="signatures">
            <dt>مشرف القسم</dt>
            <dt>طبيب صيدلي</dt>
            <dt>مدير الرعاية</dt>
            <dt>يعتمد،<br />مدير المستشفى/</dt>

            <dd></dd>
            <dd>{authState.user?.name}</dd>
            <dd></dd>
            <dd></dd>
          </dl>
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

      input[type="datetime-local"] {
        width: 80%;
        text-align: center;
        font-size: inherit;
      }

      span.selected-date {
        display: none;
      }

      @media print {
        input[type="datetime-local"] {
          display: none;
        }

        span.selected-date {
          display: inline-block;
        }
      }
    }
  }

  h2 {
    margin-block-end: 0.5rem;
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

        &::before {
          content: "";
          display: block;
          height: 2rem;
          line-height: 0;
          font-size: 0;
          visibility: hidden;
          margin-bottom: 0;
        }
      }
    }

    tbody {
      @media print {
        tr {
          page-break-inside: avoid;
        }

        tr:nth-of-type(20),
        tr:nth-of-type(35n + 20) {
          page-break-after: always;
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
                margin: 2px 4px;
                width: 90%;

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

      tr {
        &:has(.signatures) td {
          border: none;
        }

        .signatures {
          display: none;
          margin-top: 1rem;
          width: 80vw;
          border: none;
          font-size: 1rem;

          dt {
            font-weight: bold;
          }

          dd {
            font-weight: normal;
            margin: 0;
          }

          @media print {
            display: grid;
            grid-template: repeat(4, 1fr) / repeat(4, 1fr);
            align-items: center;
            text-align: center;
          }
        }
      }
    }
  }

  @media print {
    @page {
      margin-bottom: 1.5cm;
      size: a4 portrait;
      margin-top: 1.5cm;

      @bottom-left {
        content: "صفحة " counter(page) " من " counter(pages);
        vertical-align: top;
      }
    }
  }

  .warning {
    background-color: light-dark(maroon, salmon);
    border: 1px solid light-dark(red, maroon);
    color: var(--main-bg-color);
    text-align: center;
    border-radius: 8px;
    margin: 1rem 0;
    padding: 0.5rem;
  }
</style>
