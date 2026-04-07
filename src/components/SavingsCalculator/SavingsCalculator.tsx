/**
 * Calculador de ahorro estimado para una automatizacion.
 * El usuario indica cuantas horas pierde a la semana en esa tarea.
 * El widget devuelve horas ahorradas al año y ahorro economico estimado.
 */
import { useState } from 'react';
import type { Automation } from '@/types';
import styles from './SavingsCalculator.module.css';

interface SavingsCalculatorProps {
  automation: Automation;
}

/** Porcentaje de automatizacion estimado por complejidad */
const AUTOMATION_RATE: Record<string, number> = {
  basica:     0.85,
  intermedia: 0.70,
  avanzada:   0.60,
};

/** Coste hora estimado para un trabajador en Europa (EUR) */
const HOURLY_RATE = 25;

/** Semanas laborables al año */
const WEEKS_PER_YEAR = 46;

export function SavingsCalculator({ automation }: SavingsCalculatorProps) {
  const [hoursPerWeek, setHoursPerWeek] = useState(5);

  const rate        = AUTOMATION_RATE[automation.complexity] ?? 0.70;
  const savedWeekly = hoursPerWeek * rate;
  const savedYearly = Math.round(savedWeekly * WEEKS_PER_YEAR);
  const savedEuros  = Math.round(savedYearly * HOURLY_RATE);
  const roiMonths   = automation.price > 0
    ? Math.ceil(automation.price / (savedEuros / 12))
    : 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Calculador de ahorro</h2>
        <p className={styles.subtitle}>
          Cuantas horas dedicas actualmente a esta tarea cada semana?
        </p>
      </div>

      <div className={styles.sliderSection}>
        <div className={styles.sliderHeader}>
          <span className={styles.sliderLabel}>Horas por semana</span>
          <span className={styles.sliderValue}>{hoursPerWeek}h</span>
        </div>
        <input
          type="range"
          min={1}
          max={40}
          value={hoursPerWeek}
          onChange={(e) => setHoursPerWeek(Number(e.target.value))}
          className={styles.slider}
          aria-label="Horas semanales dedicadas a esta tarea"
        />
        <div className={styles.sliderTicks}>
          <span>1h</span>
          <span>10h</span>
          <span>20h</span>
          <span>40h</span>
        </div>
      </div>

      <div className={styles.results}>
        <div className={styles.resultCard}>
          <span className={styles.resultValue}>{savedYearly}h</span>
          <span className={styles.resultLabel}>Ahorradas al año</span>
        </div>
        <div className={styles.resultCard}>
          <span className={styles.resultValue}>{savedEuros.toLocaleString('es-ES')} EUR</span>
          <span className={styles.resultLabel}>Ahorro economico anual</span>
        </div>
        <div className={styles.resultCard}>
          <span className={styles.resultValue}>{roiMonths} meses</span>
          <span className={styles.resultLabel}>Retorno de la inversion</span>
        </div>
      </div>

      <p className={styles.disclaimer}>
        Estimacion basada en un coste hora de {HOURLY_RATE} EUR y una tasa de automatizacion
        del {Math.round(rate * 100)}% para complejidad {automation.complexity}.
        Los resultados reales pueden variar segun el contexto del negocio.
      </p>
    </div>
  );
}
