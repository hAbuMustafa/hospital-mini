<script lang="ts">
  import AuthzFilter from "$lib/components/AuthzFilter.svelte";
  import { getPharmacyStock } from "./stock.remote";
  import { formatDate } from "$lib/date/utils";
  import AddStock from "./AddStock.svelte";
  import EditStock from "./EditStock.svelte";
  import EditIcon from "@lucide/svelte/icons/square-pen";
  import AddIcon from "@lucide/svelte/icons/circle-plus";

  const stock = $derived(await getPharmacyStock());

  let selectedItemForAddition: (typeof stock)[0] = $derived(stock[0]);
  let selectedItemForEdit: (typeof stock)[0] = $derived(stock[0]);
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
      <AuthzFilter allowRole={["*-ph-manager"]}>
        <th>تعديل</th>
        <th>إضافة</th>
      </AuthzFilter>
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
          </td>
          <td>{item.batch_number}</td>
          <td>
            {#if item.expiry_date}
              {formatDate(item.expiry_date)}
            {/if}
          </td>
          <AuthzFilter allowRole={["*-ph-manager"]}>
            <td>
              {#if item.qty !== null}
                <button
                  type="button"
                  class="edit btn"
                  title="تعديل"
                  command="show-modal"
                  commandfor="edit-stock"
                  onclick={() => (selectedItemForEdit = item)}>
                  <EditIcon size="1rem" />
                </button>
              {/if}
            </td>

            <td>
              <button
                type="button"
                class="add btn"
                title="إضافة رصيد"
                command="show-modal"
                commandfor="add-stock"
                onclick={() => (selectedItemForAddition = item)}>
                <AddIcon size="1rem" />
              </button>
            </td>
          </AuthzFilter>
        </tr>
      {/each}
    {:else}
      <tr>
        <td colspan="10">لا يوجد مخزون للصيدلية</td>
      </tr>
    {/if}
  </tbody>
</table>

<AuthzFilter allowRole={["*-ph-manager"]}>
  <EditStock item={selectedItemForEdit} />
  <AddStock item={selectedItemForAddition} />
</AuthzFilter>

<style>
  th,
  td {
    border: var(--main-border);
    padding: 0.25rem 0.5rem;
  }

  .edit.btn {
    --bg: gold;
    height: 1.5rem;
    margin-inline-start: 0.5rem;
  }

  .add.btn {
    --bg: green;
    height: 1.5rem;
    margin-inline-start: 0.5rem;
  }
</style>
