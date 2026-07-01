<script lang="ts">
  import {
    returnToInputAfterSelection,
    useComboboxKeyboardNavigation,
  } from "$lib/attachments";
  import debounce from "lodash-es/debounce";

  let {
    itemSnippet,
    query = $bindable(""),
    endpoint,
    filterFn = () => true,
    className = "",
    onSelect: select = () => null,
    ...rest
  } = $props();

  let matches: any[] = $state([]);

  let inputNode: HTMLInputElement | undefined = $state();
  let resultsNode: HTMLUListElement | undefined = $state();
</script>

<div class="lookup-wrapper {className}">
  <input
    type="search"
    bind:value={query}
    bind:this={inputNode}
    oninput={debounce(async () => {
      if (query === "") return;

      matches = await fetch(endpoint)
        .then((data) => data.json())
        .then((arr) => arr.filter(filterFn));
    }, 500)}
    onkeydown={(e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        resultsNode?.querySelector("button")?.focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const results = resultsNode?.querySelectorAll("button");
        results?.[results.length - 1]?.focus();
      }
      if (e.key === "Enter" && matches.length) {
        select(matches[0]);
        inputNode?.select();
      }
      if (e.key === "Escape") matches = [];
    }}
    {...rest}
  />
  {#if matches.length}
    <ul
      class="match-list"
      bind:this={resultsNode}
      {@attach useComboboxKeyboardNavigation(inputNode, resultsNode!)}
      {@attach returnToInputAfterSelection(inputNode)}
    >
      {#each matches as item (item.id)}
        <li>
          {@render itemSnippet(item)}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .lookup-wrapper {
    margin-block: 1rem;
    position: relative;

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

    &:not(:focus-within) ul.match-list {
      display: none;
    }
  }

  ul.match-list {
    inset: unset;
    position: absolute;
    inset-block-start: calc(anchor(bottom) + 0.25rem);
    justify-self: anchor-center;
    position-anchor: --drug-lookup-input;
    position-try-fallbacks: --bottom-center, --top-center;

    width: 100%;
    max-height: 50svh;
    overflow-y: scroll;

    list-style: none;
    padding: 0;
    border: var(--main-border);
    box-shadow: var(--main-shadow);
    margin: 0;

    display: flex;
    flex-direction: column;
    flex: 1;

    background-color: var(--menu-bg-color);

    z-index: 1;

    li:not(:first-of-type) {
      border-block-start: var(--main-border);
    }
  }
</style>
