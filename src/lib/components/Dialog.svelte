<script lang="ts">
  let { id, children } = $props();
</script>

<dialog {id} closedby="any">
  {@render children()}
</dialog>

<style>
  dialog {
    border-color: var(--main-text-color);
    border-radius: 8px;

    &::backdrop {
      background-color: black;
      opacity: 0.5;
    }
  }
</style>
