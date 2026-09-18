<script lang="ts">
  import Combobox from "$lib/components/Combobox.svelte";
  import SelectItemPatient from "$lib/components/SelectItem_Patient.svelte";
  import { toast } from "svelte-sonner";
  import { getUnlinkedTickets, linkTickets } from "../ticket.remote";

  let unlinkedTickets = $derived(await getUnlinkedTickets());

  let selectedId = $state("");
  let selectedPatientName = $state("");

  let selectedNames = $state([]);

  let patientQuery = $state("");

  const THIS_YEAR = new Date().getFullYear() - 2000;
</script>

{#if unlinkedTickets.length}
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
        onclick={() => {
          selectedId = "";
          selectedPatientName = "";
        }}
      >
        {selectedId}
        {selectedPatientName}
      </button>
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
    <ul>
      {#each unlinkedTickets as ticket, i (ticket.name)}
        <li>
          <label>
            <input
              bind:group={selectedNames}
              {...linkTickets.fields.patient_names.as("checkbox", ticket.name!)}
            />
            {ticket.name}
          </label>
          <a href="/dispense/{THIS_YEAR}/0?patient_name={ticket.name}" class="btn">
            صرف جديد بنفس الاسم
          </a>
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
  ul {
    list-style: none;
  }

  li {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  li > .btn {
    --bg: green;
    font-size: 1em;
    font-weight: normal;
    padding: 0.1rem;
  }

  input[type="submit"] {
    width: 100%;
  }
</style>
