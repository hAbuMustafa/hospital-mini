<script lang="ts">
  import { browser } from "$app/env";
  import Mic from "@lucide/svelte/icons/mic";
  import MicOff from "@lucide/svelte/icons/mic-off";

  let recording = $state(Boolean(browser ? localStorage.getItem("recording") : false));

  $effect(() => {
    document.body.classList.toggle("recording", recording);

    if (browser) {
      localStorage.setItem("recording", recording ? "true" : "");
    }
  });
</script>

<label>
  <input type="checkbox" bind:checked={recording} />
  {#if recording}
    <MicOff color="maroon" />
  {:else}
    <Mic color="salmon" />
  {/if}
</label>

<style>
  input {
    display: none;
  }
</style>
