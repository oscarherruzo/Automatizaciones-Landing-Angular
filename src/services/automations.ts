/**
 * Catalogo de automatizaciones disponibles.
 * Fuente unica de verdad para el catalogo y las paginas de detalle.
 * Para anadir una nueva automatizacion, agregar una entrada aqui
 * y su prompt correspondiente en groq.ts.
 */
import type { Automation } from '@/types';

export const AUTOMATIONS: Automation[] = [
  {
    id: 'chatbot-cliente',
    title: 'Chatbot de Atencion al Cliente',
    summary: 'Resuelve consultas frecuentes 24/7 sin intervencion humana.',
    description:
      'Asistente conversacional entrenado con la informacion de tu negocio. Responde preguntas, gestiona incidencias de primer nivel y escala a un agente humano cuando es necesario. Integracion disponible en web, WhatsApp o Telegram.',
    category:    'comunicacion',
    complexity:  'avanzada',
    price:       1200,
    deliveryDays: 10,
    promptKey:   'chatbot',
    benefits:    ['Disponibilidad 24/7', 'Reduccion de tickets', 'Escalado automatico'],
  },
  {
    id: 'asistente-ventas',
    title: 'Asistente de Ventas',
    summary: 'Propuestas comerciales y respuestas a objeciones en segundos.',
    description:
      'Apoyo para el equipo comercial. Genera borradores de propuestas personalizadas, sugiere respuestas a objeciones habituales y ayuda a priorizar oportunidades segun criterios de negocio.',
    category:    'ventas',
    complexity:  'intermedia',
    price:       800,
    deliveryDays: 7,
    promptKey:   'sales',
    benefits:    ['Mas cierres por mes', 'Propuestas en minutos', 'Mensaje consistente'],
  },
  {
    id: 'generador-presupuestos',
    title: 'Generador de Presupuestos',
    summary: 'Presupuestos detallados a partir de una descripcion del proyecto.',
    description:
      'Introduce el alcance y el sistema genera un presupuesto con desglose de partidas, plazos y condiciones. Formato exportable y listo para enviar al cliente.',
    category:    'ventas',
    complexity:  'intermedia',
    price:       600,
    deliveryDays: 5,
    promptKey:   'quotes',
    benefits:    ['Presupuesto en 2 minutos', 'Formato profesional', 'Sin ambiguedades'],
  },
  {
    id: 'email-marketing',
    title: 'Redactor de Email Marketing',
    summary: 'Campanas de email con estructura probada para maximizar aperturas.',
    description:
      'Genera secuencias de emails para captacion, nurturing y reactivacion. Adapta tono y oferta segun el segmento de audiencia indicado.',
    category:    'comunicacion',
    complexity:  'basica',
    price:       400,
    deliveryDays: 3,
    promptKey:   'email',
    benefits:    ['Mayor tasa de apertura', 'Secuencias automatizadas', 'Personalizacion a escala'],
  },
  {
    id: 'contenido-redes',
    title: 'Generador de Contenido para Redes',
    summary: 'Posts y copys optimizados para LinkedIn, Instagram y X.',
    description:
      'Define sector, audiencia y tono de voz. El sistema genera publicaciones adaptadas a cada plataforma con llamadas a la accion claras.',
    category:    'contenido',
    complexity:  'basica',
    price:       350,
    deliveryDays: 3,
    promptKey:   'content',
    benefits:    ['Consistencia de marca', 'Ahorro de 10h/semana', 'Contenido nativo por canal'],
  },
  {
    id: 'resumidor-reuniones',
    title: 'Resumidor de Reuniones',
    summary: 'Convierte notas o transcripciones en resumenes ejecutivos.',
    description:
      'Pega la transcripcion o las notas de la reunion y obtén resumen ejecutivo, decisiones tomadas y proximos pasos con responsables asignados.',
    category:    'operaciones',
    complexity:  'basica',
    price:       300,
    deliveryDays: 2,
    promptKey:   'summary',
    benefits:    ['Resumen en 30 segundos', 'Trazabilidad de decisiones', 'Proximos pasos claros'],
  },
  {
    id: 'analizador-reviews',
    title: 'Analizador de Resenas',
    summary: 'Extrae insights de reputacion a partir de valoraciones de clientes.',
    description:
      'Analiza lotes de resenas de Google, Trustpilot o cualquier plataforma. Identifica patrones de satisfaccion, quejas recurrentes y oportunidades de mejora priorizadas.',
    category:    'analisis',
    complexity:  'intermedia',
    price:       700,
    deliveryDays: 6,
    promptKey:   'reviews',
    benefits:    ['Vision completa del cliente', 'Deteccion de problemas recurrentes', 'Informe ejecutivo'],
  },
  {
    id: 'analisis-competencia',
    title: 'Analisis de Competencia',
    summary: 'Radiografia de competidores directos para tomar decisiones con datos.',
    description:
      'Introduce informacion publica de tus competidores y obtén un analisis comparativo con huecos de mercado y ventajas competitivas identificadas.',
    category:    'analisis',
    complexity:  'avanzada',
    price:       1000,
    deliveryDays: 8,
    promptKey:   'analysis',
    benefits:    ['Decisiones basadas en datos', 'Diferenciacion clara', 'Ventajas identificadas'],
  },
  {
    id: 'faq-inteligente',
    title: 'FAQ Inteligente',
    summary: 'Base de conocimiento que responde con precision y se actualiza facilmente.',
    description:
      'Crea una base de preguntas frecuentes con respuestas detalladas generadas a partir de la descripcion de tu negocio. Actualizable sin conocimientos tecnicos.',
    category:    'comunicacion',
    complexity:  'basica',
    price:       400,
    deliveryDays: 3,
    promptKey:   'faq',
    benefits:    ['Onboarding mas rapido', 'Menos preguntas repetidas', 'Facilmente actualizable'],
  },
  {
    id: 'redactor-contratos',
    title: 'Redactor de Contratos',
    summary: 'Borradores contractuales claros y sin ambiguedades en minutos.',
    description:
      'Genera borradores de contratos de servicios, NDAs y acuerdos de colaboracion. El resultado es un borrador base revisable por tu asesor legal.',
    category:    'operaciones',
    complexity:  'avanzada',
    price:       900,
    deliveryDays: 7,
    promptKey:   'contracts',
    benefits:    ['Base contractual solida', 'Ahorro en honorarios iniciales', 'Proceso estandarizado'],
  },
  {
    id: 'gestor-citas',
    title: 'Gestor de Comunicaciones de Citas',
    summary: 'Confirmaciones, recordatorios y reagendados redactados automaticamente.',
    description:
      'Automatiza la comunicacion asociada a la agenda: confirmaciones de reserva, recordatorios 24h antes y mensajes de reagendado o cancelacion.',
    category:    'operaciones',
    complexity:  'basica',
    price:       300,
    deliveryDays: 3,
    promptKey:   'appointments',
    benefits:    ['Cero no-shows', 'Comunicacion profesional', 'Ahorro de tiempo de gestion'],
  },
];

/**
 * Devuelve una automatizacion por su id, o undefined si no existe.
 * @param id - Slug de la automatizacion
 */
export function getAutomationById(id: string): Automation | undefined {
  return AUTOMATIONS.find((a) => a.id === id);
}
