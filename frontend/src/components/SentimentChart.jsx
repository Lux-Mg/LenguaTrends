import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLang, getLangName } from '../i18n/LangContext';

function SentimentChart({ sentimentData }) {
  const { lang, t } = useLang();
  if (!sentimentData) return null;

  const data = Object.entries(sentimentData).map(([l, v]) => ({
    language: l.toUpperCase(),
    langName: getLangName(l, lang),
    positive: v.positive, negative: v.negative, neutral: v.neutral,
    total: v.positive + v.negative + v.neutral,
  }));

  return (
    <div className="lt-card">
      <div className="lt-card-title">
        {t.sentByLang}
        <span className="lt-card-sub">{t.sentCount}</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
          <XAxis dataKey="language" tick={{ fill: '#2c3e50', fontSize: 12 }} />
          <YAxis tick={{ fill: '#95a5a6', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, color: '#2c3e50', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
          <Bar dataKey="positive" fill="#66BB6A" name={t.positive} radius={[4, 4, 0, 0]} />
          <Bar dataKey="neutral" fill="#90A4AE" name={t.neutral} radius={[4, 4, 0, 0]} />
          <Bar dataKey="negative" fill="#E57373" name={t.negative} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8 }}>
        {[[t.positive, '#66BB6A'], [t.neutral, '#90A4AE'], [t.negative, '#E57373']].map(([l, c]) => (
          <span key={l} style={{ fontSize: 12, color: c, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 3, background: c, display: 'inline-block', borderRadius: 2 }} />{l}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 14, paddingTop: 12, borderTop: '1px solid #eef0f2' }}>
        {data.map(d => (
          <div key={d.language} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2c3e50' }}>{d.langName}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#2c3e50', marginTop: 2 }}>{d.total.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#95a5a6' }}>{t.comments}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SentimentChart;
