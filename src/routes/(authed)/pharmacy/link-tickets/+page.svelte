<script lang="ts">
  import Combobox from "$lib/components/Combobox.svelte";
  import SelectItemPatient from "$lib/components/SelectItem_Patient.svelte";
  import { toast } from "svelte-sonner";
  import { getUnlinkedTickets, linkTickets } from "../ticket.remote";
  import { page } from "$app/state";

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
        success: "تم ربط تذاكر الصرف",
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
      <hr />
    {/if}
    <input {...linkTickets.fields.link_to_id.as("hidden", selectedId)} readonly />
    {#if !selectedId}
      <Combobox
        bind:query={patientQuery}
        endpoint={`/api/v1/patient?q=${patientQuery}`}
        placeholder="بحث عن مريض"
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

    <h2>أسماء المرضى على التذاكر</h2>
    <ul>
      {#each unlinked.patientNames as patientName, i (i)}
        <li>
          <label>
            <input
              bind:group={selectedNames}
              {...linkTickets.fields.patient_names.as("checkbox", patientName!)}
            />
            {patientName}
          </label>
          <ul class="ticket-numbers">
            {#each unlinked.tickets.filter((t) => t.patient_id === patientName) as ticket, j (ticket.id)}
              <li>
                <a href="/pharmacy/ticket/{ticket.id}">{ticket.id}</a>
              </li>
            {/each}
            <li>
              <a href="/dispense/{THIS_YEAR}/0?patient_name={patientName}" class="btn">
                جديد
              </a>
            </li>
          </ul>
        </li>
      {/each}
    </ul>

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

  ul {
    list-style: none;
    padding-inline: 0;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  li > .ticket-numbers {
    display: flex;
    gap: 1ch;
    flex-wrap: wrap;

    li:not(:last-of-type)::after {
      content: "،";
    }
  }

  li > .btn {
    --bg: green;
    font-size: 1em;
    font-weight: normal;
    padding: 0.1rem 0.4rem;
  }

  input[type="submit"] {
    width: 100%;
  }
</style>
