<script lang="ts">
  import { formatDate } from "$lib/date/utils";
  import { isReturnable } from "../../routes/(authed)/pharmacy/utils";

  type PropsT = {
    items: any[];
    dateOnly: boolean;
  };
  const { items, dateOnly }: PropsT = $props();

  const ticket = $derived(items?.[0]);
  const isReturn = $derived(!ticket?.is_dispense);
  const canReturn = $derived(!isReturn && isReturnable(ticket.timestamp));
</script>

<div class="ticket" class:return={isReturn}>
  <div class="ticket-data">
    <h3>
      {ticket?.patient_name} ({ticket?.patient_id})
      <span class="ticket-numbers">
        <span class="ticket-time">
          {dateOnly
            ? formatDate(ticket?.timestamp!, "HH:mm")
            : formatDate(ticket?.timestamp!, "YYYY/MM/DD (HH:mm)")}
        </span>
        <span class="ticket-id">&#x23;{ticket?.ticket_id}</span>
      </span>

      {#if canReturn}
        <a href="/pharmacy/tickets/return/{ticket.ticket_id}" class="btn">ارتجاع</a>
      {/if}
    </h3>
  </div>

  <ul class="items">
    {#each items as item, j (item.item_id)}
      <li>
        <span class="item-qty">{Math.abs(item.qty!)}</span>
        <span class="item-name" title={item.item_tradename}>{item.item_name}</span>
        {#if item.qty_returned}
          <span class="returned">(تم ارتجاع {item.qty_returned})</span>
        {/if}
      </li>
    {/each}
  </ul>
  <div class="signature">{ticket?.user_name}</div>
</div>

<style>
  .ticket {
    width: 100%;
    padding: 1rem 0.5rem;
    border: var(--main-border);
    border-radius: 4px;

    &.return {
      background-color: hsl(from salmon h s 40%);
    }

    h3 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;

      .ticket-numbers {
        font-size: 0.9rem;

        .ticket-time {
          background-color: hsl(from var(--main-bg-color) h s 40%);
          border-radius: 4px;
          padding: 0.15rem;
        }

        .ticket-id {
          color: gray;
        }
      }
    }

    ul.items {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0;
      margin: 0.5rem 0;

      li {
        margin-inline-start: 1rem;
      }

      .item-qty {
        background-color: var(--main-text-color);
        color: var(--main-bg-color);
        border-radius: 4px;
        padding: 0.05rem 0.25rem;
      }

      .returned {
        color: salmon;
      }
    }

    .signature {
      border-block-start: var(--main-border);
      padding-block-start: 0.5rem;
      text-align: end;
    }
  }
</style>
