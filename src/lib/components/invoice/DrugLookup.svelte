<script lang="ts">
  import { debounce } from "lodash-es";
  import { toast } from "svelte-sonner";

  type PropsT = {
    list: InvoiceSelectedDrugT[];
    filterIds?: number[];
  };

  let { list = $bindable([]), filterIds }: PropsT = $props();

  let query = $state("");

  let matches: DrugT[] = $state([]);

  function selectDrug(item: InvoiceSelectedDrugT) {
    const foundItemIndexInList = list.findIndex((d) => d.id === item.id);
    if (foundItemIndexInList > -1) {
      list[foundItemIndexInList].amount++;
      toast.info(
        `الصنف مضاف سابقا في السطر ${foundItemIndexInList + 1} تم زيادة الكمية لتصبح ${list[foundItemIndexInList].amount}`,
      );
      return;
    }

    item.amount = 1;
    item.total = () => item.amount * (item.price_resale ?? 0);
    item.editable = true;
    list.push(item);
  }
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
          <button type="button" onclick={() => selectDrug(drug)}>
            <strong class="name-ar">{drug.name_ar}</strong>
            <span class="name">{drug.name}</span>
            <span class="price">{drug.price_resale?.toFixed(3)} جنيه</span>
          </button>
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

    li > button {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
  }
</style>
