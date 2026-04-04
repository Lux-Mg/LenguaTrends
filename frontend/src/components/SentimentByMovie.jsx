import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SentimentByMovie({ movieSentiment, chartOnly, statsOnly }) {
  if (!movieSentiment || movieSentiment.length === 0) return null;

  const data = movieSentiment.map(m => ({
    ...m, title: m.title.length > 16 ? m.title.slice(0, 16) + '…' : m.title, fullTitle: m.title,
  }));

  const sorted = [...movieSentiment].sort((a, b) => {
    const pa = a.total > 0 ? a.positive / a.total : 0;
    const pb = b.total > 0 ? b.positive / b.total : 0;
    return pb - pa;
  });
  const mostPos = sorted[0];
  const mostNeg = sorted[sorted.length - 1];
  const mostPosPct = mostPos && mostPos.total > 0 ? Math.round(mostPos.positive / mostPos.total * 100) : 0;
  const mostNegPct = mostNeg && mostNeg.total > 0 ? Math.round(mostNeg.positive / mostNeg.total * 100) : 0;

  if (statsOnly) {
    return (
      <div className="stat-3">
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Самый позитивный язык</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#22c55e' }}>Русский</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>54% позитивных комм.</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Самый позитивный фильм</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#22c55e' }}>{mostPos?.title || '—'}</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{mostPosPct}% позитивных комм.</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Наиболее критикуемый</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#ef4444' }}>{mostNeg?.title || '—'}</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{mostNegPct}% позитивных комм.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lt-card">
      <div className="lt-card-title">
        Тональность по фильмам
        <span className="lt-card-sub">кол. комментариев</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="title" tick={{ fill: '#475569', fontSize: 10 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#0b0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0 && payload[0].payload.fullTitle) return payload[0].payload.fullTitle;
              return label;
            }}
          />
          <Bar dataKey="positive" stackId="a" fill="rgba(34,197,94,0.75)" name="Позитив" />
          <Bar dataKey="neutral" stackId="a" fill="rgba(148,163,184,0.6)" name="Нейтрал" />
          <Bar dataKey="negative" stackId="a" fill="rgba(239,68,68,0.75)" name="Негатив" />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8 }}>
        {[['Позитив', '#22c55e'], ['Нейтрал', '#94a3b8'], ['Негатив', '#ef4444']].map(([l, c]) => (
          <span key={l} style={{ fontSize: 12, color: c, display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 9, height: 3, background: c, display: 'inline-block', borderRadius: 2 }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SentimentByMovie;
