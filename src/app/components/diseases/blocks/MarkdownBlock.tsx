import React from 'react';
import { renderMarkdown } from '../../../lib/marker-parser';
import type { DiseaseBlock } from '../../../types/api/disease';

interface Props {
  block: DiseaseBlock;
}

/**
 * Renders DiseaseBlock contentMd as safe HTML.
 * Uses our own renderMarkdown() which produces no user-controlled HTML —
 * all input comes from our own DB content, so dangerouslySetInnerHTML is safe here.
 * DOMPurify is intentionally NOT used (not in project dependencies).
 */
export function MarkdownBlock({ block }: Props) {
  const html = renderMarkdown(block.contentMd ?? '');

  return (
    <div
      className="prose prose-sm max-w-none text-foreground"
      /* eslint-disable-next-line react/no-danger */
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
