<script lang="ts">
  import { authState } from "$lib/auth-client/auth.svelte";
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
      !blockDepartment.includes(user?.affiliation) &&
      !blockRole.includes(user.role) &&
      !blockUser.includes(user.id) &&
      (allowDepartment.includes(user?.affiliation) ||
        allowRole.includes(user?.role) ||
        allowUser.includes(user.id))
    );
  }
</script>

{#if canSee(authState.user)}
  {@render children()}
{/if}
