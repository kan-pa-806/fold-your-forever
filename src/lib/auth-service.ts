import { supabase } from "@/integrations/supabase/client";
import { getState, setState, type UserAuth } from "./fold-store";

const PERSISTED_AUTH_KEY = "fold11.auth.session.v1";

export type AuthResult = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
};

/**
 * Checks for an existing active Supabase session or persistent user in localStorage.
 * Ensures the user stays logged in across page reloads and browser sessions.
 */
export async function getPersistedSession(): Promise<UserAuth | null> {
  if (typeof window === "undefined") return null;

  try {
    // 1. First check Supabase auth
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!error && session?.user) {
      const userAuth: UserAuth = {
        isLoggedIn: true,
        userId: session.user.id,
        email: session.user.email ?? null,
      };
      saveLocalAuth(userAuth);
      setState({ userAuth });
      return userAuth;
    }

    // 2. Fall back to saved local auth record if offline or custom persistent session
    const raw = window.localStorage.getItem(PERSISTED_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserAuth;
      if (parsed && parsed.isLoggedIn) {
        setState({ userAuth: parsed });
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[AuthService] Error restoring session:", err);
  }

  return null;
}

function saveLocalAuth(auth: UserAuth | null) {
  if (typeof window === "undefined") return;
  try {
    if (auth) {
      window.localStorage.setItem(PERSISTED_AUTH_KEY, JSON.stringify(auth));
    } else {
      window.localStorage.removeItem(PERSISTED_AUTH_KEY);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Sign in using Email and Password.
 * Directly signs in and sets up a persistent session without ANY email OTP or Gmail code.
 */
export async function loginWithPassword(email: string, pass: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const userAuth: UserAuth = {
        isLoggedIn: true,
        userId: data.user.id,
        email: data.user.email ?? email,
      };
      saveLocalAuth(userAuth);
      setState({
        userAuth,
        name: data.user.user_metadata?.display_name || getState().name,
      });
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.display_name,
        },
      };
    }

    return { success: false, error: "Failed to establish session." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error.";
    return { success: false, error: message };
  }
}

/**
 * Sign up using Email and Password.
 * Directly registers and attempts to establish the session without requiring email OTP.
 */
export async function registerWithPassword(
  email: string,
  pass: string,
  displayName: string,
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: {
          display_name: displayName.trim(),
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.session && data.user) {
      const userAuth: UserAuth = {
        isLoggedIn: true,
        userId: data.user.id,
        email: data.user.email ?? email,
      };
      saveLocalAuth(userAuth);
      setState({
        userAuth,
        name: displayName.trim() || getState().name,
      });
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: displayName.trim(),
        },
      };
    }

    // Even if confirmation is required on Supabase side, record persistent local state
    if (data.user) {
      const userAuth: UserAuth = {
        isLoggedIn: true,
        userId: data.user.id,
        email: data.user.email ?? email,
      };
      saveLocalAuth(userAuth);
      setState({ userAuth, name: displayName.trim() });
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: displayName,
        },
      };
    }

    return { success: false, error: "Registration could not be completed." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration error.";
    return { success: false, error: message };
  }
}

/**
 * Instant login / guest access with Soul Code.
 * Permanently stores the session in localStorage so the user never has to enter anything again.
 */
export function continueWithSoulCode(name: string, partnerName: string, soulCode: string, roomId?: string) {
  const userAuth: UserAuth = {
    isLoggedIn: true,
    userId: `user-${Date.now()}`,
    email: null,
  };
  saveLocalAuth(userAuth);
  setState({
    onboarded: true,
    name: name.trim() || "You",
    partner: partnerName.trim() || "Your person",
    soulCode,
    roomId: roomId ?? getState().roomId,
    userAuth,
  });
}

/**
 * Cleanly logs the user out from Supabase and removes session from localStorage.
 */
export async function logoutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
  saveLocalAuth(null);
  setState({
    userAuth: undefined,
  });
}
