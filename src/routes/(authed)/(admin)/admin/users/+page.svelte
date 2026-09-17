<script lang="ts">
  import { toast } from "svelte-sonner";
  import {
    changeAffiliation,
    changeRole,
    getDepartments,
    getUsers,
  } from "../../admin.remote";

  let departments = await getDepartments();
  let usersGetter = getUsers();

  let users = $derived(await usersGetter);
</script>

{#if users}
  <table>
    <thead>
      <tr>
        <th>اسم المستخدم</th>
        <th>الاسم</th>
        <th>الصلاحيات</th>
        <th>الجهة</th>
      </tr>
    </thead>
    <tbody>
      {#each users as user, i (i)}
        <tr>
          <td>{user.username}</td>
          <td>{user.name}</td>
          <td>
            <form
              {...changeRole.for(user.username!).enhance(async (form) => {
                const { promise, resolve, reject } = Promise.withResolvers();

                toast.promise(promise, {
                  success: () => {
                    usersGetter.refresh();

                    return `تم تغيير صلاحيات ${user.displayUsername}`;
                  },
                  error: (err) => (err as unknown as { message: string }).message,
                  loading: `جار تعديل صلاحيات ل${user.displayUsername}...`,
                });

                if (await form.submit()) {
                  resolve(form.result);
                } else {
                  reject(form.result?.error);
                }
              })}
            >
              <input
                {...changeRole.for(user.username!).fields.userId.as("hidden", user.id!)}
              />
              <input
                dir="ltr"
                {...changeRole.for(user.username!).fields.role.as("text", user.role!)}
              />
            </form>
          </td>
          <td>
            {#if user.role !== "admin"}
              <form {...changeAffiliation.for(user.username!)}>
                <input
                  {...changeAffiliation
                    .for(user.username!)
                    .fields.userId.as("hidden", user.id)}
                />
                <select
                  {...changeAffiliation
                    .for(user.username!)
                    .fields.departmentId.as("select")}
                  value={user.affiliation}
                  onchange={async () => {
                    const form = changeAffiliation.for(user.username!);

                    const { promise, resolve, reject } = Promise.withResolvers();

                    toast.promise(promise, {
                      success: () => {
                        usersGetter.refresh();

                        return `تم تغيير جهة عمل ${user.displayUsername}`;
                      },
                      error: "حدث خطأ أثناء تغيير جهة عمل " + user.displayUsername,
                      loading: `جار تعديل جهة عمل ${user.displayUsername}...`,
                    });

                    if (await form.submit()) {
                      resolve(form.result);
                    } else {
                      reject();
                    }
                  }}
                >
                  {#each departments as dep, j (j)}
                    <option value={dep.id}>{dep.name}</option>
                  {/each}
                </select>
              </form>
            {/if}
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
</style>
