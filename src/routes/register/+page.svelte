<script lang="ts">
  import { enhance } from "$app/forms";
  import { authState } from "$lib/auth-client/auth.svelte";
  import { goto } from "$app/navigation";
  import {
    triadicArabicName,
    egyptianPhoneNumber,
    usernamePattern,
  } from "$lib/utils/patterns";
  import { toast } from "svelte-sonner";

  $effect(() => {
    if (authState.isAuthenticated) goto("/");
  });

  let nameOfUser = $state("");
  let displayName = $derived(nameOfUser.split(" ")[0]);
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
    class="pii"
    required
    bind:value={nameOfUser}
  />

  <label for="display-name">الاسم المختصر</label>
  <input
    type="text"
    id="display-name"
    name="display-name"
    dir="auto"
    required
    value={displayName}
  />

  <label for="email">البريد الإلكتروني</label>
  <input type="email" id="email" name="email" dir="auto" class="pii" required />

  <label for="phone">رقم الموبايل</label>
  <input
    type="text"
    id="phone"
    name="phone"
    dir="auto"
    pattern={egyptianPhoneNumber.source}
    class="pii"
    required
  />

  <label for="username">اسم المستخدم</label>
  <input
    type="text"
    id="username"
    name="username"
    dir="auto"
    title="حروف إنجليزية وأرقام و underscore فقط"
    pattern={usernamePattern.source}
    required
  />

  <hr />

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

  hr {
    width: 100%;
    grid-column: 1 / -1;
  }
</style>
