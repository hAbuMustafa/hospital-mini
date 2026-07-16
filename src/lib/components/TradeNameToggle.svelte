<script lang="ts">
  let { useTradeName = $bindable(false) } = $props();
</script>

<label>
  <input type="checkbox" bind:checked={useTradeName} />
  {#if useTradeName}
    الاسم التجاري
  {:else}
    الاسم العلمي
  {/if}
</label>

<style>
  input {
    display: none;
  }

  label {
    background-color: var(--main-text-color);
    color: var(--main-bg-color);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;

    &:has(:checked) {
      background-color: var(--main-accent-color);
      font-weight: bold;
    }
  }
</style>
