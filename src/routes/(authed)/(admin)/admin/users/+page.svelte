<script lang="ts">
  import { toast } from "svelte-sonner";
  import { changeAffiliation, getDepartments, getUsers } from "../../admin.remote";

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
            <form>
              <input />
            </form>
          </td>
          <td>
            {#if user.role !== "admin"}
              <form
                {...changeAffiliation.for(user.username!).enhance(async (form) => {
                  const { promise, resolve, reject } = Promise.withResolvers();

                  toast.promise(promise, {
                    success: () => {
                      usersGetter.refresh();

                      return `تم تغيير الجهة`;
                    },
                    error: (err) => (err as unknown as { message: string }).message,
                    loading: "جار تعديل جهة العمل للمستخدم...",
                  });

                  if (await form.submit()) {
                    resolve(form.result);
                  } else {
                    reject(form.result?.error);
                  }
                })}
              >
                <select
                  {...changeAffiliation
                    .for(user.username!)
                    .fields.departmentId.as("select", user.affiliation!)}
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
</style>
