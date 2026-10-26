<script lang="ts">
  import AuthzFilter from "$lib/components/AuthzFilter.svelte";
  import EditIcon from "@lucide/svelte/icons/square-pen";
  import { getPharmacyStock } from "./stock.remote";
  import { formatDate } from "$lib/date/utils";
  import Dialog from "$lib/components/Dialog.svelte";

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
              <button
                type="button"
                class="edit btn"
                title="تعديل"
                command="show-modal"
                commandfor="edit-qty-{item.stock_id}">
                <EditIcon size="1rem" />
              </button>
              <Dialog id="edit-qty-{item.stock_id}">
                <h2>{item.name}</h2>
                <h3>{item.pharmacy_name}</h3>

                <!-- todo: use remote function syntax -->
                <form action="">
                  <label for="qty-{item.stock_id}">الرصيد</label>
                  <input
                    type="number"
                    name="qty-{item.stock_id}"
                    id="qty-{item.stock_id}"
                    value={item.qty} />

                  <label for="batch-{item.stock_id}">التشغيلة</label>
                  <input
                    type="text"
                    name="batch-{item.stock_id}"
                    id="batch-{item.stock_id}"
                    value={item.batch_number} />

                  <label for="expiry-{item.stock_id}">الصلاحية</label>
                  <input
                    type="date"
                    name="expiry-{item.stock_id}"
                    id="expiry-{item.stock_id}"
                    value={item.expiry_date} />

                  <input type="submit" class="btn" value="حفظ" />
                </form>
              </Dialog>
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

  .edit.btn {
    --bg: gold;
    height: 1.5rem;
    margin-inline-start: 0.5rem;
  }

  form {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 0.5rem;

    input[type="text"] {
      text-align: center;
    }

    input[type="submit"] {
      grid-column: 1/-1;
    }
  }
</style>
