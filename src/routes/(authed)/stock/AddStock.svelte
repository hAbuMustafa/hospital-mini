<script lang="ts">
  import Dialog from "$lib/components/Dialog.svelte";
  import { addStock, type getPharmacyStock } from "./stock.remote";
  import { toast } from "svelte-sonner";
  import AuthzFilter from "$lib/components/AuthzFilter.svelte";
  import { getDepartments } from "../(admin)/admin.remote";

  type PropsT = {
    item: Awaited<ReturnType<typeof getPharmacyStock>>[0];
  };

  const { item }: PropsT = $props();

  let dialog: HTMLDialogElement | undefined = $state();
</script>

<Dialog id="add-stock">
  <h2>{item.name}</h2>

  <form
    {...addStock.enhance(async (form) => {
      const { promise, resolve, reject } = Promise.withResolvers();

      toast.promise(promise as Promise<typeof form.result>, {
        loading: `جار تعديل بيانات ${item.name} في ${item.pharmacy_name}...`,
        success: "تم التعديل",
        error: () => {
          form.fields.allIssues()?.forEach((issue) => {
            toast.error(issue.message);
          });
          return "حدث خطأ أثناء التعديل";
        },
      });

      if (await form.submit()) {
        resolve(true);
      } else {
        reject();
      }

      dialog?.close();
    })}>
    <AuthzFilter>
      <label for="add-pharmacy-id">الصيدلية</label>
      <select id="add-pharmacy-id" {...addStock.fields.pharmacy_id.as("select")}>
        {#each await getDepartments() as dep, i (i)}
          <option value={String(dep.id)} disabled={item.pharmacy_id === dep.id}
            >{dep.name}</option>
        {/each}
      </select>
    </AuthzFilter>

    <input {...addStock.fields.drug_id.as("hidden", item.id)} />

    <label for="add-qty">الرصيد</label>
    <input {...addStock.fields.qty.as("number", 0)} id="add-qty" />

    <label for="add-batch">التشغيلة</label>
    <input {...addStock.fields.batch_number.as("text", "")} id="add-batch" />

    <label for="add-expiry">الصلاحية</label>
    <input {...addStock.fields.expiry_date.as("date", "")} id="add-expiry" />

    <input type="submit" class="btn" value="حفظ" />
  </form>
</Dialog>

<style>
  form {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 0.5rem;

    input[type="text"] {
      text-align: center;
    }

    input[type="submit"] {
      grid-column: 1/-1;
    }
  }
</style>
