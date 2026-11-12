<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import RejectIcon from "@lucide/svelte/icons/x";
  import {
    acceptTransferItem,
    getPendingTransfers,
    rejectTransferItem,
  } from "../stock.remote";
  import { authState } from "$lib/auth-client/auth.svelte";
  import { toast } from "svelte-sonner";
  import type { ValidationError } from "@sveltejs/kit";
  import { formatDate } from "$lib/date/utils";

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
          <th>تشغيلة</th>
          <th>صلاحية</th>
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
            <td class="mono">{transfer.batch_number}</td>
            <td>
              {#if transfer.expiry_date}
                {formatDate(transfer.expiry_date, "YYYY/MM/DD")}
              {/if}
            </td>
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
            {#if (authState.user?.role === "admin" || authState.user?.affiliation === transfer.to_pharmacy_id) && transfer.status === null}
              <td>
                <button
                  type="button"
                  class="btn"
                  style:--bg="green"
                  title="قبول الصنف"
                  onclick={async () => {
                    toast.promise(acceptTransferItem(transfer.id), {
                      loading: "جار قبول الصنف من الطلبية...",
                      success: "تم قبول الصنف",
                      error: (err) => {
                        const issues = (err as ValidationError).issues;
                        if (issues?.length) {
                          for (const issue of issues) {
                            toast.error(issue.message);
                          }
                        }

                        return "حدث خطأ ما أثناء استلام الصنف";
                      },
                    });
                  }}>
                  <CheckIcon size="1rem" />
                </button>
              </td>
              <td>
                <button
                  type="button"
                  class="btn"
                  style:--bg="maroon"
                  title="رفض الصنف"
                  onclick={async () => {
                    toast.promise(rejectTransferItem(transfer.id), {
                      loading: "جار رفض الصنف من الطلبية...",
                      success: "تم رفض الصنف",
                      error: (err) => {
                        const issues = (err as ValidationError).issues;
                        if (issues?.length) {
                          for (const issue of issues) {
                            toast.error(issue.message);
                          }
                        }

                        return "حدث خطأ ما أثناء رفض الصنف";
                      },
                    });
                  }}>
                  <RejectIcon size="1rem" />
                </button>
              </td>
            {:else}
              <td colspan="2">{transfer.status_by_name}</td>
            {/if}
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
