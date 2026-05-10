<script lang="ts">
  import "./styles.css";
  const { data, children } = $props();
</script>

<svelte:head>
  <title>مستشفى 23 يوليو للأمراض الصدرية</title>
</svelte:head>

<nav>
  <a href="/">
    <img src="/favicon.png" alt="مستشفى 23 يوليو للأمراض الصدرية" width="120" />
  </a>
</nav>

<div class="main-wrapper">
  {@render children()}
</div>

<style>
  .main-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: fit-content 1fr;
    justify-items: center;
  }
</style>
