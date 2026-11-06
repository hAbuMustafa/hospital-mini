<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import RejectIcon from "@lucide/svelte/icons/x";
  import { getPendingTransfers } from "../stock.remote";
  import { authState } from "$lib/auth-client/auth.svelte";

  const transfers = $derived(await getPendingTransfers());

  const groupedTransfers = $derived(Object.groupBy(transfers, (item) => item.ticket_id!));
</script>

<h1>استلام وارد</h1>

{#if transfers.length}
  {#each Object.entries(groupedTransfers) as [ticketId, gTransfers], j (ticketId)}
    <h2>طلبية رقم {gTransfers![0].record_id}</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>من</th>
          <th>إلى</th>
          <th>الصنف</th>
          <th>الكمية</th>
          <th>الحالة</th>
          <th>قبول</th>
          <th>رفض</th>
        </tr>
      </thead>
      <tbody>
        {#each gTransfers as transfer, i (transfer.id)}
          <tr
            class:incoming={transfer.to_pharmacy_id === authState.user?.affiliation}
            class:outgoing={transfer.from_pharmacy_id === authState.user?.affiliation}>
            <td title="رقم الطلبية في الدفتر">{transfer.record_id}</td>
            <td>{transfer.from_pharmacy_name}</td>
            <td>{transfer.to_pharmacy_name}</td>
            <td>{transfer.drug_name}</td>
            <td>{transfer.qty}</td>
            <td
              class="status"
              class:pending={transfer.status === null}
              class:accepted={transfer.status === true}
              class:rejected={transfer.status === false}>
              {#if transfer.status === null}
                معلق
              {:else if transfer.status}
                مقبول
              {:else}
                مرفوض
              {/if}
            </td>
            <td>
              {#if (authState.user?.role === "admin" || authState.user?.affiliation === transfer.to_pharmacy_id) && transfer.status === null}
                <button
                  type="button"
                  class="btn"
                  style:--bg="green"
                  title="قبول الصنف"
                  onclick={() => {
                    // todo: fire accept command on `transfer.id`
                  }}>
                  <CheckIcon size="1rem" />
                </button>
              {/if}
            </td>
            <td>
              {#if (authState.user?.role === "admin" || authState.user?.affiliation === transfer.to_pharmacy_id) && transfer.status === null}
                <button
                  type="button"
                  class="btn"
                  style:--bg="maroon"
                  title="رفض الصنف"
                  onclick={() => {
                    // todo: fire reject command on `transfer.id`
                  }}>
                  <RejectIcon size="1rem" />
                </button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/each}
{:else}
  <p>لا توجد تحويلات</p>
{/if}

<style>
  th,
  td {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--main-text-color);
  }

  tr.outgoing {
    background-color: alpha(from green / 0.2);
  }

  tr.incoming {
    background-color: alpha(from salmon / 0.2);
  }

  .status {
    background-color: var(--bg);
    color: contrast-color(var(--bg));
  }

  .status.pending {
    --bg: gold;
  }

  .status.accepted {
    --bg: green;
  }

  .status.rejected {
    --bg: red;
  }
</style>
