<script lang="ts">
  import { page } from "$app/state";
  import Ticket from "$lib/components/TicketDisplay.svelte";
  import { getTicket } from "../../ticket.remote.js";

  const ticket = await getTicket(Number(page.params.ticketId));
</script>

<h1>تذكرة {ticket.ticket.is_dispense ? "صرف" : "مرتجع"} رقم {page.params.ticketId}</h1>

<div class="wrapper">
  <Ticket ticket={ticket.ticket} items={ticket.ticketItems} />
</div>

<style>
  .wrapper {
    width: 60vw;
  }
</style>
