<script lang="ts">
  import { toast } from "svelte-sonner";
  import {
    getNotUploadedNarcoticTickets,
    retryNarcoticUpload,
  } from "./(authed)/pharmacy/dispense-report/transactions.remote";
  import type { RemoteFormIssue } from "@sveltejs/kit";

  const items = getNotUploadedNarcoticTickets();
</script>

<h2>تذاكر المخدرات التي لم يتم رفعها</h2>
{#await items}
  <p>جار جلب المخدرات التي لم يتم حفظها في البيان المركزي...</p>
{:then rows}
  {#if rows.length}
    <table>
      <colgroup>
        <col />
        <col />
        <col />
        <col />
        <col />
        <col style="width: 3rem;" />
      </colgroup>

      <thead>
        <tr>
          <th>تذكرة</th>
          <th>الملف</th>
          <th>المريض</th>
          <th>الصنف</th>
          <th>الكمية</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each rows as dispense, i (dispense.id)}
          <tr>
            <td>{dispense.ticket_id}</td>
            <td>{dispense.patient_id}</td>
            <td>{dispense.patient_name}</td>
            <td>{dispense.item_name}</td>
            <td>{-dispense.qty}</td>
            <td>
              <form
                {...retryNarcoticUpload.enhance(async (form) => {
                  const { promise, resolve, reject } = Promise.withResolvers();

                  toast.promise(promise, {
                    success: () => {
                      items.refresh();

                      return `تم حفظ التذكرة رقم ${dispense.ticket_id} في البيان المركزي بنجاح`;
                    },
                    error: (err) => {
                      (err as RemoteFormIssue[] | undefined)?.forEach((issue) => {
                        toast.warning(issue.message);
                      });

                      return "لم يتم رفع التذكرة";
                    },
                    loading: "جار رفع التذكرة...",
                  });

                  await form.submit();

                  if (form.result?.success) {
                    resolve(true);
                  } else {
                    reject(form.fields.allIssues());
                  }
                })}
              >
                <input {...retryNarcoticUpload.fields.id.as("hidden", dispense.id)} />
                <button type="submit" class="btn">رفع</button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>لا يوجد تذاكر مخدرات لم يتم رفعها</p>
  {/if}
{/await}

<style>
  table {
    border-collapse: collapse;
  }

  td,
  th {
    border: var(--main-border);

    &:not(:has(button)) {
      padding-inline: 0.5rem;
    }
  }

  button {
    width: 100%;
  }
</style>
