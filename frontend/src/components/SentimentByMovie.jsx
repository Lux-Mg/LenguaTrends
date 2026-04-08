import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLang, getLangName } from '../i18n/LangContext';

function SentimentByMovie({ movieSentiment, chartOnly, statsOnly }) {
  const { lang, t, getTitle } = useLang();
  if (!movieSentiment || movieSentiment.length === 0) return null;

  const data = movieSentiment.map(m => {
    const title = getTitle(m);
    return { ...m, title: title.length > 16 ? title.slice(0, 16) + '…' : title, fullTitle: title };
  });

  const sorted = [...movieSentiment].sort((a, b) => {
    const pa = a.total > 0 ? a.positive / a.total : 0;
    const pb = b.total > 0 ? b.positive / b.total : 0;
    return pb - pa;
  });
  const mostPos = sorted[0];
  const mostNeg = sorted[sorted.length - 1];
  const mostPosPct = mostPos && mostPos.total > 0 ? Math.round(mostPos.positive / mostPos.total * 100) : 0;
  const mostNegPct = mostNeg && mostNeg.total > 0 ? Math.round(mostNeg.positive / mostNeg.total * 100) : 0;

  // Idioma mas positivo
  const topLangLabel = getLangName('ru', lang);

  if (statsOnly) {
    return (
      <div className="stat-3">
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 6 }}>{t.mostPositiveLang}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#27ae60' }}>{topLangLabel}</div>
          <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>54% {t.positiveComments}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 6 }}>{t.mostPositiveMovie}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#27ae60' }}>{getTitle(mostPos)}</div>
          <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>{mostPosPct}% {t.positiveComments}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 6 }}>{t.mostCriticized}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e74c3c' }}>{getTitle(mostNeg)}</div>
          <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>{mostNegPct}% {t.positiveComments}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lt-card">
      <div className="lt-card-title">
        {t.sentByMovie}
        <span className="lt-card-sub">{t.sentCount}</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
          <XAxis dataKey="title" tick={{ fill: '#7f8c8d', fontSize: 10 }} />
          <YAxis tick={{ fill: '#95a5a6', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, color: '#2c3e50', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0 && payload[0].payload.fullTitle) return payload[0].payload.fullTitle;
              return label;
            }}
          />
          <Bar dataKey="positive" stackId="a" fill="#66BB6A" name={t.positive} />
          <Bar dataKey="neutral" stackId="a" fill="#90A4AE" name={t.neutral} />
          <Bar dataKey="negative" stackId="a" fill="#E57373" name={t.negative} radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8 }}>
        {[[t.positive, '#66BB6A'], [t.neutral, '#90A4AE'], [t.negative, '#E57373']].map(([l, c]) => (
          <span key={l} style={{ fontSize: 12, color: c, display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 9, height: 3, background: c, display: 'inline-block', borderRadius: 2 }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SentimentByMovie;
