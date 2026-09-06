<script lang="ts">
  import { page } from "$app/state";
  import { toast } from "svelte-sonner";
  import { getTicket, returnItems } from "../../../ticket.remote";
  import { isReturnable } from "../../../utils";
  import { formatDate } from "$lib/date/utils";

  const ticketId = Number(page.params.ticketId);
  const ticketItems = getTicket(ticketId);

  let items = $derived(await ticketItems);

  const canReturn = $derived(isReturnable(items[0].timestamp!));

  let saving = $state(false);
</script>

<h1>
  ارتجاع
  <small class="ticket-number">
    (#{items[0].ticket_id})
  </small>: <span class="pii">{items[0].patient_name ?? items[0].patient_id}</span>
</h1>
<h2>{formatDate(items[0].timestamp!, "YYYY/MM/DD (HH:mm)")}</h2>

<form
  {...returnItems.enhance(async (form) => {
    try {
      saving = true;

      const { promise, resolve, reject } = Promise.withResolvers();

      toast.promise(promise, {
        success: (ticketId) => {
          ticketItems.refresh();
          return "تم حفظ المرتجع بالرقم " + ticketId;
        },
        error: (e) => {
          return "خطأ في حفظ المرتجع\n" + e;
        },
        loading: "جار حفظ المرتجع...",
      });

      await form.submit();

      if (form.result?.success) {
        resolve(form.result.ticketId);
      } else {
        reject(
          form.fields
            .allIssues()
            ?.map((iss) => iss.message)
            .join(" - \n") ??
            form.result?.error ??
            ""
        );
        form.fields.allIssues()?.forEach((iss) => {
          toast.warning(iss.message);
        });
      }
    } catch (error) {
    } finally {
      saving = false;
    }
  })}
>
  <input {...returnItems.fields.originalTicketId.as("hidden", ticketId)} />
  <table>
    <thead>
      <tr>
        <th>اسم الصنف</th>
        <th>الكمية الأصلية</th>
        <th>المتبقي</th>
        <th>إرجاع</th>
      </tr>
    </thead>
    <tbody>
      {#each items as item, i (item.item_id)}
        {@const remaining = item.qty! - (item.qty_returned ?? 0)}
        <tr>
          <td>
            <label for="item-{item.item_id}" title={item.item_tradename}
              >{item.item_name}</label
            >
            <input {...returnItems.fields.items[i].itemId.as("hidden", item.item_id!)} />
            <input
              {...returnItems.fields.items[i].itemUnitPrice.as(
                "hidden",
                item.item_unit_price!
              )}
            />
            <input
              {...returnItems.fields.items[i].transactionId.as(
                "hidden",
                item.transaction_id!
              )}
              value={item.transaction_id}
            />
          </td>
          <td>
            {item.qty}
          </td>
          <td class:highlight={remaining !== item.qty}>
            {remaining}
          </td>
          <td>
            {#if canReturn && remaining > 0}
              <input
                id="item-{item.item_id}"
                {...returnItems.fields.items[i].returnedAmount.as("number")}
                min="0"
                max={remaining}
                value="0"
              />
            {:else if canReturn && remaining === 0}
              <span class="no-return">(صرف {item.qty} وتم ارتجاع الكمية كاملة)</span>
            {:else if !canReturn}
              <span>({item.qty})</span>
              {#if item.qty !== remaining}
                <span>(المتبقي على التذكرة {item.qty})</span>
              {/if}
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if canReturn && items.some((item) => item.qty! - (item.qty_returned ?? 0) > 0)}
    <button type="submit" class="btn" disabled={saving}>حفظ المرتجع</button>
  {:else}
    <span class="no-return spanned">(التذكرة غير قابلة للارتجاع)</span>
  {/if}
</form>

<style>
  .ticket-number {
    color: gray;
    vertical-align: middle;
  }

  h1 {
    margin-block-end: 0;
  }

  h2 {
    margin-block-start: 0;
  }

  table {
    border-collapse: collapse;
    margin-block-end: 1rem;

    th,
    td {
      border: var(--main-border);
      padding: 0.25rem 0.5rem;
    }
  }

  .highlight {
    color: light-dark(maroon, salmon);
  }

  button[type="submit"] {
    inline-size: 100%;
  }

  .no-return {
    color: salmon;

    &.spanned {
      display: inline-block;
      inline-size: 100%;
      text-align: center;
    }
  }
</style>
