<script lang="ts">
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import PersonIcon from "@lucide/svelte/icons/user-pen";
  import DrugIcon from "@lucide/svelte/icons/pill";
  import SyncButton from "./SyncButton.svelte";

  let AllIsLoading = $state(false);
  let patientsIsLoading = $state(false);
  let drugsIsLoading = $state(false);

  let loading = $derived(AllIsLoading || patientsIsLoading || drugsIsLoading);
</script>

<div class="sync-buttons-wrapper">
  <SyncButton
    bind:loading={AllIsLoading}
    endpoint="/api/v1/sync/all"
    aria-label="تحديث جميع البيانات"
    title="تحديث جميع البيانات"
    disabled={loading}
  >
    <RefreshCwIcon size="2rem" />
  </SyncButton>

  <SyncButton
    bind:loading={patientsIsLoading}
    endpoint="/api/v1/sync/patients"
    aria-label="تحديث بيانات المرضى"
    title="تحديث بيانات المرضى"
    disabled={loading}
  >
    <RefreshCwIcon size="2rem" />
    <span class="embedded">
      <PersonIcon size="16px" class="embedded" color="lightgreen" />
    </span>
  </SyncButton>

  <SyncButton
    bind:loading={drugsIsLoading}
    endpoint="/api/v1/sync/drugs"
    aria-label="تحديث بيانات الأدوية"
    title="تحديث بيانات الأدوية"
    disabled={loading}
  >
    <RefreshCwIcon size="2rem" />
    <span class="embedded">
      <DrugIcon size="16px" class="embedded" color="light-dark(maroon, salmon)" />
    </span>
  </SyncButton>
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
