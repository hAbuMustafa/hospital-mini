import type { Session, User } from "better-auth";
import { authClient } from ".";

class AuthState {
  session: Session | null = $state(null);
  user: User | null = $state(null);
  loading = $state(true);

  constructor() {
    this.refresh();
  }

  async refresh() {
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
