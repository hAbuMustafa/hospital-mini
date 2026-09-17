<script lang="ts">
  import { page } from "$app/state";
  import Nav from "$lib/components/layout/Nav.svelte";
  import { signOutOnShiftEnd } from "./logout-on-shift-end";
  import "./styles.css";
  import { Toaster } from "svelte-sonner";

  const { children } = $props();

  $effect(() => {
    const signOutInterval = signOutOnShiftEnd();

    if (signOutInterval)
      return () => {
        window.clearInterval(signOutInterval);
      };
  });

  const appName = "مستشفى 23 يوليو للأمراض الصدرية";
</script>

<svelte:head>
  <title>{page.data.title ? `${page.data.title} | ${appName}` : appName}</title>
</svelte:head>

<Nav />

<div class="main-wrapper">
  {@render children()}
</div>

<Toaster
  position="bottom-left"
  richColors
  closeButton
  pauseWhenPageIsHidden
  class="hide-in-print"
/>

<style>
  .main-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: fit-content 1fr;
    justify-items: center;
  }
</style>
