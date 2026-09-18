<script lang="ts">
  import { page } from "$app/state";
  import DateTimeControls from "$lib/components/DateTimeControls.svelte";
  import TicketDisplay from "$lib/components/TicketDisplay.svelte";
  import { formatDate } from "$lib/date/utils";
  import { getTickets } from "../ticket.remote";

  let urlFrom = page.url.searchParams.get("f") ?? formatDate(new Date()) + "T00:00:00";
  let urlTo = page.url.searchParams.get("t") ?? formatDate(new Date()) + "T23:59:59";

  let from = $derived(new Date(urlFrom));
  let to = $derived(new Date(urlTo));

  let isWholeDay = $derived(
    formatDate(from) === formatDate(to) &&
      from.getHours() === 0 &&
      from.getMinutes() === 0 &&
      to.getHours() === 23 &&
      to.getMinutes() === 59
  );

  // svelte-ignore state_referenced_locally
  const dispenses = await getTickets({ from, to });
</script>

<h1>عرض تذاكر الصرف</h1>

<h2>
  {#if isWholeDay}
    ليوم {formatDate(from, "YYYY/MM/DD")}
  {:else}
    {`من ${formatDate(from, "الساعة HH:mm:ss يوم YYYY/MM/DD")} إلى ${formatDate(to, "الساعة HH:mm:ss يوم YYYY/MM/DD")}`
      .replaceAll("الساعة 00:00:00", "بداية")
      .replaceAll("الساعة 23:59:59", "نهاية")}
  {/if}
</h2>

<DateTimeControls from={urlFrom} to={urlTo} />

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
  .tickets-wrapper {
    margin: 1rem 10vw;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
