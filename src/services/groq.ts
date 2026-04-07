/**
 * Capa de abstraccion sobre Groq SDK.
 * Centraliza modelo, prompts de sistema y logica de llamada.
 *
 * AVISO DE SEGURIDAD: La API key esta expuesta en el bundle del cliente.
 * Esto es aceptable en entornos de demo o internos.
 * En produccion con usuarios externos, mueve las llamadas a un servidor propio.
 */
import Groq from 'groq-sdk';
import type { AutomationResult, ChatMessage } from '@/types';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Prompts de sistema indexados por la clave `promptKey` de cada Automation.
 * Cada prompt esta disenado para maximizar la calidad del output en su dominio.
 */
export const AUTOMATION_PROMPTS: Record<string, string> = {
  chatbot: `Eres el asistente virtual de una empresa profesional.
Respondes consultas de clientes con precision y brevedad.
Si no tienes la informacion, lo indicas y ofreces una via de contacto alternativa.
No inventas datos. Tono profesional y directo. Responde siempre en espanol.`,

  sales: `Eres un asesor de ventas consultivo especializado en servicios B2B.
Redactas propuestas comerciales, gestionas objeciones y argumentas valor para el cliente.
Enfoque en resultados de negocio, no en caracteristicas del producto.
Responde siempre en espanol.`,

  quotes: `Eres un especialista en elaboracion de presupuestos y propuestas comerciales.
Generas documentos con alcance, entregables, plazos y precio desglosados.
El formato es claro y sin ambiguedades para evitar conflictos contractuales.
Responde siempre en espanol.`,

  email: `Eres un especialista en comunicacion empresarial escrita.
Redactas emails profesionales: claros, concisos y con llamada a la accion definida.
Adaptas el tono al contexto indicado (formal, comercial, soporte).
Responde siempre en espanol.`,

  content: `Eres un experto en marketing de contenidos y copywriting orientado a conversion.
Creas contenido que conecta con la audiencia y genera accion.
Adaptas el formato al canal indicado (LinkedIn, blog, Instagram).
Responde siempre en espanol.`,

  summary: `Eres un analista experto en sintesis de informacion ejecutiva.
Estructura tu respuesta asi: resumen en 3-5 lineas, puntos clave numerados, proximos pasos con responsables.
Responde siempre en espanol.`,

  analysis: `Eres un analista de negocio con experiencia en inteligencia competitiva.
Identificas patrones, oportunidades y riesgos. Terminas con recomendaciones accionables priorizadas.
Responde siempre en espanol.`,

  reviews: `Eres un especialista en gestion de reputacion y experiencia de cliente.
Estructura tu respuesta: resumen, puntos positivos, areas de mejora, recomendaciones.
Responde siempre en espanol.`,

  faq: `Eres un experto en documentacion y bases de conocimiento.
Generas respuestas claras, completas y bien estructuradas.
Incluyes ejemplos cuando aporten claridad. Responde siempre en espanol.`,

  contracts: `Eres un experto en redaccion contractual empresarial.
Redactas clausulas con lenguaje preciso y sin ambiguedades.
Adviertes siempre que el documento es un borrador que debe revisar un profesional legal.
Responde siempre en espanol.`,

  appointments: `Eres un asistente de coordinacion de agenda.
Redactas confirmaciones, recordatorios y cancelaciones de forma profesional.
Responde siempre en espanol.`,
};

/** Prompt del chat general del panel */
export const CHAT_SYSTEM_PROMPT = `Eres un consultor especializado en automatizacion de procesos empresariales.
Asesoras a empresas en como optimizar operaciones, reducir trabajo manual y escalar sin aumentar costes.
Cuando pregunten por una automatizacion, explica el proceso, los requisitos y el beneficio esperado.
Responde siempre en espanol. Directo, practico y orientado a resultados.`;

let groqInstance: Groq | null = null;

/**
 * Inicializacion lazy del cliente Groq.
 * `dangerouslyAllowBrowser: true` es necesario porque el SDK detecta entorno browser.
 */
function getClient(): Groq {
  if (!groqInstance) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;
    if (!apiKey) throw new Error('Falta VITE_GROQ_API_KEY en .env.local');
    groqInstance = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }
  return groqInstance;
}

/**
 * Ejecuta una automatizacion con el prompt de sistema de su dominio.
 * @param promptKey  - Clave del prompt en AUTOMATION_PROMPTS
 * @param userInput  - Texto del usuario
 * @returns          - Resultado con texto, tokens y duracion
 */
export async function runAutomation(
  promptKey: string,
  userInput: string
): Promise<AutomationResult> {
  const client      = getClient();
  const start       = Date.now();
  const systemPrompt = AUTOMATION_PROMPTS[promptKey] ?? AUTOMATION_PROMPTS.content;

  const res = await client.chat.completions.create({
    model:      GROQ_MODEL,
    messages:   [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userInput     },
    ],
    max_tokens:  1500,
    temperature: 0.7,
  });

  return {
    text:       res.choices[0]?.message?.content ?? '',
    tokens:     res.usage?.total_tokens           ?? 0,
    durationMs: Date.now() - start,
  };
}

/**
 * Envia un mensaje al chat general manteniendo el historial completo.
 * @param history - Mensajes previos de la sesion (sin el system prompt)
 * @returns       - Respuesta del asistente y tokens consumidos
 */
export async function sendChatMessage(
  history: Pick<ChatMessage, 'role' | 'content'>[]
): Promise<{ text: string; tokens: number }> {
  const client = getClient();

  const res = await client.chat.completions.create({
    model:      GROQ_MODEL,
    messages:   [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...history,
    ],
    max_tokens:  1200,
    temperature: 0.7,
  });

  return {
    text:   res.choices[0]?.message?.content ?? '',
    tokens: res.usage?.total_tokens           ?? 0,
  };
}
