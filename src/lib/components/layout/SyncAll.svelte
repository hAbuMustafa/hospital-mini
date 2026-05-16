<script lang="ts">
  import { enhance } from "$app/forms";
  import { RefreshCw } from "@lucide/svelte";

  let loading = $state(false);

  $effect(() => {
    loading = true;

    fetch("api/v1/sync/all")
      .then((r) => r.json())
      .then((d) => {
        console.log(d);
        loading = false;
      })
      .catch((e) => console.error(e));
  });
</script>

<form
  method="get"
  onsubmit={(e) => {
    e.preventDefault();
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
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(1turn);
    }
  }
</style>
