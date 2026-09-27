import { useEffect, useState } from 'react';
export function useLocalDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setValue(JSON.parse(saved));
    } catch {
      setFailed(true);
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        setFailed(true);
      }
    }
  }, [key, value, ready]);
  return [value, setValue, failed] as const;
}
