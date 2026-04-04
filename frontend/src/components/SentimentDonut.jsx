import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const panel = {
  background: '#1e293b', borderRadius: 12, padding: 22,
  border: '1px solid #334155',
};

const COLORS = { positive: '#22c55e', negative: '#ef4444', neutral: '#64748b' };
const LABELS = { positive: 'Позитив', negative: 'Негатив', neutral: 'Нейтрал' };

function SentimentDonut({ sentimentData }) {
  if (!sentimentData) return null;

  let totals = { positive: 0, negative: 0, neutral: 0 };
  Object.values(sentimentData).forEach(v => {
    totals.positive += v.positive;
    totals.negative += v.negative;
    totals.neutral += v.neutral;
  });

  const total = totals.positive + totals.negative + totals.neutral;
  const data = Object.entries(totals).map(([key, val]) => ({
    name: LABELS[key], value: val, pct: total > 0 ? Math.round(val / total * 100) : 0,
  }));

  return (
    <div style={panel}>
      <h3 style={{ margin: '0 0 18px', color: '#f1f5f9', fontSize: 15, fontWeight: 600 }}>
        ◆ Распределение тональности
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={100}
            dataKey="value" paddingAngle={3} strokeWidth={0}>
            {data.map((d, i) => (
              <Cell key={i} fill={Object.values(COLORS)[i]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: Object.values(COLORS)[i] }} />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{d.name} — {d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SentimentDonut;
