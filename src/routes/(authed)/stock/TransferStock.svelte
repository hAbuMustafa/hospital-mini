<script lang="ts">
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { transferStock, type getPharmacyStock } from "./stock.remote";
  import Boxes from "@lucide/svelte/icons/boxes-linked";
  import Bin from "@lucide/svelte/icons/trash";
  import Dialog from "$lib/components/Dialog.svelte";
  import { getStockDepartments } from "../(admin)/admin.remote";
  import { formatDate } from "$lib/date/utils";
  import { toast } from "svelte-sonner";
  import { fly } from "svelte/transition";

  type StockItemT = Awaited<ReturnType<typeof getPharmacyStock>>[number];

  type PropsT = {
    items: SvelteSet<StockItemT>;
    pharmacyId: number;
  };

  const { items = $bindable(), pharmacyId }: PropsT = $props();

  const pharmacies = await getStockDepartments();

  const quantities = $state(new SvelteMap<number, number>());
</script>

<button
  type="button"
  class="cart-button"
  command="show-modal"
  commandfor="transfer-cart"
  title="فتح الطبية"
  transition:fly={{ x: -100 }}>
  <Boxes color="gray" />
  <span class="badge">{items.size}</span>
</button>

<Dialog id="transfer-cart">
  <h3>طلبية صرف</h3>

  <form
    {...transferStock.enhance(async (form) => {
      (document.getElementById("transfer-cart") as HTMLDialogElement)?.close();

      const { promise, resolve, reject } = Promise.withResolvers();

      toast.promise(promise as Promise<typeof form.result>, {
        success: (ticketId) => `تم تسجيل الطلبية بالرقم ${ticketId}`,
        loading: "جار حفظ الطلبية...",
      });

      await form.submit();

      if (form.result?.success) {
        resolve(form.result.transferTicketId);
        items.clear();
        quantities.clear();
      } else {
        reject();
        form.fields.allIssues()?.forEach((issue) => {
          toast.error(issue.message);
        });
      }
    })}>
    <label
      >رقم الطلبية:
      <input {...transferStock.fields.record_id.as("number")} />
    </label>

    <label>
      تحويل إلى:
      <select {...transferStock.fields.to_pharmacy_id.as("select")}>
        {#each pharmacies as pharmacy, i (pharmacy.id)}
          {#if pharmacy.id !== pharmacyId}
            <option value={`${pharmacy.id}`} disabled={pharmacy.id === pharmacyId}>
              {pharmacy.name}
            </option>
          {/if}
        {/each}
      </select>
    </label>

    <table>
      <thead>
        <tr>
          <th>الكمية</th>
          <th>الصنف</th>
          <th>التشغيلة</th>
          <th>الصلاحية</th>
          <th>السعر</th>
          <th>الإجمالي</th>
          <th>حذف</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item, i (item.stock_id)}
          <tr>
            <td>
              <input
                {...transferStock.fields.items[i].stock_id.as(
                  "hidden",
                  item.stock_id!
                )} />
              <input
                id="transfer-item-{item.stock_id}-qty"
                {...transferStock.fields.items[i].qty.as(
                  "number",
                  quantities.get(item.stock_id!) ?? 0
                )}
                bind:value={
                  () => quantities.get(item.stock_id!),
                  (v) => quantities.set(item.stock_id!, v ?? 0)
                }
                max={item.qty}
                min="0" />
            </td>
            <td>
              <label for="transfer-item-{item.stock_id}-qty">
                {item.name}
              </label>
            </td>
            <td>
              {item.batch_number}
            </td>
            <td>
              {#if item.expiry_date}
                {formatDate(item.expiry_date, "YYYY/MM/DD")}
              {/if}
            </td>
            <td>{item.unit_price?.toFixed(3)}</td>
            <td
              >{(item.unit_price! * (quantities.get(item.stock_id!) ?? 0)).toFixed(
                3
              )}</td>
            <td>
              <button
                type="button"
                onclick={() => {
                  items.delete(item);
                }}>
                <Bin color="light-dark(maroon, salmon)" size="1rem" />
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <button type="submit" class="btn">تسجيل الطلبية</button>
  </form>

  <dl>
    <dt><strong>إجمالي قيمة الطلبية:</strong></dt>
    <dd>
      {items
        .values()
        .reduce(
          (tally, current) =>
            tally + current.unit_price! * (quantities.get(current.stock_id!) ?? 0),
          0
        )
        .toFixed(3)} جنيه مصري
    </dd>
  </dl>
</Dialog>

<style>
  .cart-button {
    background-color: gold;
    padding-inline-end: 16px;
    padding-block: 16px;
    border: currentColor;
    border-radius: 4px;

    position: fixed;
    inset-inline-end: -12px;
    inset-block-start: 50dvh;

    transition: inset 0.25s ease-in-out;

    &:hover,
    &:focus {
      inset-inline-end: -4px;
    }

    .badge {
      color: white;
      background-color: red;
      border-radius: 50%;
      padding: 2px 6px;

      position: absolute;
      inset-block-start: -8px;
      inset-inline-start: -8px;
    }
  }

  h3 {
    text-align: center;
  }

  form {
    display: grid;
    gap: 1rem;
  }

  th,
  td {
    border: 1px solid currentColor;
    padding: 0.25rem 0.5rem;
  }

  td > input {
    box-sizing: border-box;
    width: 100%;
  }

  dl {
    display: flex;
    gap: 1rem;

    justify-content: center;

    dd {
      margin: 0;
    }
  }
</style>
