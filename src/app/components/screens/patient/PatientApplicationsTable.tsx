import React from 'react';
import { motion } from 'motion/react';
import { Download, ChevronRight, AlertCircle } from 'lucide-react';
import type { Application } from '../../../types';
import { getStatusLabel, getUrgencyLabel, formatDate, formatPrice, getServiceLabel } from '../../../utils/formatters';

interface Props {
  applications: Application[];
  onSelect: (app: Application) => void;
  onDownload?: (app: Application) => void;
  downloadingId?: number | null;
}

export function PatientApplicationsTable({ applications, onSelect, onDownload, downloadingId }: Props) {
  if (applications.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Sana</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Ariza #</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Xizmat</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Tekshiruv</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Narx</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Holat</th>
              <th className="w-10 px-2 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const status = getStatusLabel(app.status);
              const urgency = getUrgencyLabel(app.urgency);
              const service = getServiceLabel(app.serviceType);
              const hasConcluison = (app.conclusions?.length || 0) > 0 && app.status === 'done';

              const rowBg =
                app.status === 'extra_info_needed' ? 'bg-amber-50/60' : 'bg-white';
              const borderLeft =
                app.urgency === 'emergency'
                  ? 'border-l-2 border-l-red-500'
                  : app.urgency === 'urgent'
                    ? 'border-l-2 border-l-yellow-500'
                    : 'border-l-2 border-l-transparent';

              return (
                <tr
                  key={app.id}
                  onClick={() => onSelect(app)}
                  className={`${rowBg} ${borderLeft} border-b border-gray-50 cursor-pointer hover:bg-gray-50/80 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">{formatDate(app.createdAt)}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-gray-900 text-sm font-medium">{app.arizaNumber}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-600">
                      {service.icon} {service.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-gray-700">{app.scanType}</span>
                    <span className="text-gray-300 mx-1">•</span>
                    <span className="text-sm text-gray-500">{app.organ}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-blue-600">{formatPrice(app.price)}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {app.status === 'booked' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-600 text-white font-medium">
                          Davom etish →
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      )}
                      {app.status === 'extra_info_needed' && (
                        <AlertCircle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                    {hasConcluison && onDownload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(app);
                        }}
                        disabled={downloadingId === app.id}
                        className="mt-1 flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-[11px]"
                      >
                        {downloadingId === app.id ? (
                          <div className="w-3 h-3 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        <span>Xulosa</span>
                      </button>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
