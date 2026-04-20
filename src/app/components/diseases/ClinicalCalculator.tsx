import { useMemo, useState } from 'react';
import { Calculator as CalcIcon, Info } from 'lucide-react';
import { useLocale } from '../../store/LocaleContext';
import type {
  CalculatorInput,
  CalculatorInputValues,
  CalculatorResult,
  CalculatorSchema,
} from '../../types/api/calculator';

interface Props {
  schema: CalculatorSchema;
  /** Optional audience hint so the formula/recommendation can be gated. */
  audience?: 'L1' | 'L2' | 'L3';
}

function buildDefaults(schema: CalculatorSchema): CalculatorInputValues {
  const out: CalculatorInputValues = {};
  for (const inp of schema.inputs) {
    if (inp.defaultValue !== undefined) out[inp.id] = inp.defaultValue;
    else if (inp.type === 'number') out[inp.id] = inp.min ?? 0;
    else if (inp.type === 'boolean') out[inp.id] = false;
    else if (inp.type === 'select' && inp.options?.length)
      out[inp.id] = inp.options[0].value;
  }
  return out;
}

const BAND_STYLES: Record<CalculatorResult['band'], string> = {
  low: 'bg-green-50 border-green-300 text-green-900',
  moderate: 'bg-amber-50 border-amber-300 text-amber-900',
  high: 'bg-orange-50 border-orange-300 text-orange-900',
  very_high: 'bg-red-50 border-red-300 text-red-900',
};

/**
 * Schema-driven clinical calculator widget (GAP-05, TZ §3.5.2).
 *
 * Reads its entire shape from `schema`. The result band colour-codes the
 * output and includes an interpretation + recommendation from i18n. The
 * formula disclaimer is always shown so users understand this is informational.
 */
export function ClinicalCalculator({ schema, audience = 'L1' }: Props) {
  const { t } = useLocale();
  const [values, setValues] = useState<CalculatorInputValues>(() =>
    buildDefaults(schema),
  );

  const result = useMemo(() => schema.compute(values), [schema, values]);

  const setValue = (id: string, next: number | boolean | string) => {
    setValues((prev) => ({ ...prev, [id]: next }));
  };

  const showFormula =
    schema.showFormulaForAudience &&
    (audience === 'L2' || audience === 'L3') &&
    (schema.showFormulaForAudience === 'L2' || audience === 'L3');

  return (
    <section
      className="rounded-xl border border-border bg-card p-4 space-y-3"
      aria-labelledby={`calc-${schema.id}`}
    >
      <header className="flex items-start gap-2">
        <CalcIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 id={`calc-${schema.id}`} className="text-sm font-semibold">
            {t(schema.nameKey)}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {schema.source}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {schema.inputs.map((input) => (
          <CalculatorField
            key={input.id}
            input={input}
            value={values[input.id]}
            onChange={(next) => setValue(input.id, next)}
          />
        ))}
      </div>

      <div
        className={`rounded-lg border p-3 flex items-center justify-between gap-3 ${BAND_STYLES[result.band]}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium opacity-80">
            {t(result.interpretationKey)}
          </p>
          {result.recommendationKey && (
            <p className="text-[11px] opacity-80 mt-0.5">
              {t(result.recommendationKey)}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold tabular-nums leading-none">
            {result.value}
          </div>
          {result.unit && (
            <div className="text-[10px] opacity-80 mt-1">{result.unit}</div>
          )}
        </div>
      </div>

      {showFormula && (
        <details className="text-[11px] text-muted-foreground">
          <summary className="cursor-pointer flex items-center gap-1 hover:text-foreground">
            <Info className="w-3 h-3" aria-hidden="true" />
            {t('calc.showFormula')}
          </summary>
          <p className="mt-1 leading-relaxed">{t('calc.disclaimer')}</p>
        </details>
      )}

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {t('calc.disclaimer')}
      </p>
    </section>
  );
}

interface FieldProps {
  input: CalculatorInput;
  value: number | boolean | string | undefined;
  onChange: (value: number | boolean | string) => void;
}

function CalculatorField({ input, value, onChange }: FieldProps) {
  const { t } = useLocale();
  const id = `calc-input-${input.id}`;

  if (input.type === 'number') {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-xs font-medium text-foreground">
          {t(input.labelKey)}
          {input.unit && (
            <span className="text-muted-foreground"> ({input.unit})</span>
          )}
        </label>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value === undefined ? '' : String(value)}
          min={input.min}
          max={input.max}
          step={input.step ?? 1}
          onChange={(e) => {
            const next = e.target.value === '' ? '' : Number(e.target.value);
            if (typeof next === 'number' && !Number.isNaN(next)) onChange(next);
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    );
  }

  if (input.type === 'boolean') {
    const selected = Boolean(value);
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-xs font-medium text-foreground">
          {t(input.labelKey)}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={selected}
          onClick={() => onChange(!selected)}
          className={`text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
            selected
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-background border-border text-muted-foreground'
          }`}
        >
          {selected ? t('wizard.risk.yes') : t('wizard.risk.no')}
        </button>
      </div>
    );
  }

  // select
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-foreground">
        {t(input.labelKey)}
      </label>
      <select
        id={id}
        value={value === undefined ? '' : String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {input.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
