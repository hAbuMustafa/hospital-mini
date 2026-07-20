<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { authState } from "$lib/auth-client/auth.svelte";
  import {
    egyptianPhoneNumber,
    emailPattern,
    triadicArabicName,
    usernamePattern,
  } from "$lib/utils/patterns";

  let error = $state("");
</script>

<h1>تسجيل الدخول</h1>

<form
  method="post"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === "success") {
        await authState.refresh();
        goto("/");
      } else if (result.type === "failure") {
        error = (result.data?.message as string | undefined) ?? "فشل تسجيل الدخول";
      }
    };
  }}
>
  <label for="identifier">معرف الدخول</label>
  <input
    type="text"
    id="identifier"
    name="identifier"
    dir="auto"
    pattern="({usernamePattern.source})|({emailPattern.source})({egyptianPhoneNumber.source})"
    placeholder="بريد إلكتروني / اسم مستخدم / موبايل"
    required
  />

  <label for="password">كلمة المرور</label>
  <input type="password" id="password" name="password" dir="auto" required />

  {#if error}
    <p class="error">{error}</p>
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

  p.error {
    background-color: salmon;
    color: maroon;
    border: maroon 1px solid;
    border-radius: 4px;
    grid-column: 1/-1;
    text-align: center;
    padding: 0.25rem 1rem;
  }
</style>
