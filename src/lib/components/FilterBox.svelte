<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type PropsT = {
    query: string;
    regex?: RegExp;
  } & HTMLInputAttributes;

  let { query = $bindable(""), regex = $bindable(), ...rest }: PropsT = $props();
</script>

<input
  type="search"
  bind:value={
    () => query,
    (newVal) => {
      query = newVal;
      regex = new RegExp(
        newVal
          .replaceAll(/اأإآ/g, "[اأإآ]")
          .replaceAll(/ةه/g, "[ةه]")
          .replaceAll(/يى/g, "[يى]")
          .replaceAll(/\s+/g, ".*"),
        "gi"
      );
    }
  }
  {...rest}
/>

<style>
  input[type="search"] {
    text-align: center;
    font-size: 1.5rem;
  }
</style>
