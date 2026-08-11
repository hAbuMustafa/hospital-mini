<script lang="ts">
  import { page } from "$app/state";
  import { toast } from "svelte-sonner";
  import { getTicket, returnItems } from "../../../ticket.remote";

  const ticketId = Number(page.params.ticketId);
  const ticketItems = getTicket(ticketId);

  let items = $derived(await ticketItems);

  let saving = $state(false);
</script>

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
      {@const remaining = -item.qty! - (item.qty_returned ?? 0)}
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
        {#if remaining > 0}
          <input
            {...returnItems.fields.items[i].returnedAmount.as("number")}
            min="0"
            max={remaining}
            value="0"
          />
          <small>(متبقي {remaining} من {-item.qty!})</small>
        {:else}
          <span class="no-return">(صرف {-item.qty!} وتم ارتجاع الكمية كاملة)</span>
        {/if}
      </li>
    {/each}
  </ul>
  <button type="submit" class="btn" disabled={saving}>حفظ المرتجع</button>
</form>

<style>
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

  .no-return {
    color: salmon;
  }
</style>
