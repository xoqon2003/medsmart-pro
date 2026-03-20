import React from 'react';
import { motion } from 'motion/react';
import { Bell, ChevronRight, CheckCircle, AlertCircle, Info, XCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { formatDateTime } from '../../data/mockData';
import type { Screen } from '../../types';

export function NotificationsScreen() {
  const {
    currentUser, notifications, applications,
    markNotificationRead, markAllNotificationsRead, goBack,
    navigate, setSelectedApplication,
  } = useApp();

  const myNotifications = notifications.filter(n => !currentUser || n.userId === currentUser.id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50' };
      case 'warning': return { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' };
      case 'error': return { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' };
      default: return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' };
    }
  };

  const handleNotificationClick = (notifId: number, applicationId?: number) => {
    markNotificationRead(notifId);

    if (!applicationId || !currentUser) return;

    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    setSelectedApplication(app);

    // Navigate based on role
    const role = currentUser.role;
    const target: Record<string, Screen> = {
      patient: 'patient_status',
      radiolog: 'radiolog_view',
      doctor: 'doctor_dashboard',
      specialist: 'specialist_dashboard',
      operator: 'operator_dashboard',
      admin: 'admin_dashboard',
    };
    if (target[role]) navigate(target[role]);
  };

  const unread = myNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white rotate-180" />
            </button>
            <div>
              <h1 className="text-white text-lg">Bildirishnomalar</h1>
              <p className="text-blue-200 text-xs">
                {unread > 0 ? `${unread} ta o'qilmagan` : "Barchasi o'qilgan"}
              </p>
            </div>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-blue-200 text-xs bg-white/10 rounded-lg px-3 py-1.5 flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Barchasini o'qildi
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-3 -mt-4 pb-24">
        {myNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Bildirishnomalar yo'q</p>
          </div>
        ) : (
          myNotifications.map((notif, i) => {
            const Icon = getIcon(notif.type);
            const colors = getColor(notif.type);
            const hasApp = !!notif.applicationId;
            const app = hasApp ? applications.find(a => a.id === notif.applicationId) : null;

            return (
              <motion.button
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleNotificationClick(notif.id, notif.applicationId)}
                className={`w-full bg-white rounded-2xl shadow-sm p-4 text-left border-l-4 ${colors.border} ${!notif.isRead ? 'ring-1 ring-blue-100' : ''} transition-all active:scale-[0.99]`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</p>
                      {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-gray-400 text-xs">{formatDateTime(notif.createdAt)}</p>
                      {hasApp && app && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${colors.light} ${colors.text}`}>
                          <span className="truncate max-w-[80px]">{app.arizaNumber}</span>
                          <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}