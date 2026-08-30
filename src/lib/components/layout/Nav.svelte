<script lang="ts">
  import { goto } from "$app/navigation";
  import { authState } from "$lib/auth-client/auth.svelte";
  import SyncAll from "$lib/components/layout/SyncAll.svelte";
  import Filter from "$lib/components/AuthzFilter.svelte";
  import Recording from "../Recording.svelte";
</script>

<nav>
  <a href="/" class="logo">
    <img src="/favicon.png" alt="مستشفى 23 يوليو للأمراض الصدرية" width="120" />
  </a>

  {#if authState.isAuthenticated}
    <ul>
      <Filter>
        <button popovertarget="admin-nav-list" interestfor="admin-nav-list"
          >الإدارة</button
        >
        <ul id="admin-nav-list" popover="hint">
          <li><a href="/admin/users">المستخدمين</a></li>
        </ul>
      </Filter>

      <Filter allowDepartment={[1, 2, 3, 4]}>
        <li>
          <button popovertarget="patient-nav-list" interestfor="patient-nav-list"
            >المرضى</button
          >
          <ul id="patient-nav-list" popover="hint">
            <li><a href="/patient">بيان المرضى بالأقسام</a></li>
            <Filter allowDepartment={[1, 3]}>
              <li><a href="/invoice/create">إصدار فاتورة</a></li>
            </Filter>
            <hr />
            <li><a href="/patient/lookup">بحث عن مريض</a></li>
          </ul>
        </li>
      </Filter>

      <Filter allowDepartment={[1, 2]}>
        <li>
          <button popovertarget="pharmacy-nav-list" interestfor="pharmacy-nav-list"
            >الصيدلية</button
          >
          <ul id="pharmacy-nav-list" popover="hint">
            <li><a href="/pharmacy/tickets">عرض تذاكر الصرف</a></li>
            <li><a href="/pharmacy/dispense-report">المنصرف</a></li>
            <hr />
            <li><a href="/stock/transfer">صرف لجهة</a></li>
            <li><a href="/stock/receive">استلام وارد</a></li>
          </ul>
        </li>
      </Filter>
    </ul>
  {/if}

  <ul>
    {#if authState.isAuthenticated}
      <Filter>
        <li>
          <Recording />
        </li>
        <li>
          <SyncAll />
        </li>
      </Filter>
      <li>أهلا يا <a href="/account">{authState.user!.displayUsername}</a>!</li>
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
        }
      }

      button[interestfor] {
        interest-delay-start: 0s;
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
        gap: 0.5rem;

        &:popover-open {
          display: flex;
        }

        hr {
          margin: 0;
          width: 80%;
        }

        a {
          padding: 0.25rem 0.5rem;

          &:hover,
          &:focus {
            text-decoration: none;
          }
        }
      }

      button[popovertarget],
      ul[popover] li {
        &:hover,
        &:focus {
          background-color: gray;
          border-radius: 4px;
        }
      }
    }
  }
</style>
