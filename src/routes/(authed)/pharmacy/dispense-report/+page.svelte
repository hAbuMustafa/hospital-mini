<script lang="ts">
  import { page } from "$app/state";
  import DateTimeControls from "$lib/components/DateTimeControls.svelte";
  import TradeNameToggle from "$lib/components/TradeNameToggle.svelte";
  import { formatDate } from "$lib/date/utils";
  import { getDrugsTransactionAmountTotals } from "./transactions.remote";

  let urlFrom = page.url.searchParams.get("f") ?? formatDate(new Date()) + "T00:00:00";
  let urlTo = page.url.searchParams.get("t") ?? formatDate(new Date()) + "T23:59:59";

  let from = $derived(new Date(urlFrom));
  let to = $derived(new Date(urlTo));

  let isWholeDay = $derived(
    formatDate(from) === formatDate(to) &&
      from.getHours() === 0 &&
      from.getMinutes() === 0 &&
      to.getHours() === 23 &&
      to.getMinutes() === 59
  );

  // svelte-ignore state_referenced_locally
  const totals = await getDrugsTransactionAmountTotals({ from, to });

  let useTradeName = $state(false);
</script>

<h1>عرض المنصرف</h1>

<h2>
  {#if isWholeDay}
    ليوم {formatDate(from, "YYYY/MM/DD")}
  {:else}
    {`من ${formatDate(from, "الساعة HH:mm:ss يوم YYYY/MM/DD")} إلى ${formatDate(to, "الساعة HH:mm:ss يوم YYYY/MM/DD")}`
      .replaceAll("الساعة 00:00:00", "بداية")
      .replaceAll("الساعة 23:59:59", "نهاية")}
  {/if}
</h2>

<DateTimeControls from={urlFrom} to={urlTo} />
<TradeNameToggle bind:useTradeName />

<ul class="totals">
  {#each totals as item, i (i)}
    <li title={useTradeName ? item.item_name : item.item_tradename}>
      <span class="item-qty">{-item.amount!}</span>
      <span class="item-name">{useTradeName ? item.item_tradename : item.item_name}</span>
    </li>
  {/each}
</ul>

<style>
  .item-qty {
    background-color: var(--main-text-color);
    color: var(--main-bg-color);
    border-radius: 4px;
    padding: 0.05rem 0.25rem;
  }
</style>
