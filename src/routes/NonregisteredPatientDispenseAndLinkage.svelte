<script lang="ts">
  import { getUnlinkedTickets } from "./(authed)/pharmacy/ticket.remote";

  const unlinked = await getUnlinkedTickets();
</script>

{#if unlinked.patientNames.length}
  <p class="warning message">
    لديك {unlinked.patientNames.length} تذكرة لم يتم ربطها بمرضى الأقسام. يرجى
    <a href="/pharmacy/link-tickets" class="btn">ربطها الآن</a>.
  </p>
{/if}
