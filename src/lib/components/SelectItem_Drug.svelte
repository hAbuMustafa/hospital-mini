<script lang="ts">
  import Highlight from "./Highlight.svelte";

  type PropsT = {
    drug: DrugT;
    query: string;
    isSelected: boolean;
  } & any;

  let { drug, query, isSelected, ...rest }: PropsT = $props();
</script>

<button type="button" class="drug-select" class:already-selected={isSelected} {...rest}>
  <strong class="name-ar"><Highlight text={drug.name_ar!} {query} /></strong>
  <span class="name"><Highlight text={drug.tradename_ar!} {query} /></span>
  <span class="price">{drug.price_resale?.toFixed(3)} جنيه</span>
</button>

<style>
  button.drug-select {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: none;

    &:focus {
      border: 3px double var(--main-accent-color);
      outline: none;
    }

    &.already-selected {
      background-color: green;
    }
  }
</style>
