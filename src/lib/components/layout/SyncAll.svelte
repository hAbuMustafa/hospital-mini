<script lang="ts">
  import { RefreshCw } from "@lucide/svelte";

  let loading = $state(false);
</script>

<form
  method="get"
  onsubmit={(e) => {
    e.preventDefault();

    loading = true;

    fetch("api/v1/sync/all")
      .then((r) => r.json())
      .then((d) => {
        console.log(d);
        loading = false;
      })
      .catch((e) => console.error(e));
  }}
>
  <button type="submit" aria-label="sync all" disabled={loading} class:loading>
    <RefreshCw />
  </button>
</form>

<style>
  button {
    padding: 0;

    &.loading {
      :global(svg) {
        display: inline-block;
        animation: spin 1s linear infinite;
      }
    }
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>
