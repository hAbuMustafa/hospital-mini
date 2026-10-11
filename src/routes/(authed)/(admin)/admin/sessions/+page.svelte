<script lang="ts">
  import { toast } from "svelte-sonner";
  import { getSessions, deleteSession } from "../../admin.remote";
  import { formatDate } from "$lib/date/utils";
  import { authState } from "$lib/auth-client/auth.svelte";
  import Trash from "@lucide/svelte/icons/trash";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import Dialog from "$lib/components/Dialog.svelte";

  let sessions = $derived(await getSessions());
</script>

{#if sessions}
  <table>
    <thead>
      <tr>
        <th></th>
        <th>المستخدم</th>
        <th>من</th>
        <th>إلى</th>
        <th>آخر دخول</th>
        <th>تفاصيل</th>
      </tr>
    </thead>
    <tbody>
      {#each sessions as session, i (i)}
        <tr class:expired={new Date() > session.expiresAt}>
          <td>
            {#if session.userId !== authState.user?.id}
              <button
                type="button"
                title="حذف الجلسة"
                onclick={async () => {
                  deleteSession(session.id);
                }}
              >
                <Trash color="salmon" />
              </button>
            {:else}
              أنا
            {/if}
          </td>
          <td>{session.user_name}</td>
          <td>{formatDate(session.createdAt, "YYYY/MM/DD (HH:mm)")}</td>
          <td>{formatDate(session.expiresAt, "YYYY/MM/DD (HH:mm)")}</td>
          <td>{formatDate(session.updatedAt, "YYYY/MM/DD (HH:mm)")}</td>
          <td>
            <button
              type="button"
              title="تفاصيل الجلسة"
              command="show-modal"
              commandfor="{session.id}-data"
            >
              <Ellipsis />
            </button>
            <Dialog id="{session.id}-data">
              <dl>
                <dt>معرف الجلسة</dt>
                <dd>{session.id}</dd>
                <dt>التذكرة</dt>
                <dd>{session.token}</dd>
                <dt>عنوان IP</dt>
                <dd>{session.ipAddress}</dd>
                <dt>المتصفح</dt>
                <dd>{session.userAgent}</dd>
              </dl>
            </Dialog>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  th,
  td {
    padding: 0.25rem 0.5rem;
    border: var(--main-border);
  }

  tr.expired {
    background-color: salmon;
  }

  dl {
    display: grid;
    grid-template-columns: 1fr 4fr;
    gap: 1rem;
  }

  dt {
    font-weight: bolder;
  }
</style>
