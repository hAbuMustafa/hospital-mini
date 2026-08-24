import { browser } from "$app/env";
import { authClient } from ".";

class AuthState {
  session: typeof authClient.$Infer.Session.session | null = $state(null);
  user: typeof authClient.$Infer.Session.user | null = $state(null);
  loading = $state(true);

  constructor() {
    this.refresh();
  }

  async refresh() {
    if (!browser) return;

    this.loading = true;

    try {
      const { data } = await authClient.getSession();
      this.session = data?.session ?? null;
      this.user = data?.user ?? null;
    } finally {
      this.loading = false;
    }
  }

  async signOut() {
    await authClient.signOut();
    this.session = null;
    this.user = null;
  }

  get isAuthenticated() {
    return !!this.session;
  }
}

export const authState = new AuthState();
