<script lang="ts">
  import { enhance } from "$app/forms";
  import { authState } from "$lib/auth-client/auth.svelte";
  import { goto } from "$app/navigation";
  import { triadicArabicName } from "$lib/utils/patterns";
  import { toast } from "svelte-sonner";

  $effect(() => {
    if (authState.isAuthenticated) goto("/");
  });
</script>

<h1>إنشاء حساب</h1>

<form
  method="post"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === "success") {
        toast.success("تم تسجيل الحساب بنجاح. يمكنك الآن تسجيل الدخول");
        goto("/login");
      } else if (result.type === "failure") {
        toast.error((result.data?.message as string | undefined) ?? "فشل إنشاء الحساب");
      }
    };
  }}
>
  <label for="name">الاسم ثلاثي</label>
  <input
    type="text"
    id="name"
    name="name"
    pattern={`${triadicArabicName.source} ?`}
    title="اسم ثلاثي على الأقل"
    required
  />

  <label for="email">البريد الإلكتروني</label>
  <input type="email" id="email" name="email" dir="auto" required />

  <label for="password">كلمة المرور</label>
  <input type="password" id="password" name="password" required />

  <label for="confirm-password">تأكيد كلمة المرور</label>
  <input type="password" id="confirm-password" name="confirm-password" required />

  <input type="submit" value="إنشاء حساب" />
</form>

<style>
  form {
    border: var(--main-border);
    border-radius: 4px;
    padding: 1rem;

    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 0.5rem;

    input {
      text-align: center;
    }

    [type="submit"] {
      grid-column: 1/-1;

      height: 2rem;
      background-color: var(--main-accent-color);
      border-radius: 4px;
      border: var(--main-border);
    }
  }
</style>
