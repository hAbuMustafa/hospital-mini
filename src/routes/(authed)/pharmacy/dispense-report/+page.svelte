<script lang="ts">
  import { page } from "$app/state";
  import DateTimeControls from "$lib/components/DateTimeControls.svelte";
  import FilterBox from "$lib/components/FilterBox.svelte";
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

  const totalsGetter = getDrugsTransactionAmountTotals({ from, to });

  let totals = await totalsGetter;

  console.log(totals);

  let useTradeName = $state(false);

  let query = $state("");

  let qRegex = $state(new RegExp(""));

  const NAME_COLUMNS = [
    "item_name",
    "item_tradename",
    "item_name_en",
    "item_tradename_en",
  ] as const;
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
<FilterBox bind:query bind:regex={qRegex} placeholder="بحث عن دواء 🔍" />

<TradeNameToggle bind:useTradeName />

<ul class="totals">
  {#each totals as item, i (i)}
    <li
      title={useTradeName ? item.item_name : item.item_tradename}
      class:filtered-out={query && NAME_COLUMNS.every((col) => !qRegex.test(item[col]!))}
    >
      <span class="item-qty">{item.amount}</span>
      <span class="item-name">
        {#if query}
          {@html (useTradeName ? item.item_tradename : item.item_name)?.replaceAll(
            qRegex,
            (match) => `<mark>${match}</mark>`
          )}
        {:else}
          {useTradeName ? item.item_tradename : item.item_name}
        {/if}
      </span>
    </li>
  {/each}
</ul>

<style>
  .totals {
    list-style: none;
    margin-block: 0;
    margin-inline: 25vw;
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    align-items: start;
  }

  li {
    display: flex;
    gap: 1rem;
    padding-block: 0.35rem;
    align-items: center;
    width: 100%;

    &:not(:first-of-type) {
      border-block-start: 1px dashed var(--main-text-color);
    }
  }

  .item-qty {
    background-color: var(--main-text-color);
    color: var(--main-bg-color);
    border-radius: 4px;
    padding: 0.05rem 0.25rem;
  }

  .filtered-out {
    display: none;
  }
</style>
