<script lang="ts">
  import { enhance } from "$app/forms";
  import { authState } from "$lib/auth-client/auth.svelte";
  import {
    egyptianPhoneNumber,
    triadicArabicName,
    usernamePattern,
  } from "$lib/utils/patterns";
  import { toast } from "svelte-sonner";

  let name = $state(authState.user?.name);
  let displayName = $state(authState.user?.displayUsername);
  let email = $state(authState.user?.email);
  let phoneNumber = $state(authState.user?.phoneNumber);
  let username = $state(authState.user?.username);
</script>

<h1 class="pii">{authState.user?.name}</h1>

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
      class="pii"
      bind:value={name}
      pattern={triadicArabicName.source}
      autocomplete="off"
      required
    />

    <input type="submit" class:shown={name !== authState.user?.name} value="حفظ" />
  </form>

  <form
    action="?/change_display_name"
    method="post"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          await authState.refresh();
          toast.success(
            (result.data?.message as string | undefined) ?? "تم تعديل الاسم المختصر"
          );
        } else if (result.type === "failure") {
          toast.error(
            (result.data?.message as string | undefined) ?? "فشل حفظ الاسم المختصر"
          );
        }
      };
    }}
  >
    <label for="display-name">الاسم المختصر</label>
    <input
      type="text"
      id="display-name"
      name="display-name"
      bind:value={displayName}
      autocomplete="off"
      required
    />

    <input
      type="submit"
      class:shown={displayName !== authState.user?.displayUsername}
      value="حفظ"
    />
  </form>

  <form
    action="?/change_email"
    method="post"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          await authState.refresh();
          toast.success(
            (result.data?.message as string | undefined) ?? "تم تعديل البريد الإلكتروني"
          );
        } else if (result.type === "failure") {
          toast.error(
            (result.data?.message as string | undefined) ?? "فشل حفظ البريد الإلكتروني"
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
      class="pii"
      bind:value={email}
      autocomplete="off"
      required
    />

    <input type="submit" class:shown={email !== authState.user?.email} value="حفظ" />
  </form>

  <form
    action="?/change_phone"
    method="post"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          await authState.refresh();
          toast.success(
            (result.data?.message as string | undefined) ?? "تم تعديل رقم الموبايل"
          );
        } else if (result.type === "failure") {
          toast.error(
            (result.data?.message as string | undefined) ?? "فشل حفظ رقم الموبايل"
          );
        }
      };
    }}
  >
    <label for="phone-number">الموبايل</label>
    <input
      type="text"
      id="phone-number"
      name="phone-number"
      class="pii"
      bind:value={phoneNumber}
      pattern={egyptianPhoneNumber.source}
      autocomplete="off"
      required
    />

    <input
      type="submit"
      class:shown={phoneNumber !== authState.user?.phoneNumber}
      value="حفظ"
    />
  </form>

  <form
    action="?/change_username"
    method="post"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          await authState.refresh();
          toast.success(
            (result.data?.message as string | undefined) ?? "تم تعديل اسم المستخدم"
          );
        } else if (result.type === "failure") {
          toast.error(
            (result.data?.message as string | undefined) ?? "فشل حفظ اسم المستخدم"
          );
        }
      };
    }}
  >
    <label for="username">اسم المستخدم</label>
    <input
      type="text"
      id="username"
      name="username"
      bind:value={username}
      pattern={usernamePattern.source}
      autocomplete="off"
      required
    />

    <input
      type="submit"
      class:shown={username !== authState.user?.username}
      value="حفظ"
    />
  </form>

  <form
    action="?/change_password"
    method="post"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          await authState.refresh();
          toast.success(
            (result.data?.message as string | undefined) ?? "تم تعديل كلمة المرور"
          );
        } else if (result.type === "failure") {
          toast.error(
            (result.data?.message as string | undefined) ?? "فشل تعديل كلمة المرور"
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
    gap: 1rem;

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
