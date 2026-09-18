<script lang="ts">
  let { number } = $props();
</script>

<a class="ticket-id" href="/pharmacy/ticket/{number}">
  &#x23;{number}
</a>

<style>
  .ticket-id {
    color: gray;
    text-decoration: none;
  }
</style>
