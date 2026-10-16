<script lang="ts">
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import PersonIcon from "@lucide/svelte/icons/user-pen";
  import DrugIcon from "@lucide/svelte/icons/pill";
  import SyncButton from "./SyncButton.svelte";
  import Filter from "../AuthzFilter.svelte";
  import {
    startDrugSync,
    startPatientsSync,
    startSync,
  } from "../../../routes/(authed)/sync.remote";

  let AllIsLoading = $state(false);
  let patientsIsLoading = $state(false);
  let drugsIsLoading = $state(false);

  let loading = $derived(AllIsLoading || patientsIsLoading || drugsIsLoading);
</script>

<div class="sync-buttons-wrapper">
  <Filter allowRole={["*-ph-*"]}>
    <SyncButton
      bind:loading={AllIsLoading}
      endpoint={startSync}
      aria-label="تحديث جميع البيانات"
      title="تحديث جميع البيانات"
      disabled={loading}
    >
      <RefreshCwIcon size="2rem" />
    </SyncButton>
  </Filter>

  <SyncButton
    bind:loading={patientsIsLoading}
    endpoint={startPatientsSync}
    aria-label="تحديث بيانات المرضى"
    title="تحديث بيانات المرضى"
    disabled={loading}
  >
    <RefreshCwIcon size="2rem" />
    <span class="embedded">
      <PersonIcon size="16px" class="embedded" color="lightgreen" />
    </span>
  </SyncButton>

  <Filter allowRole={["*-ph-*"]}>
    <SyncButton
      bind:loading={drugsIsLoading}
      endpoint={startDrugSync}
      aria-label="تحديث بيانات الأدوية"
      title="تحديث بيانات الأدوية"
      disabled={loading}
    >
      <RefreshCwIcon size="2rem" />
      <span class="embedded">
        <DrugIcon size="16px" class="embedded" color="light-dark(maroon, salmon)" />
      </span>
    </SyncButton>
  </Filter>
</div>

<style>
  .embedded {
    position: absolute;
    inset: 0;

    display: flex;

    align-items: center;
    justify-content: center;
  }
</style>
