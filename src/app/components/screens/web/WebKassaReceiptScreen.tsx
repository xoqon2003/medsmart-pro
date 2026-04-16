import React from 'react';
import { motion } from 'motion/react';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useNavigation } from '../../../store/navigationContext';

export function WebKassaReceiptScreen() {
  const { navigate } = useNavigation();

  return (
    <WebPlatformLayout title="Chek chop etish" subtitle="Kvitansiya va chek generatsiya">
      <div className="p-6 flex justify-center">
        <div className="max-w-md w-full space-y-4">
          {/* Receipt preview */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 text-black font-mono text-sm shadow-2xl">
            <div className="text-center mb-4">
              <h2 className="font-bold text-lg">MedSmartPro</h2>
              <p className="text-gray-500 text-xs">Tibbiy diagnostika markazi</p>
              <p className="text-gray-500 text-xs">Toshkent, Yunusobod t., Amir Temur 45</p>
              <p className="text-gray-500 text-xs">Tel: +998 71 234-56-78</p>
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Chek raqami:</span><span className="font-bold">#CHK-2026-0456</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Sana:</span><span>2026-04-03 14:35</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Kassir:</span><span>Rahimova Mohira</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Smena:</span><span>#SM-045</span></div>
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Bemor:</span><span className="font-bold">Karimov Aziz B.</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ariza:</span><span>#1256</span></div>
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>MRT bosh miya tekshiruvi</span>
                <span className="font-bold">450 000</span>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span>Jami:</span><span className="font-bold">450 000 so'm</span></div>
              <div className="flex justify-between"><span>Chegirma:</span><span>0 so'm</span></div>
              <div className="flex justify-between text-sm font-bold"><span>TO'LASH KERAK:</span><span>450 000 so'm</span></div>
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">To'lov usuli:</span><span className="font-bold">Naqd</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Qabul qilingan:</span><span>500 000 so'm</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Qaytim:</span><span>50 000 so'm</span></div>
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="text-center text-gray-400 text-xs">
              <p>Xizmatimizdan foydalanganingiz uchun rahmat!</p>
              <p>www.medsmart.uz</p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('web_kassa_dashboard')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Orqaga
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Printer className="w-4 h-4" /> Chop etish
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
