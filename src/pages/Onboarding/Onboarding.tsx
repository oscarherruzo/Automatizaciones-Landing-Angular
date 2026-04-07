import { useState } from 'react';
import { useNavigate }    from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { supabase }       from '@/services/supabase';
import { Button }         from '@/components/ui/Button/Button';
import styles from './Onboarding.module.css';

const SECTORS = [
  'Comercio / Retail', 'Servicios profesionales', 'Hosteleria / Restauracion',
  'Salud / Bienestar', 'Educacion', 'Tecnologia', 'Inmobiliaria',
  'Construccion', 'Logistica', 'Otro',
];

const COMPANY_SIZES = [
  { value: '1',    label: 'Solo yo' },
  { value: '2-5',  label: '2 a 5 personas' },
  { value: '6-20', label: '6 a 20 personas' },
  { value: '21+',  label: 'Mas de 20 personas' },
];

const NEEDS = [
  'Reducir tiempo en tareas repetitivas',
  'Mejorar la atencion al cliente',
  'Generar mas contenido y comunicaciones',
  'Automatizar ventas y presupuestos',
  'Analizar datos y obtener informes',
  'Gestionar citas y operaciones internas',
];

export function Onboarding() {
  const { user }  = useAuthContext();
  const navigate  = useNavigate();
  const [step,    setStep]   = useState(1);
  const [saving,  setSaving] = useState(false);
  const [data,    setData]   = useState({ sector: '', companySize: '', mainNeed: '' });

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    await supabase.from('onboarding_data').upsert({
      user_id:      user.id,
      sector:       data.sector,
      company_size: data.companySize,
      main_need:    data.mainNeed,
      completed:    true,
    });
    setSaving(false);
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.progress}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={styles.progressStep}>
              <div className={[styles.progressDot, s <= step ? styles.progressDotActive : ''].join(' ').trim()} />
              {s < 3 && <div className={[styles.progressLine, s < step ? styles.progressLineActive : ''].join(' ').trim()} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <p className={styles.stepCount}>Paso 1 de 3</p>
              <h1 className={styles.stepTitle}>Cual es tu sector?</h1>
              <p className={styles.stepSubtitle}>Esto nos ayuda a recomendarte las automatizaciones mas relevantes.</p>
            </div>
            <div className={styles.optionsGrid}>
              {SECTORS.map((s) => (
                <button key={s} className={[styles.option, data.sector === s ? styles.optionActive : ''].join(' ').trim()} onClick={() => setData((d) => ({ ...d, sector: s }))}>
                  {s}
                </button>
              ))}
            </div>
            <div className={styles.stepActions}>
              <Button onClick={() => setStep(2)} disabled={!data.sector}>Siguiente</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <p className={styles.stepCount}>Paso 2 de 3</p>
              <h1 className={styles.stepTitle}>Cuantas personas sois?</h1>
              <p className={styles.stepSubtitle}>El tamano del equipo determina la complejidad de las soluciones.</p>
            </div>
            <div className={styles.optionsCol}>
              {COMPANY_SIZES.map((s) => (
                <button key={s.value} className={[styles.option, styles.optionWide, data.companySize === s.value ? styles.optionActive : ''].join(' ').trim()} onClick={() => setData((d) => ({ ...d, companySize: s.value }))}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className={styles.stepActions}>
              <Button variant="ghost" onClick={() => setStep(1)}>Atras</Button>
              <Button onClick={() => setStep(3)} disabled={!data.companySize}>Siguiente</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <p className={styles.stepCount}>Paso 3 de 3</p>
              <h1 className={styles.stepTitle}>Cual es tu mayor necesidad?</h1>
              <p className={styles.stepSubtitle}>Selecciona la que mas encaja con lo que quieres resolver.</p>
            </div>
            <div className={styles.optionsCol}>
              {NEEDS.map((n) => (
                <button key={n} className={[styles.option, styles.optionWide, data.mainNeed === n ? styles.optionActive : ''].join(' ').trim()} onClick={() => setData((d) => ({ ...d, mainNeed: n }))}>
                  {n}
                </button>
              ))}
            </div>
            <div className={styles.stepActions}>
              <Button variant="ghost" onClick={() => setStep(2)}>Atras</Button>
              <Button onClick={handleFinish} loading={saving} disabled={!data.mainNeed}>Ir al panel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
