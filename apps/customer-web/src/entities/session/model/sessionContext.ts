import { createContext, useContext } from 'react';

/**
 * Session state belongs to the entity that owns it (`entities/session/model`).
 * The React provider that *wires* this state lives in `app/providers` —
 * composition and state are separate roles (Project Bible, P1.4).
 */

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export interface SessionState {
  status: SessionStatus;
  userId: string | null;
}

export const anonymousSession: SessionState = {
  status: 'anonymous',
  userId: null,
};

export const SessionContext = createContext<SessionState>(anonymousSession);

/** Read the session. The provider supplies the real state. */
export function useSession(): SessionState {
  return useContext(SessionContext);
}
