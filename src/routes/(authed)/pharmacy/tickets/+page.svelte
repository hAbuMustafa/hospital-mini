<script lang="ts">
  import { page } from "$app/state";
  import DateTimeControls from "$lib/components/DateTimeControls.svelte";
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
    ليوم {formatDate(from, "YYYY/MM/DD")}
  {:else}
    {`من ${formatDate(from, "الساعة HH:mm:ss يوم YYYY/MM/DD")} إلى ${formatDate(to, "الساعة HH:mm:ss يوم YYYY/MM/DD")}`
      .replaceAll("الساعة 00:00:00", "بداية")
      .replaceAll("الساعة 23:59:59", "نهاية")}
  {/if}
</h2>

<DateTimeControls from={urlFrom} to={urlTo} />

<div class="tickets-wrapper">
  {#each tickets as [ticketId, items], i (ticketId)}
    {@const ticket = items?.[0]}
    {@const isReturn = !ticket?.is_dispense}
    <div class="ticket" class:return={isReturn}>
      <div class="ticket-data">
        <h3>
          {ticket?.patient_name} ({ticket?.patient_id})
          <span class="ticket-numbers">
            <span class="ticket-time">
              {isWholeDay
                ? formatDate(ticket?.timestamp!, "HH:mm")
                : formatDate(ticket?.timestamp!, "YYYY/MM/DD (HH:mm)")}
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
        background-color: gray;
        border-radius: 4px;
        padding: 0.05rem 0.25rem;
      }
    }

    .signature {
      border-block-start: var(--main-border);
      padding-block-start: 0.5rem;
      text-align: end;
    }
  }
</style>
