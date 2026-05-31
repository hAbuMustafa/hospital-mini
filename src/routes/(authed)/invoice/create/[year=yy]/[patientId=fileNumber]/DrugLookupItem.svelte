<script lang="ts">
  import { toast } from "svelte-sonner";
  import { invoiceData } from "./state.svelte";

  type PropsT = { drug: DrugT };

  let { drug }: PropsT = $props();

  function selectDrug(item: InvoiceSelectedDrugT) {
    const foundItemIndexInList = invoiceData.selectedDrugs.findIndex(
      (d) => d.id === item.id
    );
    if (foundItemIndexInList > -1) {
      invoiceData.selectedDrugs[foundItemIndexInList].amount++;
      toast.info(
        `الصنف مضاف سابقا في السطر ${foundItemIndexInList + 1} تم زيادة الكمية لتصبح ${invoiceData.selectedDrugs[foundItemIndexInList].amount}`
      );
      return;
    }

    item.amount = 1;
    item.total = () => item.amount * (item.price_resale ?? 0);
    item.editable = true;
    invoiceData.selectedDrugs.push(item);
  }
</script>

<button
  type="button"
  class="drug-select"
  onclick={() => selectDrug(drug as InvoiceSelectedDrugT)}
>
  <strong class="name-ar">{drug.name_ar}</strong>
  <span class="name">{drug.tradename_ar}</span>
  <span class="price">{drug.price_resale?.toFixed(3)} جنيه</span>
</button>

<style>
  button.drug-select {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
