/**
 * Hook que encapsula el ciclo de vida de una llamada a una automatizacion Groq.
 * Gestiona estados de carga, error y resultado de forma uniforme en todas las paginas.
 */
import { useState, useCallback } from 'react';
import { runAutomation } from '@/services/groq';
import type { AutomationResult } from '@/types';

interface AutomationState {
  result:   AutomationResult | null;
  loading:  boolean;
  error:    string | null;
  /** Ejecuta la automatizacion con el input del usuario */
  execute:  (promptKey: string, input: string) => Promise<void>;
  /** Resetea el estado para permitir una nueva ejecucion */
  reset:    () => void;
}

export function useAutomation(): AutomationState {
  const [result,  setResult]  = useState<AutomationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const execute = useCallback(async (promptKey: string, input: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await runAutomation(promptKey, input);
      setResult(res);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudo completar la automatizacion: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { result, loading, error, execute, reset };
}
