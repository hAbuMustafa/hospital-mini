<script>
  import UnsyncedNarcotics from "./UnsyncedNarcotics.svelte";
  import NonregisteredPatientDispenseAndLinkage from "./NonregisteredPatientDispenseAndLinkage.svelte";
  import AuthzFilter from "$lib/components/AuthzFilter.svelte";
</script>

<h1>مستشفى 23 يوليو للأمراض الصدرية</h1>

<AuthzFilter allowRole={["*-ph-*"]}>
  <NonregisteredPatientDispenseAndLinkage />
</AuthzFilter>

<AuthzFilter allowRole={["e-ph-*"]}>
  <UnsyncedNarcotics />
</AuthzFilter>
