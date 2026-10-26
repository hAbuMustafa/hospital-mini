<script lang="ts">
  import AuthzFilter from "$lib/components/AuthzFilter.svelte";
  import { getPharmacyStock } from "./stock.remote";
  import { formatDate } from "$lib/date/utils";
  import AddStock from "./AddStock.svelte";
  import EditStock from "./EditStock.svelte";

  const stock = $derived(await getPharmacyStock());
</script>

<table>
  <thead>
    <tr>
      <AuthzFilter>
        <th>الصيدلية</th>
      </AuthzFilter>
      <th>اسم الصنف</th>
      <th>الرصيد</th>
      <th>التشغيلة</th>
      <th>الصلاحية</th>
    </tr>
  </thead>
  <tbody>
    {#if stock.length}
      {#each stock as item, i (i)}
        <tr>
          <AuthzFilter>
            <td>{item.pharmacy_name}</td>
          </AuthzFilter>
          <td>{item.name}</td>
          <td>
            {item.qty ?? 0}

            <AuthzFilter allowRole={["*-ph-manager"]}>
              {#if item.qty !== null}
                <EditStock {item} />
              {:else}
                <AddStock {item} />
              {/if}
            </AuthzFilter>
          </td>
          <td>{item.batch_number}</td>
          <td>
            {#if item.expiry_date}
              {formatDate(item.expiry_date)}
            {/if}
          </td>
        </tr>
      {/each}
    {:else}
      <tr>
        <td colspan="10">لا يوجد مخزون للصيدلية</td>
      </tr>
    {/if}
  </tbody>
</table>

<style>
  th,
  td {
    border: var(--main-border);
    padding: 0.25rem 0.5rem;
  }
</style>
