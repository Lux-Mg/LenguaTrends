import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const panel = {
  background: '#1e293b', borderRadius: 12, padding: 22,
  border: '1px solid #334155',
};

const LANGS = [
  { key: 'en', label: 'English', color: '#3b82f6' },
  { key: 'es', label: 'Español', color: '#f59e0b' },
  { key: 'ru', label: 'Русский', color: '#ef4444' },
];

function LanguageDonut({ stats }) {
  if (!stats?.by_language) return null;

  const data = LANGS.map(l => ({
    name: l.label, value: stats.by_language[l.key] || 0, color: l.color,
  }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={panel}>
      <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontSize: 15, fontWeight: 600 }}>
        🌍 Распределение по языкам
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
            dataKey="value" paddingAngle={4} strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{d.name}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginTop: 2 }}>
              {d.value.toLocaleString()}
              <span style={{ fontSize: 11, fontWeight: 400, color: '#64748b', marginLeft: 4 }}>
                ({total > 0 ? Math.round(d.value / total * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LanguageDonut;
