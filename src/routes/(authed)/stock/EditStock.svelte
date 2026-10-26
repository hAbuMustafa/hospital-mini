<script lang="ts">
  import EditIcon from "@lucide/svelte/icons/square-pen";

  import Dialog from "$lib/components/Dialog.svelte";
  import { editStock, type getPharmacyStock } from "./stock.remote";
  import { toast } from "svelte-sonner";

  type PropsT = {
    item: Awaited<ReturnType<typeof getPharmacyStock>>[0];
  };

  const { item }: PropsT = $props();

  const formName = $derived(`edit-${item.stock_id}`);

  let dialog: HTMLDialogElement | undefined = $state();
</script>

<button
  type="button"
  class="edit btn"
  title="تعديل"
  command="show-modal"
  commandfor="edit-qty-{item.stock_id}">
  <EditIcon size="1rem" />
</button>

<Dialog id="edit-qty-{item.stock_id}" bind:dialog>
  <h2>{item.name}</h2>
  <h3>{item.pharmacy_name}</h3>

  <form
    {...editStock.for(formName).enhance(async (form) => {
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
    <input {...editStock.for(formName).fields.stock_id.as("hidden", item.stock_id!)} />
    <label for="qty-{item.stock_id}">الرصيد</label>
    <input
      {...editStock.for(formName).fields.qty.as("number", item.qty ?? 0)}
      id="qty-{item.stock_id}" />

    <label for="batch-{item.stock_id}">التشغيلة</label>
    <input
      {...editStock.for(formName).fields.batch_number.as("text", item.batch_number ?? "")}
      id="batch-{item.stock_id}" />

    <label for="expiry-{item.stock_id}">الصلاحية</label>
    <input
      {...editStock
        .for(formName)
        .fields.expiry_date.as(
          "date",
          item.expiry_date?.toISOString().slice(0, 10) ?? ""
        )}
      id="expiry-{item.stock_id}" />

    <input type="submit" class="btn" value="حفظ" />
  </form>
</Dialog>

<style>
  .edit.btn {
    --bg: gold;
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
