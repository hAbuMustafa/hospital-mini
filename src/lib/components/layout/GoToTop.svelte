<script>
  import Top from "@lucide/svelte/icons/chevrons-up";
  import { fade, fly } from "svelte/transition";

  let scrollY = $state(0);
</script>

<svelte:window bind:scrollY />

{#if scrollY > 100}
  <a href="#top" class="fab" title="أول الصفحة" in:fly={{ y: 100 }} out:fade>
    <Top />
  </a>
{/if}

<style>
  .fab {
    width: 2rem;
    height: 2rem;
    place-content: center;
    text-align: center;
    position: fixed;
    inset-block-end: 1.5rem;
    inset-inline-end: 1.5rem;

    border-radius: 50%;
    background-color: var(--main-accent-color);
    color: white;
    box-shadow: var(--main-text-color) 0px 0px 4rem;
  }
</style>
