import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLang, getLangName } from '../i18n/LangContext';
import { getComments } from '../services/api';

function DynamicsChart() {
  const { lang, t } = useLang();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const formatWeekLabel = (startDate) => {
    const d = new Date(startDate);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    return `${d.getDate()} ${t.months[d.getMonth()]} – ${end.getDate()} ${t.months[end.getMonth()]}`;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [en, es, ru] = await Promise.all([
        getComments({ lang: 'en', limit: 500 }),
        getComments({ lang: 'es', limit: 500 }),
        getComments({ lang: 'ru', limit: 500 }),
      ]);
      const map = {};
      const process = (comments, l) => {
        comments.forEach(c => {
          if (!c.created_at) return;
          const date = c.created_at.split('T')[0];
          if (!map[date]) map[date] = { date, en: 0, es: 0, ru: 0 };
          map[date][l]++;
        });
      };
      process(en.data.comments, 'en');
      process(es.data.comments, 'es');
      process(ru.data.comments, 'ru');

      const daily = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
      const weekly = [];
      for (let i = 0; i < daily.length; i += 7) {
        const chunk = daily.slice(i, i + 7);
        const w = { date: chunk[0].date, endDate: null, en: 0, es: 0, ru: 0 };
        const end = new Date(chunk[0].date);
        end.setDate(end.getDate() + 6);
        w.endDate = end.toISOString().split('T')[0];
        chunk.forEach(d => { w.en += d.en; w.es += d.es; w.ru += d.ru; });
        weekly.push(w);
      }
      setData(weekly);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div className="lt-card" style={{ textAlign: 'center', padding: 80, color: '#95a5a6' }}>{t.loading}</div>;

  // Genera labels con el idioma actual
  const chartData = data.map(d => ({ ...d, label: formatWeekLabel(d.date) }));

  const total = data.reduce((s, d) => s + d.en + d.es + d.ru, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;

  let peakWeek = chartData[0] || { label: '—', en: 0, es: 0, ru: 0 };
  chartData.forEach(d => {
    if ((d.en + d.es + d.ru) > (peakWeek.en + peakWeek.es + peakWeek.ru)) peakWeek = d;
  });

  const langTotals = { en: 0, es: 0, ru: 0 };
  data.forEach(d => { langTotals.en += d.en; langTotals.es += d.es; langTotals.ru += d.ru; });
  const topLang = Object.entries(langTotals).sort((a, b) => b[1] - a[1])[0];
  const langColors = { en: '#2ecc71', es: '#e67e22', ru: '#3498db' };

  return (
    <>
      <div className="lt-card">
        <div className="lt-card-title">
          {t.dynamicsTitle}
          <span className="lt-card-sub">{t.dynamicsSub}</span>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
            <XAxis dataKey="label" tick={{ fill: '#7f8c8d', fontSize: 10 }} interval={0} />
            <YAxis tick={{ fill: '#95a5a6', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, color: '#2c3e50', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Area type="monotone" dataKey="en" stroke="#2ecc71" fill="rgba(46,204,113,0.1)" name={getLangName('en', lang)} strokeWidth={2} dot={{ r: 4, fill: '#2ecc71' }} />
            <Area type="monotone" dataKey="es" stroke="#e67e22" fill="rgba(230,126,34,0.1)" name={getLangName('es', lang)} strokeWidth={2} dot={{ r: 4, fill: '#e67e22' }} />
            <Area type="monotone" dataKey="ru" stroke="#3498db" fill="rgba(52,152,219,0.1)" name={getLangName('ru', lang)} strokeWidth={2} dot={{ r: 4, fill: '#3498db' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="stat-3">
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 6 }}>{t.peakActivity}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50' }}>{peakWeek.label}</div>
          <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>{peakWeek.en + peakWeek.es + peakWeek.ru} {t.mentionsCount}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 6 }}>{t.mostActiveLang}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: langColors[topLang[0]] }}>{getLangName(topLang[0], lang)}</div>
          <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>{topLang[1]} {t.mentionsPeak}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 6 }}>{t.avgWeekly}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50' }}>{avg}</div>
          <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>{t.totalComments}</div>
        </div>
      </div>
    </>
  );
}

export default DynamicsChart;
