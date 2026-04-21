import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Loader2, FileDown, BookmarkPlus, Star, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { sendTriageToDoctor, saveTriageNote } from '../../api/triage';
import { useAvailableDoctors } from '../../hooks/useDoctors';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  score: number;
  diseaseName: string;
}

export function SendToDoctorDialog({
  isOpen,
  onClose,
  sessionId,
  score,
  diseaseName,
}: Props) {
  const navigate = useNavigate();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const {
    data: doctors,
    isLoading: doctorsLoading,
    isError: doctorsError,
  } = useAvailableDoctors();

  const handleSend = async () => {
    if (!selectedDoctorId || !consented) return;
    setLoading(true);
    try {
      await sendTriageToDoctor(sessionId, {
        doctorId: selectedDoctorId,
        anonymousMode,
      });
      toast.success("Yuborildi! Shifokor tez orada javob beradi.", {
        description: "Natijalarni 'Mening tahlillarim' bo'limida kuzating.",
        duration: 5000,
      });
      onClose();
      // Navigate to patient analysis history so the user can track their sent sessions
      navigate('/bemor/tahlillarim');
    } catch {
      toast.error("Yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToProfile = async () => {
    setSavingNote(true);
    try {
      const noteMd = `## ${diseaseName}\n\nMoslik: ${Math.round(score * 100)}%\nSana: ${new Date().toLocaleDateString('uz-UZ')}`;
      await saveTriageNote(sessionId, noteMd);
      toast.success("Profilga saqlandi.");
    } catch {
      toast.error("Saqlashda xatolik.");
    } finally {
      setSavingNote(false);
    }
  };

  const canSend = !!selectedDoctorId && consented && !loading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Shifokorga yuborish</DialogTitle>
          <DialogDescription>
            {diseaseName} bo'yicha simptom tahlilini shifokorga yuboring.
            Moslik: <strong>{Math.round(score * 100)}%</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Doctor selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Shifokorni tanlang</p>

            {/* Loading */}
            {doctorsLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            )}

            {/* Error */}
            {doctorsError && !doctorsLoading && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Shifokorlar ro'yxatini yuklashda xatolik. Qayta urinib ko'ring.
              </div>
            )}

            {/* Doctor list */}
            {!doctorsLoading && !doctorsError && (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(doctors ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Hozircha shifokorlar ro'yxatda yo'q.
                  </p>
                ) : (
                  (doctors ?? []).map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        selectedDoctorId === doc.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{doc.fullName}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {doc.specialty && (
                            <span className="text-xs text-muted-foreground">{doc.specialty}</span>
                          )}
                          {doc.rating != null && (
                            <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                              <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                              {doc.rating.toFixed(1)}
                            </span>
                          )}
                          {doc.city && (
                            <span className="text-xs text-muted-foreground">· {doc.city}</span>
                          )}
                        </div>
                      </div>
                      {selectedDoctorId === doc.id && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0 ml-2">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Anonim rejim</p>
              <p className="text-xs text-muted-foreground">
                Ism va kontakt ma'lumotlari yashiriladi
              </p>
            </div>
            <Switch
              checked={anonymousMode}
              onCheckedChange={setAnonymousMode}
            />
          </div>

          <Separator />

          {/* Consent checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5 accent-primary w-4 h-4 shrink-0"
            />
            <span className="text-sm text-muted-foreground leading-relaxed">
              Tibbiy ma'lumotlarim ko'rsatilgan shifokorga yuborilishiga roziman.
            </span>
          </label>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            className="w-full"
            disabled={!canSend}
            onClick={handleSend}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Yuborilmoqda...
              </>
            ) : (
              'Yuborish'
            )}
          </Button>

          <div className="flex gap-2">
            {/* PDF — disabled with tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      disabled
                    >
                      <FileDown className="w-4 h-4" />
                      PDF
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tez orada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="outline"
              className="flex-1 gap-2"
              disabled={savingNote}
              onClick={handleSaveToProfile}
            >
              {savingNote ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookmarkPlus className="w-4 h-4" />
              )}
              Saqlash (profilga)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
