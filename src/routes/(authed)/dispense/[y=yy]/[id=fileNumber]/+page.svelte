<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { formatDate, getAge, getTermed } from "$lib/date/utils";
  import { toast } from "svelte-sonner";
  import {
    getItemLastDispensed,
    getPatient,
    postTicket,
  } from "../../../pharmacy/ticket.remote";
  import { onMount } from "svelte";
  import Combobox from "$lib/components/Combobox.svelte";
  import { scale } from "svelte/transition";
  import { useKeyboardNavigation } from "$lib/attachments";
  import { unacceptedAmount } from "$lib/CONSTANTS";
  import SelectItemDrug from "$lib/components/SelectItem_Drug.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import TopPicks from "$lib/components/Dispense/TopPicks.svelte";
  import { countryMap, getFlagEmoji } from "$lib/utils/countries";

  const patient = await getPatient(`${page.params.y}/${page.params.id}`);

  const isRegisteredPatient = "name" in patient;

  const getLastDispensed = async (itemId: number) =>
    await getItemLastDispensed({ patientId: patient.id, itemId });

  onMount(() => {
    if (isRegisteredPatient && patient?.discharge_date !== null) {
      goto("/patient");

      toast.error(
        `لا يمكنك الصرف لمريض غير مقيم بالمستشفى.\nالمريض ${patient?.name} خرج يوم ${formatDate(patient?.discharge_date!, "YYYY/MM/DD الساعة HH:mm")}`
      );
    }
  });

  let ticketItemsBody: HTMLElement | undefined = $state();

  let ticketDrugs: (DrugT & {
    amount: number;
    lastDispensed: Awaited<ReturnType<typeof getItemLastDispensed>> | null;
  })[] = $state([]);

  async function selectDrug(item: DrugT) {
    const foundItemIndexInList = ticketDrugs.findIndex((d) => d.id === item.id);
    if (foundItemIndexInList > -1) {
      ticketDrugs[foundItemIndexInList].amount++;
      toast.info(
        `الصنف مضاف سابقا في السطر ${foundItemIndexInList + 1} تم زيادة الكمية لتصبح ${ticketDrugs[foundItemIndexInList].amount}`
      );
      return;
    }

    ticketDrugs.push({
      ...item,
      amount: 1,
      lastDispensed: await getLastDispensed(item.id),
    });
  }

  let drugQuery = $state("");

  let saving = $state(false);
</script>

