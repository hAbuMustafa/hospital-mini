<script lang="ts">
  import { toast } from "svelte-sonner";
  import { setSystemFirstDay, startSeed } from "../../admin.remote";
  import { formatDate, getDuration, getTermed } from "$lib/date/utils";
  import { getSystemFirstDate } from "../../../CONSTANTS.remote";
  import Dialog from "$lib/components/Dialog.svelte";
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

<button type="button" command="show-modal" commandfor="seed-dialog" class="btn yellow">
  🌱 تغذية قاعدة البيانات
</button>

<Dialog id="seed-dialog">
  <div class="question-wrapper">
    <div class="question">
      هل أنت متأكد من رغبتك في <em><strong>حذف بيانات المرضى</strong></em> وإعادة إدخالها؟
    </div>
    <div class="options">
      <button type="button" command="close" commandfor="seed-dialog" class="btn">
        لا
      </button>

      <form
        {...startSeed.enhance(async (form) => {
          (document.getElementById("seed-dialog") as HTMLDialogElement)?.close();

          const { promise, resolve, reject } = Promise.withResolvers();

          toast.promise(promise, {
            loading: "جار تغذية قاعدة البيانات..",
            success: (msg) => msg + "",
            error: () => {
              form.fields.allIssues()?.forEach((issue) => {
                toast.warning(issue.message);
              });
              return "حدث خطأ أثناء التغذية";
            },
          });

          await form.submit();

          if (form.fields.allIssues()?.length) {
            reject();
          } else {
            resolve(form.result);
          }
        })}
      >
        <button type="submit" class="btn red"> نعم </button>
      </form>
    </div>
  </div>
</Dialog>

<style>
  form {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  }

  .question-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .options {
      display: flex;
      justify-content: space-around;
    }
  }

  em {
    color: light-dark(maroon, salmon);
  }

  .btn {
    padding: 0.25rem 0.5rem;
  }

  .btn.yellow {
    --bg: gold;
    color: var(--main-text-light);
    margin-block-start: 2rem;
    min-width: 30%;
  }

  .btn.red {
    --bg: light-dark(maroon, salmon);
    color: light-dark(var(--main-text-dark), var(--main-text-light));
  }
</style>
