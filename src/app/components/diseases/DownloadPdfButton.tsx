import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { exportDiseaseToPdf } from '../../lib/pdf-export';
import { useLocale } from '../../store/LocaleContext';
import type { DiseaseDetail } from '../../types/api/disease';

interface Props {
  disease: DiseaseDetail;
  className?: string;
}

export function DownloadPdfButton({ disease, className }: Props) {
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();

  async function handleDownload() {
    setLoading(true);
    try {
      await exportDiseaseToPdf(disease);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {loading ? t('disease.preparingPdf') : t('disease.downloadPdf')}
    </Button>
  );
}
