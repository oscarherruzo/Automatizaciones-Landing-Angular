/**
 * Landing page publica.
 * Accesible sin autenticacion en la ruta /.
 * Estilo: dark, DM Sans + DM Mono, acento ambar — coherente con variables.css.
 */
import { Link } from 'react-router-dom';
import { AUTOMATIONS } from '@/services/automations';
import styles from './Landing.module.css';

const FEATURES = [
  {
    title:  'Automatizaciones a medida',
    desc:   'Cada proceso se configura segun tu negocio. Sin soluciones genericas.',
  },
  {
    title:  'IA de ultima generacion',
    desc:   'Groq + Llama 3.3 70B. Respuestas en tiempo real, sin esperas.',
  },
  {
    title:  'Panel de control propio',
    desc:   'Gestiona, ejecuta y monitoriza tus automatizaciones desde un unico lugar.',
  },
  {
    title:  'Seguridad por diseno',
    desc:   'Acceso por roles, politicas RLS en base de datos y sesion cifrada.',
  },
];


const TESTIMONIALS = [
  {
    text: 'En menos de dos semanas tenia el chatbot funcionando en mi web. Las consultas repetitivas bajaron un 60% y mi equipo puede centrarse en lo que de verdad importa.',
    name: 'Maria G.',
    role: 'Directora de Operaciones — Clinica Dental',
  },
  {
    text: 'Generamos propuestas comerciales en 3 minutos en lugar de 2 horas. El retorno de la inversion fue evidente desde el primer mes.',
    name: 'Carlos M.',
    role: 'Responsable Comercial — Empresa de Software',
  },
  {
    text: 'El resumidor de reuniones nos ha cambiado la vida. Ahora todos saben exactamente cuales son sus proximos pasos sin tener que releer actas interminables.',
    name: 'Laura P.',
    role: 'CEO — Consultora de RRHH',
  },
];

const FEATURED = AUTOMATIONS.filter((a) =>
  ['chatbot-cliente', 'asistente-ventas', 'analizador-reviews'].includes(a.id)
);

const COMPLEXITY_LABEL: Record<string, string> = {
  basica:      'Basica',
  intermedia:  'Intermedia',
  avanzada:    'Avanzada',
};

export function Landing() {
  return (
    <div className={styles.root}>

      {/* Nav */}
      <header className={styles.nav}>
        <span className={styles.navBrand}>Oscar Herruzo</span>
        <div className={styles.navActions}>
          <Link to="/login"    className={styles.navLogin}>Acceder</Link>
          <Link to="/register" className={styles.navRegister}>Empezar gratis</Link>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <p className={styles.heroLabel}>Automatizaciones con IA para empresas</p>
        <h1 className={styles.heroTitle}>
          Trabaja menos.<br />
          <span className={styles.heroAccent}>Produce mas.</span>
        </h1>
        <p className={styles.heroDesc}>
          Implanta automatizaciones de inteligencia artificial en tu negocio
          en dias, no en meses. Sin equipo tecnico interno.
        </p>
        <div className={styles.heroCta}>
          <Link to="/register" className={styles.ctaPrimary}>Crear cuenta gratis</Link>
          <Link to="/catalog"  className={styles.ctaSecondary}>Ver catalogo</Link>
        </div>
        <p className={styles.heroNote}>
          Sin tarjeta de credito. Plan gratuito disponible.
        </p>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{AUTOMATIONS.length}</span>
          <span className={styles.statLabel}>Automatizaciones disponibles</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>{'<2 min'}</span>
          <span className={styles.statLabel}>Tiempo de respuesta medio</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>12h</span>
          <span className={styles.statLabel}>Ahorradas por semana</span>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Por que funciona</h2>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureDot} />
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catalog preview */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Automatizaciones destacadas</h2>
          <Link to="/catalog" className={styles.seeAll}>Ver todas</Link>
        </div>
        <div className={styles.catalogGrid}>
          {FEATURED.map((a) => (
            <div key={a.id} className={styles.catalogCard}>
              <div className={styles.catalogCardTop}>
                <span className={styles.categoryTag}>{a.category}</span>
                <span className={styles.complexityTag}>
                  {COMPLEXITY_LABEL[a.complexity]}
                </span>
              </div>
              <h3 className={styles.catalogTitle}>{a.title}</h3>
              <p className={styles.catalogSummary}>{a.summary}</p>
              <div className={styles.catalogFooter}>
                <span className={styles.catalogPrice}>desde {a.price} EUR</span>
                <span className={styles.catalogDays}>{a.deliveryDays} dias</span>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Testimonios */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Lo que dicen los clientes</h2>
        <div className={styles.testimonialsGrid}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={styles.testimonialCard}>
              <p className={styles.testimonialText}>{t.text}</p>
              <div className={styles.testimonialAuthor}>
                <span className={styles.testimonialName}>{t.name}</span>
                <span className={styles.testimonialRole}>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Listo para empezar?</h2>
        <p className={styles.ctaDesc}>
          Crea tu cuenta en menos de un minuto y accede al catalogo completo.
        </p>
        <Link to="/register" className={styles.ctaPrimary}>
          Crear cuenta gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>Oscar Herruzo — Automatizaciones con IA</span>
        <div className={styles.footerLinks}>
          <Link to="/login"    className={styles.footerLink}>Acceder</Link>
          <Link to="/register" className={styles.footerLink}>Registro</Link>
        </div>
      </footer>

    </div>
  );
}
