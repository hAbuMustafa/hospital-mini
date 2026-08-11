import { authState } from "$lib/auth-client/auth.svelte";

export function isReturnable(ticketTimestamp: Date) {
  return (
    authState.user?.role === "admin" ||
    (new Date().getTime() - ticketTimestamp.getTime()) / (60 * 60 * 24 * 1000) < 2
  );
}
