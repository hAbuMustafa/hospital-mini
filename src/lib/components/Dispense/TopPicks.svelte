<script lang="ts">
  import { getTopPicks } from "./topPicks.remote";

  type PropsT = {
    count?: number;
    onSelect: Function;
  };

  const { count = 5, onSelect }: PropsT = $props();

  const topPicksGetter = getTopPicks(count);
</script>

<svelte:boundary>
  {#snippet failed(error, reset)}
    <div class="error message">
      <p>حدث خطأ ما...</p>
      <p class="error-message">{error}</p>
      <button type="button" class="btn" onclick={reset}>حاول مرة أخرى</button>
    </div>
  {/snippet}

  {#await topPicksGetter}
    <p>جار حساب الأصناف الأكثر صرفًا...</p>
  {:then topPicks}
    {#if topPicks?.length}
      <details>
        <summary>الأصناف الأكثر استخدامًا</summary>
        <div class="top-picks-wrapper">
          {#each topPicks as item, i (item.drugs?.id)}
            <button type="button" onclick={() => onSelect(item.drugs)}>
              <span>{item.drugs?.tradename_ar}</span>
            </button>
          {/each}
        </div>
      </details>
    {/if}
  {/await}
</svelte:boundary>

<style>
  .top-picks-wrapper {
    width: 50vw;

    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: 3rem;
    justify-content: center;
    gap: 0.5rem;
  }

  details {
    text-align: center;
  }
</style>