{#if patient}
  <div class="patient_data" class:insured={isRegisteredPatient && patient.insured}>
    <h1>
      {#if isRegisteredPatient}
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
        {#if patient.nationality !== "EG"}
          <span
            class="patient_nationality flag"
            title={countryMap.get(patient.nationality)}
          >
            {getFlagEmoji(patient.nationality)}
          </span>
        {/if}
      {:else}
        <span class="not-yet-registered">مريض غير مسجل بعد</span>
      {/if}
    </h1>

    <h2>
      {#if isRegisteredPatient}
        {patient.ward_recent ?? patient.ward_on_admission}
      {:else}
        <span class="not-yet-registered">قسم غير محدد</span>
      {/if}
    </h2>

    <div class="diagnoses">
      {#if isRegisteredPatient}
        {#each patient.diagnosis?.split(" + ") as diagnosis, i (i)}
          <span class="diagnosis">{diagnosis}</span>
        {/each}
      {:else}
        <span class="diagnoses not-yet-registered">تشخيص غير مسجل</span>
      {/if}
    </div>
  </div>

  <div class="item-controls-wrapper">
    <Combobox
      bind:query={drugQuery}
      filterFn={(d: DrugT) => d.is_used !== "لاغي" && !d.is_used?.includes("فواتير")}
      endpoint="/api/v1/drug?q={encodeURIComponent(drugQuery.replaceAll('%', '%'))}"
      placeholder="اسم الصنف (مثلا: بالميكورت أو أوندانسيترون أو adrenaline)"
      className="hide-in-print"
      onSelect={(drug: DrugT) => selectDrug(drug)}
    >
      {#snippet itemSnippet(drug: DrugT)}
        <SelectItemDrug
          {drug}
          query={drugQuery}
          isSelected={ticketDrugs.findIndex((item) => item.id === drug.id) > -1}
          onclick={() => selectDrug(drug as InvoiceSelectedDrugT)}
        />
      {/snippet}
    </Combobox>

    <TopPicks onSelect={selectDrug} />
  </div>

  <form
    {...postTicket.enhance(async (form) => {
      const { promise, resolve, reject } = Promise.withResolvers();

      try {
        saving = true;

        toast.promise(promise, {
          success: (ticketId) => {
            ticketDrugs = [];
            return `تم تسجيل الطلبية بالرقم ${ticketId}`;
          },
          error: () => {
            postTicket.fields.allIssues()?.forEach((issue) => {
              toast.warning(issue.message, { duration: Number.POSITIVE_INFINITY });
            });
            return "لم يتم تسجيل الطلبية. راجع الأخطاء المذكورة.";
          },
          loading: "جار حفظ تذكرة الصرف...",
          duration: 5000,
        });

        await form.submit();

        if (form.result?.success) {
          if (form.result?.message) {
            toast.warning(form.result?.message, { duration: Number.POSITIVE_INFINITY });
          }
          resolve(form.result.ticketId);
        } else {
          reject(form.result?.message);
        }
      } catch (err) {
        toast.error("حدث خطأ غير متوقع أثناء تسجيل الطلبية", {
          duration: Number.POSITIVE_INFINITY,
        });
        console.log(err);
        reject();
      } finally {
        saving = false;
      }
    })}
  >
    <input {...postTicket.fields.patientId.as("hidden", patient.id)} />

    <table class="ticket-items">
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
          <th>آخر صرف</th>
        </tr>
      </thead>
      {#if ticketDrugs.length}
        <tbody bind:this={ticketItemsBody}>
          {#each ticketDrugs as drug, i (drug.id)}
            <tr transition:scale>
              <td>
                <button
                  type="button"
                  onclick={() => {
                    ticketDrugs = ticketDrugs.filter((d) => d.id !== drug.id);
                  }}
                  class="delete-item"
                >
                  {i + 1}
                </button>
              </td>
              <td>
                <input {...postTicket.fields.drugs[i].item_id.as("hidden", drug.id)} />
                <input
                  {...postTicket.fields.drugs[i].item_name.as("hidden", drug.name_ar!)}
                />
                <input
                  {...postTicket.fields.drugs[i].category.as("hidden", drug.category!)}
                />
                <label for="amount-{drug.id}" title={drug.tradename_ar}>
                  {drug.name_ar}
                </label>
                <input
                  {...postTicket.fields.drugs[i].unit_price.as("hidden", drug.price!)}
                />
              </td>
              <td>
                <input
                  id="amount-{drug.id}"
                  {...postTicket.fields.drugs[i].qty.as("number", drug.amount)}
                  min="1"
                  bind:value={drug.amount}
                  {@attach useKeyboardNavigation("amount", ticketItemsBody)}
                />
              </td>
              <td>
                {#if drug.lastDispensed?.length}
                  <button
                    type="button"
                    command="show-modal"
                    commandfor="item-{drug.id}-dialog"
                  >
                    <span class="old-amount">
                      {drug.lastDispensed[0].qty}
                    </span>
                    {drug.unit}
                    <span
                      class="old-amount-time"
                      title={formatDate(drug.lastDispensed[0].timestamp!, "hh:mm A")
                        .replace("AM", "ص")
                        .replace("PM", "م")}
                    >
                      {formatDate(drug.lastDispensed[0].timestamp!, "MM/DD")}
                    </span>
                  </button>

                  <Dialog id="item-{drug.id}-dialog">
                    <h4>{"name" in patient ? patient.name : patient.id}</h4>
                    <h5>{drug.name_ar}</h5>

                    <ul>
                      {#each drug.lastDispensed as dispense, dd (dispense.ticketId)}
                        <li>
                          <span class="old-amount">{dispense.qty}</span>
                          <span class="old-amount-time"
                            >{formatDate(dispense.timestamp!, "YYYY/MM/DD hh:mm:ss A")
                              .replace("AM", "ص")
                              .replace("PM", "م")}</span
                          >
                          <span>(#{dispense.ticketId})</span>
                        </li>
                      {/each}
                    </ul>
                  </Dialog>
                {/if}
              </td>
            </tr>
            {#if postTicket.fields.drugs[i].issues()?.length}
              <tr class="issue" hidden={!unacceptedAmount(drug.id, drug.amount)}>
                <td colspan="6">
                  <ul>
                    {#each postTicket.fields.drugs[i].issues() as issue, issueIdx (issueIdx)}
                      <li>{issue.message}</li>
                    {/each}
                  </ul>
                </td>
              </tr>
            {/if}
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

    {#if ticketDrugs.length}
      <input type="submit" class="btn" value="حفظ الطلبية" disabled={saving} />
    {/if}
  </form>
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

  .not-yet-registered {
    text-decoration: line-through;
    color: light-dark(maroon, salmon);
  }

  .item-controls-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;

    margin-block-end: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

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

          & > input[type="number"] {
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

        span.old-amount {
          display: inline-block;
          background-color: var(--main-text-color);
          color: var(--main-bg-color);
          border-radius: 4px;
          padding: 1px 0.5rem;
          margin-block: 1px;
        }
      }

      tr.issue {
        background-color: maroon;

        ul {
          list-style: none;
          margin: 0;
          padding: 0;
          font-weight: bold;

          li::before {
            content: "⚠️";
            margin-inline-end: 0.5rem;
          }
        }
      }
    }
  }
</style>
