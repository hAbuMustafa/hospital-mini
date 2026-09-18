<script lang="ts">
  import { page } from "$app/state";
  import DateTimeControls from "$lib/components/DateTimeControls.svelte";
  import TicketDisplay from "$lib/components/TicketDisplay.svelte";
  import { formatDate, getMonthArabicName } from "$lib/date/utils";
  import X from "@lucide/svelte/icons/x";
  import { getTickets } from "../ticket.remote";

  const now = new Date();

  const urlFrom = page.url.searchParams.get("f") ?? formatDate(new Date()) + "T00:00:00";
  const urlTo = page.url.searchParams.get("t") ?? formatDate(new Date()) + "T23:59:59";
  const urlPatientId = page.url.searchParams.get("patient_id") ?? undefined;

  let from = $derived(new Date(urlFrom));
  let to = $derived(new Date(urlTo));

  let isWholeDay = $derived(
    formatDate(from) === formatDate(to) &&
      from.getHours() === 0 &&
      from.getMinutes() === 0 &&
      to.getHours() === 23 &&
      to.getMinutes() === 59
  );
  let isToday = $derived(
    isWholeDay &&
      from.getDate() === now.getDate() &&
      from.getMonth() === now.getMonth() &&
      from.getFullYear() === now.getFullYear()
  );

  const dispenses = $derived(await getTickets({ from, to, patient_id: urlPatientId }));
</script>

<h1>عرض تذاكر الصرف</h1>

{#if urlPatientId}
  <h2 class="for-patient-header">
    للمريض <span class="pii">"{dispenses.tickets[0]?.patient_name ?? urlPatientId}"</span>
    <button
      type="button"
      class="clear-patient-id"
      onclick={() => {
        const url = new URL(page.url);
        url.searchParams.delete("patient_id");
        window.location.href = url.href;
      }}
    >
      <X />
    </button>
  </h2>
{/if}

<svelte:element this={urlPatientId ? "h3" : "h2"}>
  {#if isWholeDay && isToday}
    لليوم ({now.getDate()} {getMonthArabicName(now.getMonth())})
  {:else if isWholeDay}
    ليوم {formatDate(from, "YYYY/MM/DD")}
  {:else}
    {`من ${formatDate(from, "الساعة HH:mm:ss يوم YYYY/MM/DD")} إلى ${formatDate(to, "الساعة HH:mm:ss يوم YYYY/MM/DD")}`
      .replaceAll("الساعة 00:00:00", "بداية")
      .replaceAll("الساعة 23:59:59", "نهاية")}
  {/if}
</svelte:element>

<DateTimeControls from={urlFrom} to={urlTo} keepSearchParams={["patient_id"]} />

<div class="tickets-wrapper">
  {#each dispenses.tickets as ticket, i (ticket.id)}
    <TicketDisplay
      {ticket}
      dateOnly={isWholeDay}
      items={dispenses.ticketsItems.filter((txn) => txn.ticket_id === ticket.id)}
    />
  {/each}
</div>

<style>
  h2.for-patient-header {
    color: light-dark(maroon, salmon);
    display: flex;
    gap: 1em;
  }

  button.clear-patient-id {
    background: none;
    place-items: center;
    border: none;
    padding: 0;

    &:hover,
    &:focus {
      color: light-dark(maroon, salmon);
    }

    &:active {
      transform: scale(1.2);
    }
  }

  .tickets-wrapper {
    margin: 1rem 10vw;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
