<script lang="ts">
  import { toast } from "svelte-sonner";
  import { setSystemFirstDay } from "../../admin.remote";
  import { formatDate } from "$lib/date/utils";
  import { getSystemFirstDate } from "../../../CONSTANTS.remote";
</script>

<form
  {...setSystemFirstDay.enhance(async (form) => {
    toast.promise(form.submit(), {
      success: "تم تغيير تاريخ أول يوم عمل للنظام",
      error: "حدث خطأ ما",
      loading: "جاري تحديث تاريخ بداية عمل النظام...",
    });
  })}
>
  <label for="first-date">تاريخ بداية النظام</label>
  <input
    id="first-date"
    {...setSystemFirstDay.fields.date.as("date", formatDate(await getSystemFirstDate()))}
  />
  <input class="btn" type="submit" value="حفظ" />
</form>

<style>
  form {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  }
</style>
