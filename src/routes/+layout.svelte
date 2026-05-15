<script lang="ts">
  import { page } from "$app/state";
  import "./styles.css";
  import { Toaster } from "svelte-sonner";

  const { data, children } = $props();
</script>

<svelte:head>
  <title>{page.data.title ?? "مستشفى 23 يوليو للأمراض الصدرية"}</title>
</svelte:head>

<nav>
  <a href="/" class="logo">
    <img src="/favicon.png" alt="مستشفى 23 يوليو للأمراض الصدرية" width="120" />
  </a>

  <ul class="hide-in-print">
    <li><a href="/invoice/create">إصدار فاتورة</a></li>
    <li><a href="/patients">المرضى</a></li>
  </ul>
</nav>

<div class="main-wrapper">
  {@render children()}
</div>

<Toaster position="bottom-left" richColors closeButton />

<style>
  .main-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: fit-content 1fr;
    justify-items: center;
  }

  nav {
    display: flex;
    justify-content: center;
    align-items: center;

    position: relative;
  }

  nav > .logo {
    position: absolute;
    inset-inline-start: 0;
    inset-block-start: 0;
  }

  nav > ul {
    margin-inline: 0;
    padding-inline: 0;
    list-style: none;

    display: flex;
    gap: 1rem;

    a {
      text-decoration: none;
      color: unset;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
