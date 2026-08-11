<script>
  import { authState } from "$lib/auth-client/auth.svelte";
  import UnsyncedNarcotics from "./UnsyncedNarcotics.svelte";
</script>

<h1>مستشفى 23 يوليو للأمراض الصدرية</h1>

{#if authState.user?.affiliation === 1}
  <UnsyncedNarcotics />
{/if}
