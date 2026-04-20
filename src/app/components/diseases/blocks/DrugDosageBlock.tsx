import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pill } from 'lucide-react';
import type { DiseaseBlock } from '../../../types/api/disease';

interface Props {
  block: DiseaseBlock;
}

interface DrugEntry {
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  note: string;
}

/**
 * L2 — Dorilar dozajlari bloki.
 * contentMd da har qator: `Dori nomi | doz | yo'l | tezlik | izoh`
 * Bo'sh qatorlar o'tkazib yuboriladi; pipe yo'q qatorlar nomi sifatida ko'rsatiladi.
 */
function parseDrugLines(md: string): DrugEntry[] {
  return md
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      return {
        name: parts[0] ?? line,
        dosage: parts[1] ?? '',
        route: parts[2] ?? '',
        frequency: parts[3] ?? '',
        note: parts[4] ?? '',
      };
    });
}

export function DrugDosageBlock({ block }: Props) {
  const [expanded, setExpanded] = useState(false);
  const drugs = parseDrugLines(block.contentMd ?? '');

  return (
    <div className="rounded-xl border border-blue-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50/60 hover:bg-blue-100/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <span className="text-sm font-medium">{block.label}</span>
          <span className="inline-flex items-center rounded-md border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
            Shifokor uchun
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          {drugs.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Dorilar ro'yxati hali kiritilmagan.
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-50/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium border-b border-blue-100">Dori</th>
                  <th className="px-4 py-2 font-medium border-b border-blue-100">Doz</th>
                  <th className="px-4 py-2 font-medium border-b border-blue-100">Yo'l</th>
                  <th className="px-4 py-2 font-medium border-b border-blue-100">Tezlik</th>
                  <th className="px-4 py-2 font-medium border-b border-blue-100">Izoh</th>
                </tr>
              </thead>
              <tbody>
                {drugs.map((drug, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-background' : 'bg-blue-50/20'}
                  >
                    <td className="px-4 py-2 font-medium text-foreground border-b border-blue-50">
                      {drug.name}
                    </td>
                    <td className="px-4 py-2 text-foreground border-b border-blue-50">
                      {drug.dosage || '—'}
                    </td>
                    <td className="px-4 py-2 text-foreground border-b border-blue-50">
                      {drug.route || '—'}
                    </td>
                    <td className="px-4 py-2 text-foreground border-b border-blue-50">
                      {drug.frequency || '—'}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground border-b border-blue-50">
                      {drug.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
