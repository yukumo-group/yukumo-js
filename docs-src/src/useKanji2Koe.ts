import { useEffect, useRef, useState } from "react";
import { loadAqKanji2Koe, type AqKanji2Koe } from "yukumo.js/lang/kanji2koe";
import { generateDevKey } from "./kg.ts";
import { MEMORY_SIZE } from "./engines.ts";

export interface Kanji2KoeState {
  converter: AqKanji2Koe | null;
  loading: boolean;
  error: unknown;
}

/**
 * Loads AqKanji2Koe once the caller first needs it, and keeps it alive for the
 * lifetime of the component. The dev key lifts the evaluation restriction that
 * would otherwise turn every na-row and ma-row mora into "nu".
 */
export function useKanji2Koe(enabled: boolean): Kanji2KoeState {
  const [converter, setConverter] = useState<AqKanji2Koe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const current = useRef<AqKanji2Koe | null>(null);

  useEffect(() => {
    if (!enabled || current.current != null) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const k2k = await loadAqKanji2Koe({ memorySize: MEMORY_SIZE });
        k2k.setDevKey(generateDevKey({ module: "k2k" }));
        if (cancelled) {
          await k2k.destroy();
          return;
        }
        current.current = k2k;
        setConverter(k2k);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // `loading` / `error` must not be dependencies: setLoading(true) would
    // re-run this effect, cancel the in-flight load, and never start another.
  }, [enabled]);

  useEffect(() => {
    return () => {
      current.current?.destroy();
      current.current = null;
    };
  }, []);

  return { converter, loading, error };
}
