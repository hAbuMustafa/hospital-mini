<script lang="ts">
  import { browser } from "$app/env";
  import Light from "@lucide/svelte/icons/sun";
  import Dark from "@lucide/svelte/icons/moon-star";
  import Auto from "@lucide/svelte/icons/sun-moon";

  let devicePreferenceDark = $state(
    browser ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
  );

  let localTheme = $state(
    browser ? localStorage.getItem("theme") : devicePreferenceDark ? "dark" : "auto"
  );

  let theme = $derived(localTheme ?? "auto");

  $effect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    if (browser) localStorage.setItem("theme", theme);
  });

  function switchTheme() {
    switch (theme) {
      case "auto":
        theme = "light";
        break;
      case "light":
        theme = "dark";
        break;
      case "dark":
        theme = "auto";
        break;
    }
  }
</script>

<button type="button" onclick={() => switchTheme()}>
  {#if theme === "light"}
    <Light color="orange" />
  {:else if theme === "dark"}
    <Dark color="wheat" />
  {:else}
    <Auto />
  {/if}
</button>

<style>
  button {
    all: unset;
  }
</style>
