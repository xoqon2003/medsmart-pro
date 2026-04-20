import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown } from 'lucide-react';
import type { DiseaseBlock } from '../../types/api/disease';

interface Props {
  blocks: DiseaseBlock[];
  className?: string;
}

export function TableOfContents({ blocks, className = '' }: Props) {
  return (
    <>
      {/* Desktop: always visible */}
      <nav className={`space-y-1 ${className}`} aria-label="Mundarija">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Mundarija
        </p>
        {blocks.map((block) => (
          <a
            key={block.id}
            href={`#block-${block.id}`}
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5 truncate"
          >
            {block.label}
          </a>
        ))}
      </nav>

      {/* Mobile: collapsible */}
      <Collapsible className="lg:hidden border border-border rounded-xl overflow-hidden mt-4">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-muted/40 hover:bg-muted transition-colors">
          Mundarija
          <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <nav className="px-4 py-3 space-y-1">
            {blocks.map((block) => (
              <a
                key={block.id}
                href={`#block-${block.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
              >
                {block.label}
              </a>
            ))}
          </nav>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
