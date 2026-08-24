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
  </small>: {items[0].patient_name ?? items[0].patient_id}
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
  <ul>
    {#each items as item, i (item.item_id)}
      {@const remaining = item.qty! - (item.qty_returned ?? 0)}
      <li>
        <span title={item.item_tradename}>{item.item_name}</span>
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
        {#if canReturn && remaining > 0}
          <input
            {...returnItems.fields.items[i].returnedAmount.as("number")}
            min="0"
            max={remaining}
            value="0"
          />
          <small>(متبقي {remaining} من {item.qty})</small>
        {:else if canReturn && remaining === 0}
          <span class="no-return">(صرف {item.qty} وتم ارتجاع الكمية كاملة)</span>
        {:else if !canReturn}
          <span>({item.qty})</span>
          {#if item.qty !== remaining}
            <span>(المتبقي على التذكرة {item.qty})</span>
          {/if}
        {/if}
      </li>
    {/each}
  </ul>
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

  ul {
    list-style: none;
    padding-inline: 0;

    display: flex;
    flex-direction: column;

    li {
      display: flex;
      align-items: space-between;
      gap: 0.5rem;
    }
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
