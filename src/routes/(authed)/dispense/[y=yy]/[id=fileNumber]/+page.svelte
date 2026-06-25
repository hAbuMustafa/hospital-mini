<script lang="ts">
  import { page } from "$app/state";
  import { getAge, getTermed } from "$lib/date/utils";
  import { getPatient, registerTicket } from "./ticket.remote";

  const patientRequest = getPatient(`${page.params.y}/${page.params.id}`);
</script>

{#await patientRequest}
  <p>جار سحب بيانات المريض</p>
{:then patient}
  {#if patient}
    <table>
      <tbody>
        <tr>
          <th>
            <a href="/patient/{page.params.y}/{page.params.id}" class="file-number"
              >{patient.id}</a
            >
          </th>
          <td>{patient.name}</td>

          <th>القسم:</th>
          <td>{patient.ward_recent ?? patient.ward_on_admission}</td>

          <th>النوع:</th>
          <td>
            {patient.gender === null
              ? "غير محدد"
              : patient.gender !== false
                ? "ذكر"
                : "أنثى"}
          </td>
        </tr>
        <tr>
          <th>التشخيص:</th>
          <td>{patient.diagnosis}</td>

          <th>السن:</th>
          <td>
            {patient.birthdate
              ? getTermed(getAge(patient.birthdate), "عام", "أعوام")
              : ""}
          </td>

          <th>التأمين الصحي:</th>
          <td>{patient.insured ? "منتفع" : "غير منتفع"}</td>
        </tr>
      </tbody>
    </table>{/if}
{/await}

<style>
  table {
    border-collapse: collapse;
  }

  th,
  td {
    border: var(--main-border);
    padding: 0.25rem 0.5rem;
    max-width: 30ch;
  }

  a.file-number {
    all: unset;
    cursor: pointer;
    border-radius: 4px;
    text-decoration: underline dashed 2px var(--main-accent-color);

    &:hover,
    &:focus {
      background-color: var(--main-accent-color);
    }
  }
</style>
