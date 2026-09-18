<script lang="ts">
  import { formatDate } from "$lib/date/utils";
  import { isReturnable } from "../../routes/(authed)/pharmacy/utils";
  import TicketNumber from "./TicketNumber.svelte";

  type PropsT = {
    ticket: {
      id: number;
      timestamp: Date;
      patient_id: string | null;
      patient_name: string | null;
      is_dispense: boolean;
      user_name: string | null;
    };
    items: {
      ticket_id: number | null;
      item_id: number | null;
      item_name: string | null;
      item_tradename: string | null;
      qty: number;
      qty_returned: number | null;
    }[];
    dateOnly?: boolean;
  };
  const { ticket, items, dateOnly = false }: PropsT = $props();

  const isReturn = $derived(!ticket?.is_dispense);
  const canReturn = $derived(!isReturn && isReturnable(ticket.timestamp));
</script>

<div class="ticket" class:return={isReturn}>
  <div class="ticket-data">
    <h3>
      {#if ticket.patient_name}
        <span class="pii">
          <span>
            <a href="/patient/{ticket.patient_id}">{ticket?.patient_name}</a>
          </span>
          <span>({ticket?.patient_id})</span>
        </span>
      {:else}
        <span class="pii">
          {ticket.patient_id}
          <small>(مريض غير مسجل)</small>
        </span>
      {/if}
      {#if canReturn && items.some((item) => item.qty - (item.qty_returned ?? 0) > 0)}
        <a href="/pharmacy/ticket/{ticket.id}/return" class="btn">ارتجاع</a>
      {/if}
      <span class="ticket-numbers">
        <span class="ticket-time">
          {dateOnly
            ? formatDate(ticket?.timestamp, "HH:mm")
            : formatDate(ticket?.timestamp, "YYYY/MM/DD (HH:mm)")}
        </span>
        <TicketNumber number={ticket?.id} />
      </span>
    </h3>
  </div>

  <ul class="items">
    {#each items as item, j (item.item_id)}
      <li>
        <span class="item-qty">{item.qty}</span>
        <span class="item-name" title={item.item_tradename}>{item.item_name}</span>
        {#if item.qty_returned}
          <span class="returned">(تم ارتجاع {item.qty_returned})</span>
        {/if}
      </li>
    {/each}
  </ul>
  <div class="signature"><span class="pii">{ticket?.user_name}</span></div>
</div>

<style>
  .ticket {
    width: 100%;
    padding: 1rem 0.5rem;
    border: var(--main-border);
    border-radius: 4px;

    &.return {
      background-color: light-dark(hsl(from salmon h s 80%), hsl(from salmon h s 10%));
      position: relative;

      &::after {
        content: "مرتجع";
        position: absolute;
        inset-block-start: 0;
        inset-inline-end: 95%;
        padding: 0.25rem 0.5rem;
        background-color: orange;
        color: var(--main-bg-dark);
        font-weight: bolder;
        transform: rotate(45deg);
        border-radius: 4px;
      }
    }

    h3 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;

      a {
        color: inherit;
        text-decoration: none;

        &:hover,
        &:focus {
          background-color: var(--main-accent-color);
        }
      }

      .ticket-numbers {
        font-size: 0.9rem;

        .ticket-time {
          background-color: hsl(from var(--main-bg-color) h s 40%);
          border-radius: 4px;
          padding: 0.15rem;
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
