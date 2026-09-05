<script lang="ts">
  import { page } from "$app/state";
  import { formatDate, getAge, getTermed } from "$lib/date/utils";
  import { toast } from "svelte-sonner";
  import Combobox from "$lib/components/Combobox.svelte";
  import { scale } from "svelte/transition";
  import { useKeyboardNavigation } from "$lib/attachments";
  import SelectItemDrug from "$lib/components/SelectItem_Drug.svelte";
  import TopPicks from "$lib/components/Dispense/TopPicks.svelte";
  import { countryMap, getFlagEmoji } from "$lib/utils/countries";
  import Female from "@lucide/svelte/icons/venus";
  import Male from "@lucide/svelte/icons/mars";
  import Lock from "@lucide/svelte/icons/lock-keyhole-open";
  import Save from "@lucide/svelte/icons/save";
  import {
    getInvoiceMetadata,
    getInvoiceExtraItems,
    getPeriodExtraItems,
    addInvoiceExtraItem,
    updateInvoiceExtraItem,
    updateInvoiceExtraItemAmount,
    deleteInvoiceExtraItem,
    closeInvoice,
  } from "../../invoice.remote";
  import { goto } from "$app/navigation";

  const invoice = $derived(await getInvoiceMetadata(Number(page.params.invoiceNumber)));

  const invoiceItemsGetter = $derived(getInvoiceExtraItems(invoice.id));

  let invoiceItems = $derived(await invoiceItemsGetter);

  const patient = $derived(invoice.patient);

  let periodItems = $derived(
    await getPeriodExtraItems({
      patientId: patient.id,
      from: invoice.from,
      to: invoice.to,
    })
  );

  let invoiceItemsBody: HTMLElement | undefined = $state();

  async function selectDrug(item: DrugT) {
    const foundItem = invoiceItems.find((d) => d.item_id === item.id);

    if (!foundItem) {
      toast.promise(
        addInvoiceExtraItem({
          drugId: item.id,
          invoiceId: invoice.id,
          drugUnitPrice: item.price_resale!,
        }),
        {
          loading: "جار إضافة الصنف للفاتورة...",
          error: "حدث خطأ ما أثناء إضافة الصنف للفاتورة",
        }
      );
    } else {
      const newQty = (updatesToSave[foundItem.id] ?? foundItem.qty) + 1;

      updatesToSave[foundItem.id] = newQty;

      toast.info("الصنف موجود بالفاتورة مسبقا، تم تعديل الكمية لتصبح " + newQty);
    }
  }

  function getDate(date: Date) {
    return formatDate(date, "YYYY/MM/DD (hh:mm:ss A)")
      .replace("AM", "ص")
      .replace("PM", "م")
      .replace(" (12:00:00 ص)", "")
      .replace(" (11:59:59 م)", "");
  }

  let drugQuery = $state("");

  const updatesToSave: Record<number, number> = $state({ 1: 1 });
</script>

