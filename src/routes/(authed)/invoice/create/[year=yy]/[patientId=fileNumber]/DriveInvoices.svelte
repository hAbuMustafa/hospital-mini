<script lang="ts">
  import { formatDate } from "$lib/date/utils";
  import type { searchDriveFiles } from "$lib/server/gcp/drive";
  import { getDriveInvoices } from "../../../invoice.remote";
  import Loading from "@lucide/svelte/icons/loader-pinwheel";

  let { patientId }: { patientId: string } = $props();

  let driveInvoices: Awaited<ReturnType<typeof searchDriveFiles>> | null = $state(null);

  let loading = $state(false);
</script>

<h2>فواتير على Drive</h2>

{#if driveInvoices?.length}
  <ul>
    {#each driveInvoices as invoice, i (i)}
      <li>
        <a href={invoice.webContentLink} download class="btn"
          >{invoice.name?.replace(".pdf", "")}</a>
        {#if invoice.createdTime}
          <span class="created-at">
            {formatDate(invoice.createdTime, "YYYY/MM/DD (HH:mm)")}
          </span>
        {/if}
      </li>
    {/each}
  </ul>
{:else if driveInvoices === undefined}
  <p>لا توجد فواتير مرفوعة للمريض</p>
{:else}
  <svelte:boundary
    onerror={(e) => {
      console.error(e);
    }}>
    <span class="wrapper">
      <button
        type="button"
        class="btn yellow"
        onclick={async () => {
          loading = true;
          driveInvoices = await getDriveInvoices(patientId);
          loading = false;
        }}
        disabled={loading}>بحث</button>
      {#if loading}
        <span class="spinner">
          <Loading size="1rem" />
        </span>
      {/if}
    </span>

    {#snippet failed(error, reset)}
      <p>حدث خطأ أثناء البحث عن الفاتورة</p>
      <button type="button" onclick={reset} class="btn red">إعادة المحاولة</button>
    {/snippet}
  </svelte:boundary>
{/if}

<style>
  h2 {
    border-block-start: 1px dashed currentColor;
    width: 70%;
    padding-block-start: 1rem;
  }

  .yellow {
    --bg: gold;
  }

  .red {
    --bg: light-dark(maroon, salmon);
  }

  ul {
    list-style: none;
    padding-inline: 0;

    display: flex;
    flex-direction: column;
    gap: 1rem;

    a {
      --bg: green;
    }
  }

  .wrapper {
    display: flex;
    gap: 0.25rem;
    align-items: center;

    .spinner {
      display: inline-block;
      animation: spin 1s infinite forwards linear;
      width: 1rem;
      height: 1rem;
    }
  }

  @keyframes spin {
    to {
      rotate: 1turn;
    }
  }
</style>
