<script lang="ts">
  import Combobox from "$lib/components/Combobox.svelte";
  import SelectItemPatient from "$lib/components/SelectItem_Patient.svelte";
  import { toast } from "svelte-sonner";
  import { getUnlinkedTickets, linkTickets } from "../ticket.remote";
  import { page } from "$app/state";
  import TicketNumber from "$lib/components/TicketNumber.svelte";
  import { queryPatient } from "../../query.remote";

  let unlinked = $derived(await getUnlinkedTickets());

  let selectedId = $state("");
  let selectedPatientName = $state("");

  let selectedNames = $state([]);

  let patientQuery = $state("");

  const THIS_YEAR = new Date().getFullYear() - 2000;
</script>

<h1>{page.data.title}</h1>

{#if unlinked.patientNames}
  <form
    {...linkTickets.enhance(async (form) => {
      const { promise, resolve, reject } = Promise.withResolvers();

      toast.promise(promise, {
        loading: "جار ربط تذاكر الصرف بالملف رقم " + selectedId + "...",
        success: () => {
          selectedId = "";
          selectedPatientName = "";
          return "تم ربط تذاكر الصرف";
        },
        error: () => {
          form.fields.allIssues()?.forEach((issue) => {
            toast.warning(issue.message, { duration: Number.POSITIVE_INFINITY });
          });
          return "حدث خطأ أثناء ربط تذاكر الصرف";
        },
      });

      await form.submit();

      if (form.fields.allIssues()?.length) {
        reject();
      } else {
        resolve(true);
      }
    })}
  >
    <input {...linkTickets.fields.link_to_id.as("hidden", selectedId)} readonly />

    <h2>أسماء المرضى على التذاكر</h2>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>الاسم على التذكرة</th>
          <th>التذاكر المرتبطة</th>
          <th>تذكرة جديدة بنفس الاسم</th>
        </tr>
      </thead>
      <tbody>
        {#each unlinked.patientNames as patientName, i (i)}
          <tr>
            <td>
              <input
                id="name-{i}"
                bind:group={selectedNames}
                {...linkTickets.fields.patient_names.as("checkbox", patientName!)}
              />
            </td>
            <td>
              <label for="name-{i}">
                {patientName}
              </label>
            </td>
            <td>
              <ul class="ticket-numbers">
                {#each unlinked.tickets.filter((t) => t.patient_id === patientName) as ticket, j (ticket.id)}
                  <li>
                    <TicketNumber number={ticket.id} />
                  </li>
                {/each}
              </ul>
            </td>
            <td>
              <a href="/dispense/{THIS_YEAR}/0?patient_name={patientName}" class="btn">
                صرف
              </a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if selectedId}
      <button
        type="button"
        class="selected-patient"
        onclick={() => {
          selectedId = "";
          selectedPatientName = "";
        }}
      >
        {selectedId}
        {selectedPatientName}
      </button>
    {:else}
      <Combobox
        bind:query={patientQuery}
        endpoint={queryPatient}
        placeholder="ربط التذاكر المختارة بالمريض"
      >
        {#snippet itemSnippet(patient: PatientT)}
          <SelectItemPatient
            {patient}
            query={patientQuery}
            onSelect={() => {
              selectedId = patient.id;
              selectedPatientName = patient.name!;
            }}
          />
        {/snippet}
      </Combobox>
    {/if}

    <input
      type="submit"
      class="btn"
      value="حفظ"
      disabled={!selectedId || !selectedNames.length}
    />
  </form>
{:else}
  <p>لا يوجد لديك تذاكر تحتاج لربط 🎉🥳</p>
{/if}

<style>
  .selected-patient {
    background-color: gold;
    color: black;
    width: 100%;
    padding: 0.25rem 0.5rem;
    font-size: 1.25rem;
  }

  form {
    display: grid;
    gap: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    border: var(--main-border);
  }

  th {
    width: min-content;
  }

  ul {
    list-style: none;
    padding-inline: 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  ul.ticket-numbers {
    display: flex;
    flex-direction: row;
    gap: 1ch;
    flex-wrap: nowrap;

    li:not(:last-of-type)::after {
      content: "،";
    }
  }

  td > .btn {
    --bg: green;
    font-size: 1em;
    font-weight: normal;
    padding: 0.1rem 0.4rem;
  }

  input[type="submit"] {
    width: 100%;
  }
</style>
