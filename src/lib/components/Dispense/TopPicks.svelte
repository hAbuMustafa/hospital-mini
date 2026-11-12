<script lang="ts">
  import { getTopPicks } from "./topPicks.remote";

  type PropsT = {
    count?: number;
    onSelect: Function;
  };

  const { count = 5, onSelect }: PropsT = $props();

  const topPicksGetter = $derived(getTopPicks(count));
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
            <button
              type="button"
              onclick={() =>
                onSelect({
                  ...item.drugs,
                  qty: item.stockDrugs?.qty,
                  stock_id: item.stockDrugs?.id,
                })}>
              <span>{item.drugs?.tradename_ar}</span>
              <span>
                <span>الرصيد:</span>
                <span class:unavailable={!item.stockDrugs?.qty}
                  >{item.stockDrugs?.qty ?? 0}</span>
                <span>{item.drugs?.unit}</span>
              </span>
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
    grid-template-rows: 4rem;
    justify-content: center;
    gap: 0.5rem;
  }

  details {
    text-align: center;
  }

  button {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .unavailable {
    color: light-dark(maroon, salmon);
  }
</style>
