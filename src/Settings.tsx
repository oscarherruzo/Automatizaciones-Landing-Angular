/**
 * Interfaces globales de la aplicacion.
 * Centralizar aqui garantiza consistencia entre servicios, contextos y componentes.
 */

/**
 * Roles del sistema. Determina acceso a rutas y funcionalidades.
 * Valores exactos de la columna `role` en la tabla `profiles` de Supabase.
 *   superadmin — acceso completo, incluye gestion de usuarios
 *   client     — acceso a sus propias automatizaciones
 */
export type UserRole = 'superadmin' | 'client';

/**
 * Perfil de usuario almacenado en la tabla `profiles` de Supabase.
 * Se hidrata tras autenticacion exitosa.
 */
export interface UserProfile {
  id:          string;
  email:       string;
  full_name:   string | null;
  company:     string | null;
  role:        UserRole;
  plan:        'free' | 'pro' | 'enterprise';
  created_at:  string;
}

/** Estado que expone el AuthContext al arbol de componentes */
export interface AuthState {
  user:              UserProfile | null;
  /** true mientras se resuelve la sesion inicial o se carga el perfil */
  loading:           boolean;
  /** Recarga el perfil desde Supabase y actualiza el contexto */
  refreshProfile:    () => Promise<void>;
}

export type AutomationCategory =
  | 'comunicacion'
  | 'ventas'
  | 'contenido'
  | 'analisis'
  | 'operaciones';

export type AutomationComplexity = 'basica' | 'intermedia' | 'avanzada';

/** Definicion de una automatizacion del catalogo */
export interface Automation {
  id:           string;
  title:        string;
  /** Texto corto para la tarjeta del catalogo */
  summary:      string;
  description:  string;
  category:     AutomationCategory;
  complexity:   AutomationComplexity;
  /** Precio estimado de implementacion en euros */
  price:        number;
  /** Tiempo de entrega estimado en dias laborables */
  deliveryDays: number;
  /** Clave en AUTOMATION_PROMPTS del servicio Groq */
  promptKey:    string;
  /** Etiquetas de beneficio mostradas en la tarjeta */
  benefits:     string[];
}

/** Mensaje individual de una sesion de chat */
export interface ChatMessage {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  timestamp: Date;
  tokens?:   number;
}

/** Resultado de ejecutar una automatizacion via Groq */
export interface AutomationResult {
  text:       string;
  tokens:     number;
  durationMs: number;
}
