<script lang="ts">
  import type { drugs } from "$lib/server/db/schema";
  import { debounce } from "lodash-es";

  type PropsT = {
    onSelect: (item: typeof drugs.$inferSelect) => void;
  };

  let { onSelect } = $props();

  let query = $state("");

  let matches: (typeof drugs.$inferInsert)[] = $state([]);
</script>

<input
  type="search"
  bind:value={query}
  oninput={debounce(async () => {
    if (query === "") return;

    matches = await fetch(`/api/v1/drug?q=${query}`).then((d) => d.json());
  }, 500)}
/>
{#if matches.length}
  <ul class="drug-list">
    {#each matches as drug, i (drug.id)}
      <li>
        <button type="button" onclick={onSelect}>
          <strong class="name-ar">{drug.name_ar}</strong>
          <span class="name">{drug.name}</span>
          <span class="price">{drug.price_resale?.toPrecision(3)} جنيه</span>
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
</style>
