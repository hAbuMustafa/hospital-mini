<script lang="ts">
  import { page } from "$app/state";
  import { formatDate } from "$lib/date/utils";
  import { getTickets } from "../ticket.remote";

  let urlFrom = page.url.searchParams.get("f") ?? formatDate(new Date()) + "T00:00:00";
  let urlTo = page.url.searchParams.get("t") ?? formatDate(new Date()) + "T23:59:59";

  let from = $derived(new Date(urlFrom));
  let to = $derived(new Date(urlTo));

  let isWholeDay = $derived(
    formatDate(from) === formatDate(to) &&
      from.getHours() === 0 &&
      from.getMinutes() === 0 &&
      to.getHours() === 23 &&
      to.getMinutes() === 59
  );

  // svelte-ignore state_referenced_locally
  const tickets = await getTickets({ from, to });
</script>

<h1>عرض تذاكر الصرف</h1>

<h2>
  {#if isWholeDay}
    ليوم {formatDate(from)}
  {:else}
    {`من ${formatDate(from, "الساعة HH:mm:ss يوم DD/MM/YYYY")} إلى ${formatDate(to, "الساعة HH:mm:ss يوم DD/MM/YYYY")}`
      .replace("الساعة 00:00:00", "بداية")
      .replace("الساعة 23:59:59", "نهاية")}
  {/if}
</h2>

<div class="date-controls">
  <form method="GET" data-sveltekit-reload>
    <label>
      من:
      <input type="datetime-local" name="f" value={urlFrom} max={urlTo} step="1" />
    </label>

    <label>
      إلى:
      <input type="datetime-local" name="t" value={urlTo} min={urlFrom} step="1" />
    </label>
    <button type="submit">تأكيد</button>
  </form>
</div>

<div class="tickets-wrapper">
  {#each tickets as [ticketId, items], i (ticketId)}
  {const ticket = items?.[0]}
  {const isReturn = !ticket?.is_dispense}
    <div class="ticket" class:return={isReturn}>
      <div class="ticket-data">
        <h3>
          {ticket?.patient_name} ({ticket?.patient_id}) 
          <span class="ticket-numbers">
            <span class="ticket-time">
          {isWholeDay?formatDate(ticket?.timestamp!,"HH:mm"):formatDate(ticket?.timestamp!,"YYYY/MM/DD (HH:mm)")}
        </span>
        <span class="ticket-id">&#x23;{ticket?.ticket_id}</span>
      </span>
    </h3>
      </div>
  
      <ul class="items">
        {#each items as item, j (item.item_id)}
          <li>
            <span class="item-qty">{Math.abs(item.qty!)}</span>
            <span class="item-name" title={item.item_tradename}>{item.item_name}</span>
          </li>
        {/each}
      </ul>
      <div class="signature">{ticket?.user_name}</div>
    </div>
  {/each}
</div>

<style>
  .tickets-wrapper {
    margin: 1rem 10vw;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .ticket {
    width: 100%;
    padding: 1rem .5rem;
    border:var(--main-border);
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
        font-size: .9rem;

        .ticket-time {
          background-color: hsl(from var(--main-bg-color) h s 40%);
          border-radius: 4px;
          padding: .15rem;
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
        background-color: gray;
        border-radius: 4px;
        padding: 0.05rem 0.25rem;
      }
    }

    .signature {
      border-block-start: var(--main-border);
      padding-block-start: .5rem;
      text-align: end;
    }
  }
</style>