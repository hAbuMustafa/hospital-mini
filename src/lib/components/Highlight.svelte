<script lang="ts">
  let { query = "", text = "" } = $props();
</script>

{@html text.replaceAll(
  new RegExp(query.replaceAll(" ", ".*"), "g"),
  (match) => `<mark>${match}</mark>`
)}
