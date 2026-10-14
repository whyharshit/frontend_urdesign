import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import { createSeedState } from '../data/seed';
import { demoReducer, type DemoAction } from '../data/demoReducer';
import type { DemoState } from '../types/domain';
const STORAGE_KEY = 'urdesigner.demo.v3';
/** Earlier demo versions: their shape no longer matches, so they're removed, not migrated. */
const OLD_KEYS = ['urdesigner.demo.v1', 'urdesigner.demo.v2'];
const DemoContext = createContext<{
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  storageError: boolean;
  ready: boolean;
} | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, createSeedState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      OLD_KEYS.forEach((key) => localStorage.removeItem(key));
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DemoState;
        if (
          parsed.version === 3 &&
          typeof parsed.ownId === 'string' &&
          Array.isArray(parsed.providers) &&
          parsed.providers.some((p) => p.id === parsed.ownId) &&
          parsed.session &&
          Array.isArray(parsed.saved) &&
          Array.isArray(parsed.reports) &&
          Array.isArray(parsed.providers) &&
          Array.isArray(parsed.enquiries) &&
          Array.isArray(parsed.payments) &&
          Array.isArray(parsed.ledger) &&
          Array.isArray(parsed.requirements) &&
          Array.isArray(parsed.proposals) &&
          Number.isFinite(parsed.balance)
        )
          dispatch({ type: 'hydrate', state: parsed });
      }
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        setStorageError(true);
      }
    }
  }, [state, ready]);
  return (
    <DemoContext.Provider value={{ state, dispatch, storageError, ready }}>
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be used within DemoProvider');
  return value;
}
