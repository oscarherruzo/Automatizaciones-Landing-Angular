/**
 * Catalogo de automatizaciones disponibles.
 * Permite filtrar por categoria y muestra tarjetas enlazadas al detalle.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AUTOMATIONS } from '@/services/automations';
import { Badge } from '@/components/ui/Badge/Badge';
import type { AutomationCategory } from '@/types';
import styles from './Catalog.module.css';

/** Opciones de filtro de categoria */
const CATEGORIES: Array<{ value: AutomationCategory | 'todas'; label: string }> = [
  { value: 'todas',        label: 'Todas' },
  { value: 'comunicacion', label: 'Comunicacion' },
  { value: 'ventas',       label: 'Ventas' },
  { value: 'contenido',    label: 'Contenido' },
  { value: 'analisis',     label: 'Analisis' },
  { value: 'operaciones',  label: 'Operaciones' },
];

const COMPLEXITY_BADGE: Record<string, 'success' | 'warning' | 'error'> = {
  basica:      'success',
  intermedia:  'warning',
  avanzada:    'error',
};

export function Catalog() {
  const [activeCategory, setActiveCategory] = useState<AutomationCategory | 'todas'>('todas');

  const filtered = activeCategory === 'todas'
    ? AUTOMATIONS
    : AUTOMATIONS.filter((a) => a.category === activeCategory);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Catalogo de automatizaciones</h1>
        <p className={styles.subtitle}>
          {AUTOMATIONS.length} soluciones listas para implementar en tu empresa.
        </p>
      </header>

      {/* Filtros por categoria */}
      <div className={styles.filters} role="group" aria-label="Filtrar por categoria">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={[
              styles.filterBtn,
              activeCategory === cat.value ? styles.filterBtnActive : '',
            ].join(' ').trim()}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de automatizaciones */}
      <div className={styles.grid}>
        {filtered.map((automation) => (
          <Link
            key={automation.id}
            to={`/catalog/${automation.id}`}
            className={styles.card}
          >
            <div className={styles.cardMeta}>
              <Badge variant="accent">{automation.category}</Badge>
              <Badge variant={COMPLEXITY_BADGE[automation.complexity]}>
                {automation.complexity}
              </Badge>
            </div>
            <h2 className={styles.cardTitle}>{automation.title}</h2>
            <p className={styles.cardSummary}>{automation.summary}</p>
            <ul className={styles.benefits}>
              {automation.benefits.map((b) => (
                <li key={b} className={styles.benefit}>{b}</li>
              ))}
            </ul>
            <div className={styles.cardFooter}>
              <span className={styles.price}>desde {automation.price} EUR</span>
              <span className={styles.days}>{automation.deliveryDays} dias hab.</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
