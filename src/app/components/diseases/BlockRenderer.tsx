import React from 'react';
import type { DiseaseBlock } from '../../types/api/disease';
import { MarkdownBlock } from './blocks/MarkdownBlock';
import { StagesStepper } from './blocks/StagesStepper';
import { MedicationTable } from './blocks/MedicationTable';
import { SymptomsList } from './blocks/SymptomsList';
import { EmergencyBanner } from './blocks/EmergencyBanner';
import { ReferenceList } from './blocks/ReferenceList';
import { ClinicalCaseCard } from './blocks/ClinicalCaseCard';
import { ClinicalProtocolBlock } from './blocks/ClinicalProtocolBlock';
import { DrugDosageBlock } from './blocks/DrugDosageBlock';
import { DifferentialDiagnosisBlock } from './blocks/DifferentialDiagnosisBlock';
import { ScientificReferencesBlock } from './blocks/ScientificReferencesBlock';

interface Props {
  block: DiseaseBlock;
}

/** Level badge shown in the block header for L2/L3 content. */
function LevelBadge({ level }: { level: 'L1' | 'L2' | 'L3' }) {
  if (level === 'L1') return null;

  if (level === 'L2') {
    return (
      <span className="inline-flex items-center rounded-md border border-blue-300 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ml-2">
        Shifokor uchun
      </span>
    );
  }

  // L3
  return (
    <span className="inline-flex items-center rounded-md border border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 ml-2">
      Mutaxassis uchun
    </span>
  );
}

/**
 * Routes each block to the appropriate renderer based on its marker.
 * Wrapped in a section with an anchor id for TableOfContents deep-linking.
 */
export function BlockRenderer({ block }: Props) {
  const content = renderBlockContent(block);

  return (
    <section id={`block-${block.id}`} aria-labelledby={`block-label-${block.id}`}>
      <h2
        id={`block-label-${block.id}`}
        className="text-base font-semibold text-foreground mb-3 flex items-center flex-wrap gap-1"
      >
        {block.label}
        <LevelBadge level={block.level} />
      </h2>
      {content}
    </section>
  );
}

function renderBlockContent(block: DiseaseBlock): React.ReactNode {
  // L2-specific renderers
  if (block.level === 'L2') {
    switch (block.marker) {
      case 'medications':
      case 'treatment':
        return <DrugDosageBlock block={block} />;
      case 'guidelines':
      case 'procedures':
      case 'labs':
      case 'imaging':
      case 'monitoring':
      case 'follow_up':
        return <ClinicalProtocolBlock block={block} />;
      default:
        break;
    }
  }

  // L3-specific renderers
  if (block.level === 'L3') {
    switch (block.marker) {
      case 'differential':
        return <DifferentialDiagnosisBlock block={block} />;
      case 'references':
        return <ScientificReferencesBlock block={block} />;
      case 'guidelines':
      case 'procedures':
      case 'labs':
      case 'imaging':
      case 'monitoring':
        return <ClinicalProtocolBlock block={block} />;
      case 'medications':
      case 'treatment':
        return <DrugDosageBlock block={block} />;
      default:
        break;
    }
  }

  // L1 (and L2/L3 fallthrough) renderers
  switch (block.marker) {
    case 'overview':
    case 'definition':
    case 'etiology':
    case 'pathogenesis':
      return <MarkdownBlock block={block} />;

    case 'stages':
    case 'classification':
      return <StagesStepper block={block} />;

    case 'medications':
      return <MedicationTable block={block} />;

    case 'symptoms':
      return <SymptomsList block={block} />;

    case 'red_flags':
    case 'emergency':
      return <EmergencyBanner block={block} />;

    case 'references':
      return <ReferenceList block={block} />;

    case 'clinical_cases':
      return <ClinicalCaseCard block={block} />;

    default:
      return <MarkdownBlock block={block} />;
  }
}
