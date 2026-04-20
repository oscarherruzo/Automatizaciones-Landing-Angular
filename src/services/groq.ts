/**
 * Capa de abstraccion sobre la Edge Function groq-proxy.
 * La API key de Groq reside exclusivamente en los Secrets de Supabase Edge Functions,
 * nunca en el bundle del cliente.
 */
import { supabase } from '@/services/supabase';
import type { AutomationResult, ChatMessage } from '@/types';

/**
 * Ejecuta una automatizacion delegando en la Edge Function groq-proxy.
 * @param promptKey  - Clave del prompt en AUTOMATION_PROMPTS (definidos en la Edge Function)
 * @param userInput  - Texto del usuario
 * @returns          - Resultado con texto, tokens y duracion
 */
export async function runAutomation(
  promptKey: string,
  userInput: string
): Promise<AutomationResult> {
  const { data, error } = await supabase.functions.invoke('groq-proxy', {
    body: { promptKey, userInput },
  });

  if (error) throw new Error(`groq-proxy error: ${error.message}`);

  return {
    text:       data.text       ?? '',
    tokens:     data.tokens     ?? 0,
    durationMs: data.durationMs ?? 0,
  };
}

/**
 * Envia un mensaje al chat general delegando en la Edge Function groq-proxy.
 * @param history - Mensajes previos de la sesion (sin el system prompt)
 * @returns       - Respuesta del asistente y tokens consumidos
 */
export async function sendChatMessage(
  history: Pick<ChatMessage, 'role' | 'content'>[]
): Promise<{ text: string; tokens: number }> {
  const { data, error } = await supabase.functions.invoke('groq-proxy', {
    body: { history },
  });

  if (error) throw new Error(`groq-proxy error: ${error.message}`);

  return {
    text:   data.text   ?? '',
    tokens: data.tokens ?? 0,
  };
}
