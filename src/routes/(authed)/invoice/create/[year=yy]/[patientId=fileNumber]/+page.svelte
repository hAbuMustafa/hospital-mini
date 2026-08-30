<script lang="ts">
  import { page } from "$app/state";
  import { PUBLIC_System_Started_Since } from "$env/static/public";
  import { formatDate } from "$lib/date/utils";
  import { createInvoice, getPatientWithTransfers } from "../../../invoice.remote";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";

  const patientGetter = getPatientWithTransfers(
    [page.params.year, page.params.patientId].join("/")
  );

  const patient = await patientGetter;

  let lastTransferIndex = patient.transfers.length - 1;

  let from = $state(0);
  let to = $state(lastTransferIndex);

  let fromDateString = $derived(
    formatDate(patient.transfers[from].timestamp!, "YYYY-MM-DDTHH:mm:ss")
  );
  let toDateString = $derived(
    formatDate(
      to < lastTransferIndex
        ? patient.transfers[to + 1].timestamp!
        : (patient.discharge_date ?? new Date()),
      "YYYY-MM-DDTHH:mm:ss"
    )
  );

  let saving = $state(false);

  function getDate(date: Date | null) {
    return formatDate(date!, "YYYY/MM/DD (HH:mm)")
      .replace(" (00:00)", "")
      .replace(" (23:59)", "");
  }
</script>

<h1 class="pii">{patient.name}</h1>

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
  من <span class="from">{getDate(patient.transfers[from].timestamp)}</span> إلى
  <span class="to">
    {#if to < lastTransferIndex}
      {getDate(patient.transfers[to + 1].timestamp)}
    {:else if patient.discharge_date}{getDate(patient.discharge_date)}{:else}الآن{/if}
  </span>
  <button type="button" class="btn get-period-items" title="معاينة">
    🔍
    <!-- todo: list all items dispensed in the selected range in a modal -->
  </button>
</p>

<form
  {...createInvoice.enhance(async (form) => {
    const { promise, resolve, reject } = Promise.withResolvers();

    try {
      saving = true;

      toast.promise(promise as Promise<typeof form.result>, {
        success: (result) => {
          goto(`/invoice/${result?.addItems ? "patch" : "get"}/${result?.invoiceId}`);
          return `تم إنشاء الفاتورة رقم ${result?.invoiceId}.${result?.addItems ? " يمكنك الآن إضافة أصناف للفاتورة." : ""}`;
        },
        error: () => {
          createInvoice.fields.allIssues()?.forEach((issue) => {
            toast.warning(issue.message, { duration: Number.POSITIVE_INFINITY });
          });
          return "لم يتم إنشاء الفاتورة. راجع الأخطاء المذكورة.";
        },
        loading: "جار إنشاء الفاتورة...",
        duration: 5000,
      });

      await form.submit();

      if (form.result?.success) {
        resolve(form.result);
      } else {
        reject(form.result);
      }
    } catch (err) {
      toast.error("حدث خطأ غير متوقع أثناء إنشاء الفاتورة", {
        duration: Number.POSITIVE_INFINITY,
      });
      console.log(err);
      reject();
    } finally {
      saving = false;
    }
  })}
>
  <input readonly {...createInvoice.fields.patientId.as("hidden", patient.id)} />

  <input
    readonly
    step="1"
    {...createInvoice.fields.fromTimestamp.as("hidden", fromDateString)}
  />

  <input
    readonly
    step="1"
    {...createInvoice.fields.toTimestamp.as("hidden", toDateString)}
  />

  {#if new Date(PUBLIC_System_Started_Since) > patient.transfers[from].timestamp!}
    <label
      title="هذا الاختيار يظهر فقط في حال كانت الفاتورة تبدأ من فترة تسبق فترة تشغيل المنظومة"
    >
      <input {...createInvoice.fields.keepOpen.as("checkbox", true)} />
      إضافة أصناف للفاتورة
    </label>
  {/if}

  <input type="submit" class="btn" value="إنشاء فاتورة" disabled={saving} />
</form>

<!-- todo: list all other invoices for patient -->

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

  form {
    display: grid;
    gap: 1rem;
  }
</style>
