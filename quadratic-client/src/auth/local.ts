import type { AuthClient, User } from '@/auth/auth';

/**
 * A local-development auth client that bypasses real authentication.
 * Used when VITE_AUTH_TYPE=local so the frontend can render without
 * an external auth provider (Ory / WorkOS) or a running API server.
 */

const LOCAL_USER: User = {
  name: 'Local Developer',
  given_name: 'Local',
  family_name: 'Developer',
  email: 'local@example.com',
  sub: 'local-dev-user-00000000',
  picture: undefined,
  index: 0,
};

const LOCAL_TOKEN = 'local-dev-token';

export const localClient: AuthClient = {
  async isAuthenticated() {
    return true;
  },

  async user() {
    return LOCAL_USER;
  },

  async login(_args: { redirectTo: string; isSignupFlow?: boolean; href: string }) {
    // No-op for local dev — user is always "logged in"
    return;
  },

  async handleSigninRedirect(_href: string) {
    // No-op
    return;
  },

  async logout() {
    // No-op
    return;
  },

  async getTokenOrRedirect(_skipRedirect?: boolean, _request?: Request) {
    return LOCAL_TOKEN;
  },
};
