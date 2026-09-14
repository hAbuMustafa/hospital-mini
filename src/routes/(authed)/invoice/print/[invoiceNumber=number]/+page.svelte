<script lang="ts">
  import PageBorder from "$lib/components/PageBorder.svelte";
  import { formatDate, getDuration, getTermed } from "$lib/date/utils";

  import { getInvoice } from "../../invoice.remote";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { browser } from "$app/env";

  const invoice = await getInvoice(Number(page.params.invoiceNumber));

  const patient = $derived(invoice.patient);

  let periodSameAsStay = $derived(
    invoice.from.getTime() === patient.admission_date.getTime() &&
      invoice.to.getTime() === patient.discharge_date?.getTime()
  );

  let invoiceDrugs = $derived(invoice.items);

  const pricingDuration = $derived(
    getTermed(getDuration(invoice.from, invoice.to) || 1, "يوم", "أيام")
  );

  let pageTitle = $derived.by(() => {
    if (periodSameAsStay) return patient.name;

    return `${patient.name} (من ${formatDate(invoice.from)} إلى ${formatDate(invoice.to)})`;
  });

  onMount(() => {
    if (browser && invoice.is_closed && !invoice.is_cancelled) {
      window.print();
    }
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<header class:hide-in-print={!invoice.is_closed || invoice.is_cancelled}>
  <h1 data-invoice-number={invoice.id}>فاتورة أدوية</h1>

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
        <td>{invoice.period_ward}</td>

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
            <span class="selected-date">{formatDate(invoice.from)}</span>
          </td>
          <th>إلى:</th>
          <td>
            <span class="selected-date">{formatDate(invoice.to)}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>سداد فاتورة</h2>
</header>

<table
  class="invoice-items"
  class:hide-in-print={!invoice.is_closed || invoice.is_cancelled}
>
  <colgroup>
    <col />
    {#if !patient.insured}
      <col class="num-column" />
    {/if}
    <col />
    <col class="num-column" />
    <col class="num-column" />
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
    <tbody>
      {#each invoiceDrugs as drug, i (drug.id!)}
        <tr class:hide-in-print={drug.total === 0}>
          <td>{i + 1}</td>
          {#if !patient.insured}
            <td>{drug.smc_code}</td>
          {/if}
          <td>{drug.name_ar}</td>
          <td>{drug.amount}</td>
          <td>
            {drug.unit_price?.toFixed(2)}
          </td>
          <td>
            {drug.total.toFixed(2)}
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th colspan="3">إجمالي قيمة الأدوية المنصرفة:</th>
        <td colspan="3">
          {invoice.grandTotal.toFixed(2)}
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
            <dd>
              {invoice.username}
            </dd>
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

{#if !invoice.is_closed}
  <p class="error message">
    لا يمكن طباعة الفاتورة حيث أنها لا تزال مفتوحة لإضافة أصناف إليها، بما أن فترة التسعير
    تبدأ قبل بدء تشغيل المنظومة
  </p>
{/if}

{#if invoice.is_cancelled}
  <p class="error message">الفاتورة لاغية. لا يمكن طباعتها</p>
{/if}

<PageBorder />

<style>
  h1 {
    position: relative;

    &::after {
      content: "#" attr(data-invoice-number);
      color: gray;
      font-size: 0.75em;
      position: absolute;
      inset-inline-start: 90%;
    }
  }

  table {
    td {
      text-align: center;
    }

    thead {
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

  .pricing-range {
    margin-block-start: 1rem;

    table {
      width: 100%;
      border-collapse: collapse;

      th,
      td {
        border: var(--main-border);
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

    .num-column {
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
        }

        tr:nth-of-type(20),
        tr:nth-of-type(35n + 20) {
          page-break-after: always;
        }

        td {
          page-break-inside: avoid;
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
          display: grid;
          grid-template: repeat(4, 1fr) / repeat(4, 1fr);
          align-items: center;
          text-align: center;
          margin-top: 1rem;
          width: 100%;
          border: none;
          font-size: 1rem;

          dt {
            font-weight: bold;
          }

          dd {
            font-weight: normal;
            margin: 0;
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
</style>
