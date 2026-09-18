<script lang="ts">
  import Show from "@lucide/svelte/icons/eye";
  import Hide from "@lucide/svelte/icons/eye-closed";
  import type { HTMLInputAttributes } from "svelte/elements";

  let { value = $bindable(""), ...restProps }: HTMLInputAttributes = $props();

  let showPassword = $state(false);
</script>

<div class="pw-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    {...restProps}
    onkeydown={(e) => {
      if (e.ctrlKey) {
        showPassword = true;
      }
    }}
    onkeyup={() => {
      showPassword = false;
    }}
  />

  <label>
    <input
      type="checkbox"
      bind:checked={
        () => showPassword,
        (v) => {
          if (v) {
            setTimeout(() => {
              showPassword = false;
            }, 5000);
          }
          showPassword = v;
        }
      }
      hidden
    />
    {#if showPassword}
      <Hide size="16px" />
    {:else}
      <Show size="16px" />
    {/if}
  </label>
</div>

<style>
  .pw-wrapper {
    display: inline-block;
    position: relative;
    padding: 0;

    & > input {
      text-align: center;
    }

    label {
      position: absolute;
      inset-inline-end: 4px;
      inset-block: 0;

      place-content: center;
    }
  }
</style>
