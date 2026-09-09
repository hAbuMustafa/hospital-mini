<script>
  import { authState } from "$lib/auth-client/auth.svelte";
  import UnsyncedNarcotics from "./UnsyncedNarcotics.svelte";
  import NonregisteredPatientDispenseAndLinkage from "./NonregisteredPatientDispenseAndLinkage.svelte";
</script>

<h1>مستشفى 23 يوليو للأمراض الصدرية</h1>

{#if authState.user?.role?.includes("-ph-")}
  <NonregisteredPatientDispenseAndLinkage />
{/if}

{#if authState.user?.affiliation === 1}
  <UnsyncedNarcotics />
{/if}
