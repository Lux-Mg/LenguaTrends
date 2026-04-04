import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const langNames = { EN: 'English', ES: 'Español', RU: 'Русский' };

function SentimentChart({ sentimentData }) {
  if (!sentimentData) return null;

  const data = Object.entries(sentimentData).map(([lang, v]) => ({
    language: lang.toUpperCase(),
    positive: v.positive, negative: v.negative, neutral: v.neutral,
    total: v.positive + v.negative + v.neutral,
  }));

  return (
    <div className="lt-card">
      <div className="lt-card-title">
        Тональность по языкам
        <span className="lt-card-sub">кол. комментариев</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="language" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0b0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 13 }} />
          <Bar dataKey="positive" fill="rgba(34,197,94,0.75)" name="Позитив" radius={[4, 4, 0, 0]} />
          <Bar dataKey="neutral" fill="rgba(148,163,184,0.6)" name="Нейтрал" radius={[4, 4, 0, 0]} />
          <Bar dataKey="negative" fill="rgba(239,68,68,0.75)" name="Негатив" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8 }}>
        {[['Позитив', '#22c55e'], ['Нейтрал', '#94a3b8'], ['Негатив', '#ef4444']].map(([l, c]) => (
          <span key={l} style={{ fontSize: 12, color: c, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 3, background: c, display: 'inline-block', borderRadius: 2 }} />{l}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {data.map(d => (
          <div key={d.language} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{langNames[d.language] || d.language}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8', marginTop: 2 }}>{d.total.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#475569' }}>комм.</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SentimentChart;
