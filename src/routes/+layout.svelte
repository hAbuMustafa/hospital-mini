<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authState } from "$lib/auth-client/auth.svelte";
  import SyncAll from "$lib/components/layout/SyncAll.svelte";
  import "./styles.css";
  import { Toaster } from "svelte-sonner";

  const { children } = $props();
</script>

<svelte:head>
  <title>{page.data.title ?? "مستشفى 23 يوليو للأمراض الصدرية"}</title>
</svelte:head>

<nav>
  <a href="/" class="logo">
    <img src="/favicon.png" alt="مستشفى 23 يوليو للأمراض الصدرية" width="120" />
  </a>

  {#if authState.isAuthenticated}
    <ul class="hide-in-print">
      <li><a href="/invoice/create">إصدار فاتورة</a></li>
      <li><a href="/patient">المرضى</a></li>
    </ul>
  {/if}

  <ul class="hide-in-print">
    {#if authState.isAuthenticated}
      <li>
        <SyncAll />
      </li>
      <li>أهلا، <a href="/account">{authState.user!.name.split(" ")[0]}</a>!</li>
      <li>
        <button
          type="button"
          class="link"
          onclick={() => {
            authState.signOut();
            goto("/");
          }}
        >
          تسجيل خروج
        </button>
      </li>
    {:else}
      <li>
        <a href="/register">إنشاء حساب</a>
      </li>
      <li>
        <a href="/login">تسجيل الدخول</a>
      </li>
    {/if}
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
    justify-content: space-between;
    align-items: center;

    position: relative;
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
