<script lang="ts">
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";

  let loading = $state(false);
</script>

<form
  method="get"
  onsubmit={(e) => {
    e.preventDefault();

    loading = true;

    fetch("/api/v1/sync/all")
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
    background-color: transparent;
    border: none;
    cursor: pointer;

    :global(svg) {
      display: inline-block;
    }

    &:hover {
      :global(svg) {
        filter: drop-shadow(0px 0px 4px lightgreen);
        animation: spin 5s linear infinite;
      }
    }

    &.loading {
      :global(svg) {
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
