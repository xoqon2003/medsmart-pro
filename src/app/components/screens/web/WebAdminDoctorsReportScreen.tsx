import React from 'react';
import { motion } from 'motion/react';
import { Users, Star, TrendingUp, Banknote, ArrowUpRight } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DOCTORS = [
  { id: '1', name: 'Dr. Rahimov Sardor', specialty: 'Kardiolog', patients: 145, conclusions: 138, rating: 4.9, revenue: 18500000, lastActive: '2026-04-03 14:28' },
  { id: '2', name: 'Dr. Aliyeva Malika', specialty: 'Nevrolog', patients: 128, conclusions: 122, rating: 4.8, revenue: 15200000, lastActive: '2026-04-03 13:15' },
  { id: '3', name: 'Dr. Mirza Akbar', specialty: 'Travmatolog', patients: 112, conclusions: 108, rating: 4.7, revenue: 14800000, lastActive: '2026-04-03 12:30' },
  { id: '4', name: 'Dr. Ergashev Baxtiyor', specialty: 'Radiolog', patients: 234, conclusions: 230, rating: 4.9, revenue: 22100000, lastActive: '2026-04-03 13:08' },
  { id: '5', name: 'Dr. Ismoilov Nodir', specialty: 'Radiolog', patients: 198, conclusions: 195, rating: 4.6, revenue: 19500000, lastActive: '2026-04-03 12:30' },
  { id: '6', name: 'Dr. Kamalova Dildora', specialty: 'Ginekolog', patients: 96, conclusions: 90, rating: 4.8, revenue: 12300000, lastActive: '2026-04-02 16:45' },
  { id: '7', name: 'Dr. Xolmatov Jasur', specialty: 'Ortoped', patients: 87, conclusions: 82, rating: 4.5, revenue: 11800000, lastActive: '2026-04-03 11:20' },
  { id: '8', name: 'Dr. Nazarova Zilola', specialty: 'Pediatr', patients: 156, conclusions: 148, rating: 4.9, revenue: 16700000, lastActive: '2026-04-03 10:45' },
  { id: '9', name: 'Dr. Tursunov Bekzod', specialty: 'Urolog', patients: 78, conclusions: 74, rating: 4.4, revenue: 10200000, lastActive: '2026-04-02 15:30' },
  { id: '10', name: 'Dr. Yuldasheva Nargiza', specialty: 'Endokrinolog', patients: 92, conclusions: 88, rating: 4.7, revenue: 11500000, lastActive: '2026-04-03 09:50' },
  { id: '11', name: 'Dr. Azimov Otabek', specialty: 'Gastroenterolog', patients: 68, conclusions: 65, rating: 4.3, revenue: 8900000, lastActive: '2026-04-01 14:15' },
  { id: '12', name: 'Dr. Saidova Muhayo', specialty: 'Dermatolog', patients: 105, conclusions: 100, rating: 4.6, revenue: 13100000, lastActive: '2026-04-03 13:30' },
];

const TOP_CHART = DOCTORS.sort((a, b) => b.patients - a.patients).slice(0, 8).map(d => ({
  name: d.name.replace('Dr. ', '').split(' ')[0],
  bemorlar: d.patients,
}));

const fmt = (n: number) => { if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'; return n.toLocaleString(); };

export function WebAdminDoctorsReportScreen() {
  const totalDoctors = DOCTORS.length;
  const avgRating = (DOCTORS.reduce((a, d) => a + d.rating, 0) / totalDoctors).toFixed(1);
  const totalRevenue = DOCTORS.reduce((a, d) => a + d.revenue, 0);

  const kpis = [
    { label: 'Jami shifokorlar', value: totalDoctors, icon: Users, color: 'from-indigo-500 to-blue-600' },
    { label: 'Faol (bugun)', value: DOCTORS.filter(d => d.lastActive.startsWith('2026-04-03')).length, icon: TrendingUp, color: 'from-emerald-500 to-green-600' },
    { label: 'O\'rtacha reyting', value: avgRating, icon: Star, color: 'from-amber-500 to-orange-600' },
    { label: 'Jami daromad', value: fmt(totalRevenue), icon: Banknote, color: 'from-violet-500 to-purple-600' },
  ];

  return (
    <WebPlatformLayout title="Shifokorlar hisoboti" subtitle="Faollik, reytinglar va daromad">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}><k.icon className="w-5 h-5 text-white" /></div>
              <p className="text-white text-xl font-bold">{k.value}</p>
              <p className="text-slate-500 text-xs mt-1">{k.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4">Top shifokorlar (bemorlar soni bo'yicha)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={TOP_CHART} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="bemorlar" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[900px]">
            <thead><tr className="border-b border-slate-800">
              {['Shifokor', 'Mutaxassislik', 'Bemorlar', 'Xulosalar', 'Reyting', 'Daromad', 'Oxirgi faollik'].map(h => (
                <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody>{DOCTORS.map((d, i) => (
              <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.02 }}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3 text-white text-sm font-medium">{d.name}</td>
                <td className="px-5 py-3"><span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{d.specialty}</span></td>
                <td className="px-5 py-3 text-white text-sm">{d.patients}</td>
                <td className="px-5 py-3 text-slate-300 text-sm">{d.conclusions}</td>
                <td className="px-5 py-3"><div className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-white text-sm">{d.rating}</span></div></td>
                <td className="px-5 py-3 text-emerald-400 text-sm font-medium">{fmt(d.revenue)}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">{d.lastActive}</td>
              </motion.tr>
            ))}</tbody>
          </table></div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
