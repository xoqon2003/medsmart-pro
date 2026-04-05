import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Search, RefreshCw, ArrowDown } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const LEVELS = ['Barchasi', 'INFO', 'WARN', 'ERROR', 'DEBUG'];
const LEVEL_COLORS: Record<string, string> = { INFO: 'text-emerald-400', WARN: 'text-amber-400', ERROR: 'text-red-400', DEBUG: 'text-slate-500' };

const MOCK_LOGS = [
  { time: '14:35:22.456', level: 'INFO', module: 'Auth', message: 'User login successful: user_id=234, platform=web' },
  { time: '14:35:20.123', level: 'INFO', module: 'Application', message: 'Application #1256 created successfully' },
  { time: '14:34:58.789', level: 'WARN', module: 'Payment', message: 'Payment timeout for order #1255, retrying...' },
  { time: '14:34:45.012', level: 'INFO', module: 'Conclusion', message: 'Conclusion #890 updated by doctor_id=45' },
  { time: '14:34:30.345', level: 'ERROR', module: 'SMS', message: 'Failed to send OTP to +998901***67: Eskiz API timeout' },
  { time: '14:34:15.678', level: 'INFO', module: 'Kassa', message: 'Payment accepted: amount=450000, method=cash' },
  { time: '14:33:58.901', level: 'DEBUG', module: 'Cache', message: 'Cache miss for key: specialties_list, fetching from DB' },
  { time: '14:33:45.234', level: 'INFO', module: 'Auth', message: 'OTP sent to +998903***89' },
  { time: '14:33:30.567', level: 'WARN', module: 'FileStorage', message: 'S3 upload slow: 2.3s for image_456.jpg (1.2MB)' },
  { time: '14:33:15.890', level: 'INFO', module: 'WebSocket', message: 'Client connected: user_id=567, room=operator' },
  { time: '14:33:00.123', level: 'ERROR', module: 'Database', message: 'Connection pool exhausted, waiting for available connection' },
  { time: '14:32:45.456', level: 'INFO', module: 'Application', message: 'Application #1254 status changed: accepted -> conclusion_writing' },
  { time: '14:32:30.789', level: 'DEBUG', module: 'Auth', message: 'JWT token refreshed for user_id=123' },
  { time: '14:32:15.012', level: 'INFO', module: 'Health', message: 'Health check passed: db=ok, redis=ok, s3=ok' },
  { time: '14:32:00.345', level: 'WARN', module: 'RateLimit', message: 'Rate limit warning: IP 10.0.0.15 reached 80/100 requests/min' },
  { time: '14:31:45.678', level: 'INFO', module: 'Notification', message: 'Push notification sent to user_id=234: conclusion_ready' },
  { time: '14:31:30.901', level: 'INFO', module: 'Auth', message: 'User logout: user_id=456' },
  { time: '14:31:15.234', level: 'DEBUG', module: 'Cache', message: 'Cache set: key=user_profile_234, ttl=3600s' },
  { time: '14:31:00.567', level: 'ERROR', module: 'Payment', message: 'Payme webhook verification failed: invalid signature' },
  { time: '14:30:45.890', level: 'INFO', module: 'FileStorage', message: 'File uploaded: dicom_789.dcm (45.2MB) to S3' },
  { time: '14:30:30.123', level: 'INFO', module: 'Application', message: 'Application #1253 payment confirmed' },
  { time: '14:30:15.456', level: 'WARN', module: 'Memory', message: 'Heap usage at 75%: 1.2GB / 1.6GB' },
  { time: '14:30:00.789', level: 'DEBUG', module: 'Query', message: 'SELECT * FROM applications WHERE status=new LIMIT 50 (12ms)' },
  { time: '14:29:45.012', level: 'INFO', module: 'Bull', message: 'Job completed: send_email #4567 (350ms)' },
  { time: '14:29:30.345', level: 'INFO', module: 'Auth', message: 'New user registered: phone=+998911***67, role=patient' },
];

export function WebAdminLogsScreen() {
  const [level, setLevel] = useState('Barchasi');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  const filtered = MOCK_LOGS.filter(l =>
    (level === 'Barchasi' || l.level === level) &&
    (l.message.toLowerCase().includes(search.toLowerCase()) || l.module.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <WebPlatformLayout title="Tizim loglar" subtitle="Real-time server loglar">
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <select value={level} onChange={e => setLevel(e.target.value)} className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Log qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <button onClick={() => setAutoScroll(!autoScroll)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors ${autoScroll ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            <ArrowDown className="w-4 h-4" /> Auto-scroll
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors">
            <RefreshCw className="w-4 h-4" /> Yangilash
          </button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-gray-950 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
            <span className="text-slate-500">Terminal — {filtered.length} qator</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="h-[calc(100vh-320px)] overflow-y-auto p-4 space-y-0.5">
            {filtered.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                className="flex gap-2 py-0.5 hover:bg-slate-900/50 px-1 rounded">
                <span className="text-slate-600 shrink-0 w-6 text-right select-none">{i + 1}</span>
                <span className="text-slate-600 shrink-0">{log.time}</span>
                <span className={`shrink-0 w-12 font-bold ${LEVEL_COLORS[log.level]}`}>[{log.level}]</span>
                <span className="text-cyan-400 shrink-0">[{log.module}]</span>
                <span className="text-slate-300">{log.message}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
