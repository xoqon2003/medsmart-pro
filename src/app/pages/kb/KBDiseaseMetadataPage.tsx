import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2, Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useDiseaseDetail } from '../../hooks/useDiseases';
import { useLocale } from '../../store/LocaleContext';
import { ScientistsPanel } from '../../components/kb/metadata/ScientistsPanel';
import { ResearchPanel } from '../../components/kb/metadata/ResearchPanel';
import { GeneticsPanel } from '../../components/kb/metadata/GeneticsPanel';

/**
 * KB Admin — Disease Metadata editor.
 *
 * `/kb/diseases/:slug/metadata` — scientists, research, genetics uchun
 * Editor+ rolidagi foydalanuvchilarga CRUD interfeysi. Har bo'lim alohida
 * tab, har biri list + create/edit dialog + delete confirm bilan.
 *
 * Backend CRUD endpointlari disease UUID (`:id`) ni kutadi, frontend esa
 * slug bilan ishlaydi — disease detail'dan `id` ni oldindan olamiz.
 */
export function KBDiseaseMetadataPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLocale();
  const { data: disease, isLoading, isError } = useDiseaseDetail(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !disease) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <p className="text-destructive font-medium">Kasallik topilmadi.</p>
        <button
          onClick={() => navigate('/kb/diseases')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(`/kb/diseases/${slug}/edit`)}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          title={t('common.back')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Database className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold truncate">{disease.nameUz}</h1>
          <p className="text-xs text-muted-foreground font-mono">{disease.icd10}</p>
        </div>
      </div>

      <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
        {t('kb.metadata.pageTitle')}
      </h2>

      {/* Tabs */}
      <Tabs defaultValue="scientists" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scientists">
            {t('disease.scientists.title')}
          </TabsTrigger>
          <TabsTrigger value="research">
            {t('disease.research.title')}
          </TabsTrigger>
          <TabsTrigger value="genetics">
            {t('disease.genetics.title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scientists" className="mt-4">
          <ScientistsPanel slug={slug} diseaseId={disease.id} />
        </TabsContent>

        <TabsContent value="research" className="mt-4">
          <ResearchPanel slug={slug} diseaseId={disease.id} />
        </TabsContent>

        <TabsContent value="genetics" className="mt-4">
          <GeneticsPanel slug={slug} diseaseId={disease.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default KBDiseaseMetadataPage;
