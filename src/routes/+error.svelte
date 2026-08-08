<script lang="ts">
  import { page } from "$app/state";
</script>

<h1>{page.status}</h1>
<p>{page.error?.message}</p>

<style>
  h1 {
    font-size: 10rem;
  }
</style>
