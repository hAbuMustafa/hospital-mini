<script lang="ts">
  import debounce from "lodash-es/debounce";
  import { fromAction } from "svelte/attachments";

  let {
    itemSnippet,
    query = $bindable(""),
    endpoint,
    filterFn = () => true,
    className = "",
    ...rest
  } = $props();

  let matches: any[] = $state([]);

  let inputNode: HTMLInputElement;
  // svelte-ignore non_reactive_update
  let resultsNode: HTMLUListElement;

  function useKeyboardNavigation(node: HTMLElement) {
    function handleKeydown(e: KeyboardEvent) {
      if (
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown" &&
        e.key !== "Escape" &&
        e.key !== "Tab"
      )
        return;

      e.preventDefault();

      const items = Array.from(node.querySelectorAll("li>button")) as HTMLButtonElement[];
      if (!items.length) return;

      const trigger = document.activeElement as HTMLButtonElement;
      const currentIndex = items.indexOf(trigger!);

      switch (e.key) {
        case "ArrowUp":
          let prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex].focus();

          break;
        case "ArrowDown":
          let nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
          break;

        case "Escape":
          inputNode.focus();
          inputNode.select();
          break;
        case "Tab":
          if (e.shiftKey) {
            inputNode.focus();
            inputNode.select();
          }
          break;

        default:
          break;
      }
    }

    node.addEventListener("keydown", handleKeydown);

    return {
      destroy() {
        node.removeEventListener("keydown", handleKeydown);
      },
    };
  }

  function returnToInputAfterSelection(node: HTMLElement) {
    function handleButtonClick(e: Event) {
      if (!(e.target instanceof HTMLButtonElement)) return;

      inputNode.focus();
      inputNode.select();
    }

    node.addEventListener("click", handleButtonClick);

    return {
      destroy() {
        node.removeEventListener("click", handleButtonClick);
      },
    };
  }
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
      if (e.key === "ArrowDown") resultsNode.querySelector("button")?.focus();
    }}
    {...rest}
  />
  {#if matches.length}
    <ul
      class="match-list"
      bind:this={resultsNode}
      {@attach fromAction(useKeyboardNavigation)}
      {@attach fromAction(returnToInputAfterSelection)}
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
