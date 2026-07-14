<script lang="ts">
  import { formatDate } from "$lib/date/utils";

  type PropsT = {
    from?: string;
    to?: string;
  };

  const { from = formatDate(new Date()), to = formatDate(new Date()) }: PropsT = $props();
  let dateFrom = $derived(from);
  let dateTo = $derived(to);

  let [yesterday, tomorrow] = $derived.by(() => {
    const fDate = new Date(from);
    fDate.setDate(fDate.getDate() - 1);
    const yDay = formatDate(fDate);

    fDate.setDate(fDate.getDate() + 2);
    const nxDay = formatDate(fDate);

    return [yDay, nxDay];
  });
</script>

<div class="date-controls">
  <a href="?f={yesterday}&t={yesterday}" class="btn">&Lt;</a>
  <form method="GET">
    <label>
      من:
      <input type="date" name="f" bind:value={dateFrom} max={dateTo} />
    </label>

    <label>
      إلى:
      <input type="date" name="t" bind:value={dateTo} min={dateFrom} />
    </label>
    <button type="submit">تأكيد</button>
  </form>
  <a href="?f={tomorrow}&t={tomorrow}" class="btn">&Gt;</a>
</div>

<style>
  .date-controls {
    display: flex;
    gap: 1rem;
    justify-content: space-around;
    align-items: center;
  }

  form {
    display: contents;
  }
</style>
