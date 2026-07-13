import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { authState } from "$lib/auth-client/auth.svelte";
import { toast } from "svelte-sonner";

export function signOutOnShiftEnd() {
  if (browser) {
    const sessionEndTimes = [8, 14, 20];
    const thePreviousHours = sessionEndTimes.map((h) => h - 1);

    return window.setInterval(async () => {
      const now = new Date();
      if (
        authState.isAuthenticated &&
        sessionEndTimes.includes(now.getHours()) &&
        now.getMinutes() === 0 &&
        now.getSeconds() === 0
      ) {
        await authState.signOut();
        goto("/login");
        toast.warning("تم تسجيل خروجك لانتهاء وقت الوردية", { duration: 200000 });
      } else if (
        authState.isAuthenticated &&
        thePreviousHours.includes(now.getHours()) &&
        now.getMinutes() === 55 &&
        now.getSeconds() === 0
      ) {
        toast.warning("سيتم تسجيل خروجك تلقائيا خلال 5 دقائق عند نهاية الوردية", {
          duration: 5 * 60 * 1000,
        });
      }
    }, 1000);
  }
}