<div class="patient_data" class:insured={patient.insured}>
  <h1>
    {#if typeof patient.gender === "boolean"}
      <span class="patient_gender">
        {#if patient.gender !== false}
          <Male color="royalblue" />
        {:else}
          <Female color="pink"></Female>
        {/if}
      </span>
    {/if}
    <span class="invoice-marker">فاتورة</span>
    <span class="patient_name pii">
      <a href="/patient/{patient.id}" class="patient_link">
        {patient.name}
      </a>
    </span>
    {#if patient.birthdate}
      <span class="patient_age">
        ({patient.birthdate ? getTermed(getAge(patient.birthdate), "عام", "أعوام") : ""})
      </span>
    {/if}
    {#if patient.nationality !== "EG"}
      <span class="patient_nationality flag" title={countryMap.get(patient.nationality)}>
        {getFlagEmoji(patient.nationality)}
      </span>
    {/if}
  </h1>

  <h2>
    {invoice.period_ward}
  </h2>
  <h2>
    من
    <span class="invoice-marker">
      {getDate(invoice.from)}
    </span>
    إلى
    <span class="invoice-marker">
      {getDate(invoice.to)}
    </span>
  </h2>

  <div class="diagnoses">
    {#each patient.diagnosis?.split(" + ") as diagnosis, i (i)}
      <span class="diagnosis">{diagnosis}</span>
    {/each}
  </div>
</div>

{#if !invoice.is_closed}
  <div class="item-controls-wrapper">
    <Combobox
      bind:query={drugQuery}
      endpoint="/api/v1/drug?q={encodeURIComponent(drugQuery.replaceAll('%', '%'))}"
      placeholder="اسم الصنف (مثلا: بالميكورت أو أوندانسيترون أو adrenaline)"
      className="hide-in-print"
      onSelect={(drug: DrugT) => selectDrug(drug)}
    >
      {#snippet itemSnippet(drug: DrugT)}
        <SelectItemDrug
          {drug}
          query={drugQuery}
          isSelected={invoiceItems.findIndex((item) => item.item_id === drug.id) > -1}
          onclick={() => selectDrug(drug)}
        />
      {/snippet}
    </Combobox>

    <TopPicks onSelect={selectDrug} />
  </div>
{:else}
  <p class="error message">فاتورة مغلقة</p>
{/if}

<table class="invoice-items">
  <colgroup>
    <col />
    <col class="item-name-column" />
    <col class="num-input-column" />
    <col />
  </colgroup>
  <thead>
    <tr>
      <th>م</th>
      <th>اسم الصنف</th>
      <th>الكمية</th>
      <th>أضافه</th>
    </tr>
  </thead>
  {#if invoiceItems.length}
    <tbody bind:this={invoiceItemsBody}>
      {#each invoiceItems as item, i (item.id)}
        <tr transition:scale>
          <td>
            {#if !invoice.is_closed}
              <button
                type="button"
                onclick={async () => {
                  await deleteInvoiceExtraItem({
                    invoiceId: invoice.id,
                    itemId: item.id,
                  });
                }}
                class="delete-item"
              >
                {i + 1}
              </button>
            {:else}
              {i + 1}
            {/if}
          </td>
          <td>
            <label for="amount-{item.id}" title={item.item_tradename}>
              {item.item_name}
            </label>
          </td>
          <td>
            {#if !invoice.is_closed}
              <form {...updateInvoiceExtraItem.for(item.id)}>
                <input
                  {...updateInvoiceExtraItem
                    .for(item.id)
                    .fields.invoiceId.as("hidden", invoice.id)}
                />
                <input
                  {...updateInvoiceExtraItem
                    .for(item.id)
                    .fields.itemId.as("hidden", item.id)}
                />
                <input
                  id="amount-{item.id}"
                  min="1"
                  type="number"
                  class:unsaved-changes={updatesToSave[item.id]
                    ? updatesToSave[item.id] !== item.qty
                    : false}
                  {...updateInvoiceExtraItem.for(item.id).fields.amount}
                  bind:value={
                    () => updatesToSave[item.id] ?? item.qty,
                    (v) => {
                      updatesToSave[item.id] = v;
                    }
                  }
                  {@attach useKeyboardNavigation("amount", invoiceItemsBody)}
                />
              </form>
            {:else}
              {item.qty}
            {/if}
          </td>
          <td>{item.user_name}</td>
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

{#if !invoice.is_closed}
  <button
    type="button"
    class="btn"
    onclick={async () => {
      const { promise, resolve, reject } = Promise.withResolvers();

      toast.promise(promise, {
        loading: "جار حفظ الفاتورة...",
        success: () => {
          getInvoiceMetadata(invoice.id).refresh();
          goto(`/invoice/print/${invoice.id}`);
          return "تم حفظ وغلق الفاتورة";
        },
        error: "حدث خطأ أثناء غلق الفاتورة",
      });

      try {
        if (Object.entries(updatesToSave).length) {
          for (const [id, qty] of Object.entries(updatesToSave).map(([k, v]) => [
            Number(k),
            v,
          ])) {
            if (invoiceItems.find((item) => item.id === id)?.qty !== qty) {
              await updateInvoiceExtraItemAmount({
                invoiceId: invoice.id,
                itemId: id,
                amount: qty,
              });
            }
          }
        }

        await closeInvoice(invoice.id);

        resolve(1);
      } catch (err) {
        reject();
      }
    }}
  >
    <Save size="1em" color="salmon" />
    <Lock size="1em" color="gold" />
    حفظ وقفل الفاتورة
  </button>
{/if}

<h2>أصناف ستضاف تلقائيا على الفاتورة</h2>

{#if periodItems.length}
  <table>
    <thead>
      <tr>
        <th>م</th>
        <th>اسم الصنف</th>
        <th>الكمية</th>
        <th>القيمة</th>
      </tr>
    </thead>
    <tbody>
      {#each periodItems as item, i (item.id)}
        <tr>
          <td>{i + 1}</td>
          <td>{item.name}</td>
          <td>{item.amount}</td>
          <td>{item.total}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>
    لا توجد تذاكر مصروفة للمريض خلال الفترة من {formatDate(invoice.from, "YYYY/MM/DD")} إلى
    {formatDate(invoice.to, "YYYY/MM/DD")}
  </p>
{/if}

<style>
  .patient_data {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin-block-end: 1rem;

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

  .invoice-marker {
    background-color: var(--main-text-color);
    color: var(--main-bg-color);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
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

  .item-controls-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;

    margin-block-end: 1rem;
  }

  table {
    col.item-name-column {
      width: 25vw;
    }

    col.num-input-column {
      width: 8vw;
    }

    th,
    td {
      border: var(--main-border);
    }

    td {
      padding-inline: 0.5rem;
      &:has(input[type="number"]) {
        padding: 0;

        & form > input[type="number"] {
          box-sizing: border-box;
          width: 100%;
          text-align: center;
        }
      }

      &:has(> .delete-item) {
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
  }

  .btn {
    margin-block: 1rem;
  }

  table + h2,
  h2 + table {
    margin-block-start: 1rem;
  }

  input.unsaved-changes {
    background: orange;
    color: black;
  }
</style>
