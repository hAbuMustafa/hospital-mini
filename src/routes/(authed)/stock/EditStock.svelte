<script lang="ts">
  import Dialog from "$lib/components/Dialog.svelte";
  import { editStock, type getPharmacyStock } from "./stock.remote";
  import { toast } from "svelte-sonner";

  type PropsT = {
    item: Awaited<ReturnType<typeof getPharmacyStock>>[0];
  };

  const { item }: PropsT = $props();

  let dialog: HTMLDialogElement | undefined = $state();
</script>

<Dialog id="edit-stock" bind:dialog>
  <h2>{item.name}</h2>
  <h3>{item.pharmacy_name}</h3>

  <form
    {...editStock.enhance(async (form) => {
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
    <input {...editStock.fields.stock_id.as("hidden", item.stock_id!)} />
    <label for="edit-qty">الرصيد</label>
    <input {...editStock.fields.qty.as("number", item.qty ?? 0)} id="edit-qty" />

    <label for="edit-batch">التشغيلة</label>
    <input
      {...editStock.fields.batch_number.as("text", item.batch_number ?? "")}
      id="edit-batch" />

    <label for="edit-expiry">الصلاحية</label>
    <input
      {...editStock.fields.expiry_date.as(
        "date",
        item.expiry_date?.toISOString().slice(0, 10) ?? ""
      )}
      id="edit-expiry" />

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
