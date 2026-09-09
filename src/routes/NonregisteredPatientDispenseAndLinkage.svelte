<script lang="ts">
  import { getUnlinkedTickets } from "./(authed)/pharmacy/ticket.remote";

  const unlinkedTickets = await getUnlinkedTickets();
</script>

{#if unlinkedTickets.length}
  <p class="warning message">
    لديك {unlinkedTickets.length} تذكرة لم يتم ربطها بمرضى الأقسام. يرجى
    <a href="/pharmacy/link-tickets">ربطها الآن</a>.
  </p>
{/if}
