<script lang="ts">
  import { debounce } from "lodash-es";
  import type { Snippet } from "svelte";

  type PropsT = {
    filterIds?: number[];
    drugSnippet: Snippet<[DrugT]>;
  };

  let { filterIds, drugSnippet }: PropsT = $props();

  let query = $state("");

  let matches: DrugT[] = $state([]);
</script>

<div class="drug-lookup hide-in-print">
  <input
    type="search"
    placeholder="اسم الصنف (مثلا: بالميكورت أو أوندانسيترون أو adrenaline)"
    bind:value={query}
    oninput={debounce(async () => {
      if (query === "") return;

      matches = await fetch(`/api/v1/drug?q=${query}`)
        .then((data) => data.json())
        .then((dList: DrugT[]) =>
          dList.filter((d) => filterIds?.every((id) => d.id != id)),
        );
    }, 500)}
  />
  {#if matches.length}
    <ul class="drug-list">
      {#each matches as drug (drug.id)}
        <li>
          {@render drugSnippet(drug)}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .drug-lookup {
    input {
      width: 100%;
      font-size: 2rem;
      text-align: center;
      anchor-name: --drug-lookup-input;
      margin-block-end: 2rem;

      &::placeholder {
        font-size: 1rem;
      }
    }

    &:not(:focus-within) ul.drug-list {
      display: none;
    }
  }

  ul.drug-list {
    inset: unset;
    position: absolute;
    inset-block-start: calc(anchor(bottom) + 0.25rem);
    justify-self: anchor-center;
    position-anchor: --drug-lookup-input;
    position-try-fallbacks: --bottom-center, --top-center;

    max-height: 50svh;
    overflow-y: scroll;

    list-style: none;
    padding: 1rem;
    border-radius: 0.5rem;
    border: var(--main-border);
    box-shadow: var(--main-shadow);
    margin: 0;

    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0.5rem;

    background-color: var(--menu-bg-color);

    z-index: 1;
  }
</style>
