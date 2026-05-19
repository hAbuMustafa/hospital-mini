<script lang="ts">
  import { enhance } from "$app/forms";
  import { authState } from "$lib/auth-client/auth.svelte";
  import { triadicArabicName } from "$lib/utils/patterns";
  import { toast } from "svelte-sonner";

  let name = $state(authState.user?.name);
  let email = $state(authState.user?.email);
</script>

<h1>{authState.user?.name}</h1>

<div class="wrapper">
  <form
    action="?/change_name"
    method="post"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          await authState.refresh();
          toast.success((result.data?.message as string | undefined) ?? "تم تعديل الاسم");
        } else if (result.type === "failure") {
          toast.error((result.data?.message as string | undefined) ?? "فشل حفظ الاسم");
        }
      };
    }}
  >
    <label for="name">الاسم</label>
    <input
      type="text"
      id="name"
      name="name"
      bind:value={name}
      pattern={triadicArabicName.source}
      autocomplete="off"
      required
    />

    <input type="submit" class:shown={name !== authState.user?.name} value="حفظ" />
  </form>

  <form
    action="?/change_email"
    method="post"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          await authState.refresh();
          toast.success(
            (result.data?.message as string | undefined) ?? "تم تعديل البريد الإلكتروني",
          );
        } else if (result.type === "failure") {
          toast.error(
            (result.data?.message as string | undefined) ?? "فشل حفظ البريد الإلكتروني",
          );
        }
      };
    }}
  >
    <label for="email">البريد الإلكتروني</label>
    <input
      type="email"
      id="email"
      name="email"
      bind:value={email}
      autocomplete="off"
      required
    />

    <input type="submit" class:shown={email !== authState.user?.email} value="حفظ" />
  </form>

  <form
    action="?/change_password"
    method="post"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          await authState.refresh();
          toast.success(
            (result.data?.message as string | undefined) ?? "تم تعديل كلمة المرور",
          );
        } else if (result.type === "failure") {
          toast.error(
            (result.data?.message as string | undefined) ?? "فشل تعديل كلمة المرور",
          );
        }
      };
    }}
  >
    <label for="password">كلمة المرور الحالية</label>
    <input type="password" id="password" name="password" required />

    <label for="new-password">كلمة المرور الجديدة</label>
    <input type="password" id="new-password" name="new-password" required />

    <label for="confirm-password">تأكيد كلمة المرور</label>
    <input type="password" id="confirm-password" name="confirm-password" required />

    <input type="submit" class="shown alone" value="حفظ" />
  </form>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    border: var(--main-border);
    border-radius: 4px;
    padding: 2rem;
  }

  form {
    display: grid;
    grid-template-columns: 1fr 3fr;

    gap: 1rem;

    &:has(.shown) {
      grid-template-columns: 1.5fr 3fr 1fr;
    }

    &:has(.alone) {
      grid-template-columns: 1fr 2.5fr;
      border-block-start: var(--main-border);
      padding-block-start: 1rem;
    }
  }

  label {
    text-align: end;
  }

  input {
    text-align: center;
  }

  [type="submit"] {
    display: none;
    background-color: var(--main-accent-color);
    padding-block: 0.25rem;
    border: var(--main-border);
    border-radius: 4px;

    &.shown {
      display: inline-block;
    }

    &.alone {
      grid-column: 1/-1;
      background-color: maroon;
    }
  }
</style>
