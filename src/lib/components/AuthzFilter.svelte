<script lang="ts">
  import { authState } from "$lib/auth-client/auth.svelte";
  import {
    departmentNotBlocked,
    roleNotBlocked,
    userNotBlocked,
    departmentIsAllowed,
    roleIsAllowed,
    userIsAllowed,
  } from "$lib/utils/authorization";
  import type { Snippet } from "svelte";

  type PropsT = {
    allowRole?: string[];
    allowUser?: string[];
    allowDepartment?: number[];

    blockRole?: string[];
    blockUser?: string[];
    blockDepartment?: number[];

    children: Snippet;
  };

  const {
    allowRole = [],
    allowUser = [],
    allowDepartment = [],

    blockRole = [],
    blockUser = [],
    blockDepartment = [],

    children,
  }: PropsT = $props();

  function canSee(user: typeof authState.user) {
    if (user?.role === "admin") return true;

    return (
      user &&
      !user.banned &&
      user.role &&
      departmentNotBlocked(user, blockDepartment) &&
      roleNotBlocked(user, blockRole) &&
      userNotBlocked(user, blockUser) &&
      (departmentIsAllowed(user, allowDepartment) ||
        roleIsAllowed(user, allowRole) ||
        userIsAllowed(user, allowUser))
    );
  }
</script>

{#if canSee(authState.user)}
  {@render children()}
{/if}
