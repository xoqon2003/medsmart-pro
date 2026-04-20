import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ShieldCheck } from 'lucide-react';
import { MEDICAL_COPY } from '../../lib/medical-copy';

const TERMS_KEY = 'medsmart_terms_v1';

function readTerms(): boolean {
  try {
    return localStorage.getItem(TERMS_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeTerms(): void {
  try {
    localStorage.setItem(TERMS_KEY, 'true');
  } catch {
    // storage unavailable
  }
}

/**
 * App birinchi ochilganda ko'rsatiladigan shartlar dialogi.
 * Foydalanuvchi "Qabul qilaman" bosgunicha yoki app yopilgunicha ko'rinadi.
 * localStorage: `medsmart_terms_v1`
 */
export function TermsAcceptDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Client-side mount: faqat localStorage ga avval qabul qilinmagan bo'lsa ochiladi
    if (!readTerms()) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    writeTerms();
    setOpen(false);
  };

  const handleDecline = () => {
    // App yopiladi / blank page
    try {
      window.location.href = 'about:blank';
    } catch {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { /* close orqali yopib bo'lmaydi */ }}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden"
        // Escape yoki tashqariga bosib yopib bo'lmaydi
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              key="terms-dialog"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <DialogHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <DialogTitle className="text-base leading-snug">
                    {MEDICAL_COPY.disclaimerTitle}
                  </DialogTitle>
                </div>
              </DialogHeader>

              <div className="px-6 pb-2">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {MEDICAL_COPY.consentText}
                </p>
              </div>

              <DialogFooter className="px-6 py-4 flex flex-col gap-2 sm:flex-col border-t border-border mt-4">
                <Button className="w-full" onClick={handleAccept}>
                  Qabul qilaman
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleDecline}
                >
                  Chiqish
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
