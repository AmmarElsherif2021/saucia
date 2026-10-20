import type { PropsWithChildren } from 'react';
import {
  SessionContext,
  anonymousSession,
} from '../../entities/session/model/sessionContext';

/**
 * Provider/composition shell only.
 *
 * The session state, its type and `useSession` live in
 * `entities/session/model/sessionContext.ts`; this file exists to mount that
 * state at the app boundary. It never holds session business logic.
 */
export function SessionProvider({ children }: PropsWithChildren) {
  // TODO(Phase 2): subscribe to the Supabase auth session and supply real
  // state through SessionContext instead of the anonymous default.
  return (
    <SessionContext.Provider value={anonymousSession}>
      {children}
    </SessionContext.Provider>
  );
}
