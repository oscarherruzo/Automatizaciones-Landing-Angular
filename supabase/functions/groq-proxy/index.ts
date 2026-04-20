import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const AUTOMATION_PROMPTS: Record<string, string> = {
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

const CHAT_SYSTEM_PROMPT = `Eres un consultor especializado en automatizacion de procesos empresariales.
Asesoras a empresas en como optimizar operaciones, reducir trabajo manual y escalar sin aumentar costes.
Cuando pregunten por una automatizacion, explica el proceso, los requisitos y el beneficio esperado.
Responde siempre en espanol. Directo, practico y orientado a resultados.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GROQ_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY no configurada en los secrets de la Edge Function' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json() as {
      promptKey?: string;
      userInput?: string;
      history?: { role: string; content: string }[];
    };

    const start = Date.now();
    let messages: { role: string; content: string }[];
    let maxTokens: number;

    if (body.history) {
      // Modo chat general
      messages = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...body.history,
      ];
      maxTokens = 1200;
    } else if (body.promptKey && body.userInput) {
      // Modo automatizacion
      const systemPrompt = AUTOMATION_PROMPTS[body.promptKey] ?? AUTOMATION_PROMPTS.content;
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: body.userInput },
      ];
      maxTokens = 1500;
    } else {
      return new Response(
        JSON.stringify({ error: 'Se requiere { promptKey, userInput } o { history }' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(
        JSON.stringify({ error: `Groq API error ${groqRes.status}: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await groqRes.json() as {
      choices: { message: { content: string } }[];
      usage?: { total_tokens: number };
    };

    return new Response(
      JSON.stringify({
        text:       data.choices[0]?.message?.content ?? '',
        tokens:     data.usage?.total_tokens           ?? 0,
        durationMs: Date.now() - start,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
