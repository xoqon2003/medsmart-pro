import React, { useState } from 'react';
import { useApp } from '../../../store/appStore';
import { QRCodeSVG } from 'qrcode.react';
import {
  ChevronLeft, Copy, Check, Share2,
  Send, Instagram, Youtube, Globe, Linkedin, Facebook,
} from 'lucide-react';

export function DoctorShareProfile() {
  const { goBack, currentUser } = useApp();
  const [copied, setCopied] = useState(false);

  const profileUrl = `https://medsmart-pro.vercel.app/d/${currentUser?.fullName?.toLowerCase().replace(/\s+/g, '-') ?? 'doctor'}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Dr. ${currentUser?.fullName}`, url: profileUrl });
      } catch {}
    }
  };

  const socialLinks = [
    { label: 'Telegram', icon: <Send size={20} />, color: 'bg-sky-50 text-sky-600', url: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}` },
    { label: 'Instagram', icon: <Instagram size={20} />, color: 'bg-pink-50 text-pink-600', url: '#' },
    { label: 'Facebook', icon: <Facebook size={20} />, color: 'bg-blue-50 text-blue-600', url: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}` },
    { label: 'LinkedIn', icon: <Linkedin size={20} />, color: 'bg-indigo-50 text-indigo-600', url: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
        <h1 className="text-base font-semibold text-gray-900">Profilni ulashish</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* QR Code placeholder */}
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
          <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mb-4 p-3">
            <QRCodeSVG value={profileUrl} size={168} level="M" />
          </div>
          <p className="text-sm font-semibold text-gray-900">{currentUser?.fullName}</p>
          <p className="text-xs text-gray-500">{currentUser?.specialty}</p>
        </div>

        {/* Profile URL */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-2">Profil manzili</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 truncate border border-gray-200">
              {profileUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`p-2.5 rounded-xl transition-colors ${copied ? 'bg-green-100' : 'bg-blue-50'}`}
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-blue-600" />}
            </button>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Share2 size={16} /> Ulashish
        </button>

        {/* Social share */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-700 mb-3">Ijtimoiy tarmoqlarda ulashish</p>
          <div className="grid grid-cols-4 gap-3">
            {socialLinks.map(sl => (
              <a
                key={sl.label}
                href={sl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5"
              >
                <div className={`w-12 h-12 rounded-2xl ${sl.color} flex items-center justify-center`}>
                  {sl.icon}
                </div>
                <span className="text-[10px] text-gray-600">{sl.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
