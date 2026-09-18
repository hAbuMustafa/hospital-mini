<script lang="ts">
  import { page } from "$app/state";
  import { formatDate } from "$lib/date/utils";

  type PropsT = {
    from?: string;
    to?: string;
    keepSearchParams?: string[];
  };

  const {
    from = formatDate(new Date()) + "T00:00:00",
    to = formatDate(new Date()) + "T23:59:59",
    keepSearchParams = [],
  }: PropsT = $props();

  const fromDate = $derived(new Date(from));

  let [yesterday, tomorrow] = $derived.by(() => {
    const fDate = new Date(fromDate);
    fDate.setDate(fDate.getDate() - 1);
    const yDay = formatDate(fDate);

    fDate.setDate(fDate.getDate() + 2);
    const nxDay = formatDate(fDate);

    return [yDay, nxDay];
  });

  // svelte-ignore state_referenced_locally
  const keptParams = keepSearchParams.filter((p) => page.url.searchParams.get(p));
  const fixedParams = keptParams.length
    ? `&${keptParams.map((p) => `${p}=${page.url.searchParams.get(p)}`).join("&")}`
    : "";
</script>

<div class="date-controls">
  <a
    href="?f={yesterday}T00:00:00&t={yesterday}T23:59:59{fixedParams}"
    class="btn"
    data-sveltekit-reload>&Lt;</a
  >
  <form method="GET" data-sveltekit-reload>
    <label>
      من:
      <input type="datetime-local" name="f" value={from} step="1" />
    </label>

    <label>
      إلى:
      <input type="datetime-local" name="t" value={to} step="1" />
    </label>

    {#each keptParams as searchParam, i (i)}
      <input
        type="hidden"
        name={searchParam}
        value={page.url.searchParams.get(searchParam)}
      />
    {/each}
    <button type="submit">تأكيد</button>
  </form>
  <a
    href="?f={tomorrow}T00:00:00&t={tomorrow}T23:59:59{fixedParams}"
    class="btn"
    data-sveltekit-reload>&Gt;</a
  >
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
