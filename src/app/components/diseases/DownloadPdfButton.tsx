import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { exportDiseaseToPdf } from '../../lib/pdf-export';
import { useLocale } from '../../store/LocaleContext';
import type {
  DiseaseDetail,
  DiseaseScientist,
  DiseaseResearch,
  DiseaseGenetic,
} from '../../types/api/disease';

interface Props {
  disease: DiseaseDetail;
  className?: string;
  /** Metadata seksiyalari — PDF'ga qo'shiladi */
  scientists?: DiseaseScientist[];
  research?: DiseaseResearch[];
  genetics?: DiseaseGenetic[];
}

export function DownloadPdfButton({ disease, className, scientists, research, genetics }: Props) {
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();

  async function handleDownload() {
    setLoading(true);
    try {
      await exportDiseaseToPdf(disease, { scientists, research, genetics });
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
