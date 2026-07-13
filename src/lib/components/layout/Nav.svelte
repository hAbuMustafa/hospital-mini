<script lang="ts">
  import { goto } from "$app/navigation";
  import { authState } from "$lib/auth-client/auth.svelte";
  import SyncAll from "$lib/components/layout/SyncAll.svelte";
</script>

<nav>
  <a href="/" class="logo">
    <img src="/favicon.png" alt="مستشفى 23 يوليو للأمراض الصدرية" width="120" />
  </a>

  {#if authState.isAuthenticated}
    <ul>
      <li>
        <button popovertarget="patient-nav-list">المرضى</button>
        <ul id="patient-nav-list" popover="hint">
          <li><a href="/patient">بيان المرضى بالأقسام</a></li>
          <li><a href="/invoice/create">إصدار فاتورة</a></li>
        </ul>
      </li>
      <li>
        <button popovertarget="pharmacy-nav-list">الصيدلية</button>
        <ul id="pharmacy-nav-list" popover="hint">
          <li><a href="/dispense">صرف طلبية</a></li>
          <li><a href="/tickets">مراجعة طلبيات</a></li>
          <li><a href="/dispense-report">المنصرف</a></li>
        </ul>
      </li>
    </ul>
  {/if}

  <ul>
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

<style>
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;

    position: relative;

    ul {
      margin-inline: 0;
      padding-inline: 0;
      list-style: none;

      display: flex;
      gap: 1rem;

      align-items: center;

      a {
        text-decoration: none;
        color: unset;

        &:hover {
          text-decoration: underline;
        }
      }

      @media print {
        display: none;
      }

      button[popovertarget] {
        background-color: unset;
        color: unset;
        border: unset;
        font-size: unset;

        &:hover,
        &:focus {
          cursor: pointer;
          text-decoration: underline solid;
        }
      }

      ul[popover] {
        display: none;
        flex-direction: column;
        position-area: bottom;
        margin-block-start: 0.4rem;
        padding: 0.5rem;
        background-color: var(--main-bg-color);
        border-radius: 4px;
        border: var(--main-border);
        box-shadow: var(--main-shadow);

        &:popover-open {
          display: flex;
        }
      }
    }
  }
</style>
