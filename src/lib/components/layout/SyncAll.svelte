<script lang="ts">
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import PersonIcon from "@lucide/svelte/icons/user-pen";
  import DrugIcon from "@lucide/svelte/icons/pill";

  let AllIsLoading = $state(false);
  let patientsIsLoading = $state(false);
  let drugsIsLoading = $state(false);

  let loading = $derived(AllIsLoading || patientsIsLoading || drugsIsLoading);
</script>

<div class="sync-buttons-wrapper">
  <button
    type="button"
    aria-label="تحديث جميع البيانات"
    title="تحديث جميع البيانات"
    disabled={loading}
    class:AllIsLoading
    onclick={() => {
      AllIsLoading = true;

      fetch("/api/v1/sync/all")
        .then((r) => r.json())
        .then((d) => {
          console.log(d);
          AllIsLoading = false;
        })
        .catch((e) => console.error(e));
    }}
  >
    <RefreshCwIcon size="2rem" />
  </button>

  <button
    type="button"
    aria-label="تحديث بيانات المرضى"
    title="تحديث بيانات المرضى"
    disabled={loading}
    class:loading={patientsIsLoading}
    onclick={() => {
      patientsIsLoading = true;

      fetch("/api/v1/sync/patients")
        .then((r) => r.json())
        .then((d) => {
          console.log(d);
          patientsIsLoading = false;
        })
        .catch((e) => console.error(e));
    }}
  >
    <RefreshCwIcon size="2rem" />
    <span class="embedded">
      <PersonIcon size="16px" class="embedded" color="lightgreen" />
    </span>
  </button>

  <button
    type="button"
    aria-label="تحديث بيانات الأدوية"
    title="تحديث بيانات الأدوية"
    disabled={loading}
    class:loading={drugsIsLoading}
    onclick={() => {
      drugsIsLoading = true;

      fetch("/api/v1/sync/drugs")
        .then((r) => r.json())
        .then((d) => {
          console.log(d);
          drugsIsLoading = false;
        })
        .catch((e) => console.error(e));
    }}
  >
    <RefreshCwIcon size="2rem" />
    <span class="embedded">
      <DrugIcon size="16px" class="embedded" color="light-dark(maroon, salmon)" />
    </span>
  </button>
</div>

<style>
  button {
    padding: 0;
    background-color: transparent;
    border: none;
    cursor: pointer;
    position: relative;

    :global(svg) {
      display: inline-block;
    }

    &:hover {
      :global(> svg) {
        filter: drop-shadow(0px 0px 4px lightgreen);
        animation: spin 5s linear infinite;
      }
    }

    &.loading {
      :global(> svg) {
        animation: spin 1s linear infinite;
      }
    }
  }

  .embedded {
    position: absolute;
    inset: 0;

    display: flex;

    align-items: center;
    justify-content: center;
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>
