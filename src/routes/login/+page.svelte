<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { authState } from "$lib/auth-client/auth.svelte";
  import Password from "$lib/components/Forms/Password.svelte";
  import { getDuration } from "$lib/date/utils";
  import {
    egyptianPhoneNumber,
    emailPattern,
    usernamePattern,
  } from "$lib/utils/patterns";
  import { toast } from "svelte-sonner";
  import { getLastPatientFetch } from "../(authed)/CONSTANTS.remote";

  let error = $state("");

  let identifier = $state("");

  let validators = $derived.by(() => {
    if (usernamePattern.test(identifier)) {
      return { type: "text", pattern: usernamePattern.source };
    } else if (emailPattern.test(identifier)) {
      return { type: "email" };
    } else {
      return { type: "text", pattern: egyptianPhoneNumber.source };
    }
  });
</script>

<h1>تسجيل الدخول</h1>

<form
  method="post"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === "success") {
        await authState.refresh();

        const lastPatientFetch = await getLastPatientFetch();
        if (!lastPatientFetch) {
          toast.warning("يرجى إمداد قاعدة البيانات ببيانات المرضى");
        } else if (getDuration(lastPatientFetch, new Date(), "hours") > 24) {
          toast.warning("لم يتم تحديث بيانات المرضى منذ مدة");
        }
        goto("/");
      } else if (result.type === "failure") {
        error = (result.data?.message as string | undefined) ?? "فشل تسجيل الدخول";
      }
    };
  }}
>
  <label for="identifier">معرف الدخول</label>
  <input
    id="identifier"
    name="identifier"
    bind:value={identifier}
    dir="ltr"
    class="pii"
    placeholder="بريد إلكتروني / اسم مستخدم / موبايل"
    required
    {...validators}
  />

  <label for="password">كلمة المرور</label>
  <Password id="password" name="password" dir="auto" required />

  {#if error}
    <p class="error message">{error}</p>
  {/if}

  <input type="submit" value="تسجيل الدخول" />
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

  .error.message {
    grid-column: 1/-1;
  }
</style>
