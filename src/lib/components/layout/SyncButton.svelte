<script lang="ts">
  import type { Snippet } from "svelte";
  import { toast } from "svelte-sonner";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type PropsT = {
    loading: boolean;
    endpoint: string;
    children: Snippet;
  } & HTMLButtonAttributes;

  let { loading = $bindable(false), endpoint, children, ...rest }: PropsT = $props();
</script>

<button
  type="button"
  class:loading
  onclick={() => {
    loading = true;

    fetch(endpoint)
      .then(async (r) => {
        if (r.ok) {
          toast.success("تم تحديث البيانات");
        } else {
          const error = await r.json();
          toast.error(error.message);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        loading = false;
      });
  }}
  {...rest}
>
  {@render children()}
</button>

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

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>
