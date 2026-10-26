<script lang="ts">
  import AddIcon from "@lucide/svelte/icons/circle-plus";

  import Dialog from "$lib/components/Dialog.svelte";
  import { addStock, type getPharmacyStock } from "./stock.remote";
  import { toast } from "svelte-sonner";
  import AuthzFilter from "$lib/components/AuthzFilter.svelte";
  import { getDepartments } from "../(admin)/admin.remote";

  type PropsT = {
    item: Awaited<ReturnType<typeof getPharmacyStock>>[0];
  };

  const { item }: PropsT = $props();

  const formName = $derived(`add-${item.id}`);

  let dialog: HTMLDialogElement | undefined = $state();
</script>

<button
  type="button"
  class="add btn"
  title="إضافة رصيد"
  command="show-modal"
  commandfor="add-qty-{item.stock_id}">
  <AddIcon size="1rem" />
</button>

<Dialog id="add-qty-{item.stock_id}">
  <h2>{item.name}</h2>
  <h3>{item.pharmacy_name}</h3>

  <form
    {...addStock.for(formName).enhance(async (form) => {
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
      <label for="add-pharmacy-id-{item.id}">الصيدلية</label>
      <select
        id="add-pharmacy-id-{item.id}"
        {...addStock.for(formName).fields.pharmacy_id}>
        {#each await getDepartments() as dep, i (i)}
          <option value={dep.id} disabled={item.pharmacy_id === dep.id}
            >{dep.name}</option>
        {/each}
      </select>
    </AuthzFilter>

    <label for="add-qty-{item.id}">الرصيد</label>
    <input
      {...addStock.for(formName).fields.qty.as("number", item.qty ?? 0)}
      id="add-qty-{item.id}" />

    <label for="add-batch-{item.id}">التشغيلة</label>
    <input
      {...addStock.for(formName).fields.batch_number.as("text", "")}
      id="add-batch-{item.id}" />

    <label for="add-expiry-{item.id}">الصلاحية</label>
    <input
      {...addStock.for(formName).fields.expiry_date.as("date", "")}
      id="add-expiry-{item.id}" />

    <input type="submit" class="btn" value="حفظ" />
  </form>
</Dialog>

<style>
  .add.btn {
    --bg: green;
    height: 1.5rem;
    margin-inline-start: 0.5rem;
  }

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
