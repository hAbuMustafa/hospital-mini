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
    <span>
      <RefreshCw />
    </span>
  </button>
</form>

<style>
  .loading > span {
    animation: spin 1s infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>
