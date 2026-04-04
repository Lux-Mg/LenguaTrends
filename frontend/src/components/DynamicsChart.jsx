import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getComments } from '../services/api';

function DynamicsChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const formatWeekLabel = (startDate) => {
    const d = new Date(startDate);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${d.getDate()} ${months[d.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]}`;
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
      const process = (comments, lang) => {
        comments.forEach(c => {
          if (!c.created_at) return;
          const date = c.created_at.split('T')[0];
          if (!map[date]) map[date] = { date, en: 0, es: 0, ru: 0 };
          map[date][lang]++;
        });
      };
      process(en.data.comments, 'en');
      process(es.data.comments, 'es');
      process(ru.data.comments, 'ru');

      const daily = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
      const weekly = [];
      for (let i = 0; i < daily.length; i += 7) {
        const chunk = daily.slice(i, i + 7);
        const w = { date: chunk[0].date, label: formatWeekLabel(chunk[0].date), en: 0, es: 0, ru: 0 };
        chunk.forEach(d => { w.en += d.en; w.es += d.es; w.ru += d.ru; });
        weekly.push(w);
      }
      setData(weekly);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div className="lt-card" style={{ textAlign: 'center', padding: 80, color: '#475569' }}>Загрузка...</div>;

  const total = data.reduce((s, d) => s + d.en + d.es + d.ru, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;

  // Encontrar semana pico
  let peakWeek = data[0] || { label: '—', en: 0, es: 0, ru: 0 };
  data.forEach(d => {
    if ((d.en + d.es + d.ru) > (peakWeek.en + peakWeek.es + peakWeek.ru)) peakWeek = d;
  });

  // Idioma mas activo
  const langTotals = { en: 0, es: 0, ru: 0 };
  data.forEach(d => { langTotals.en += d.en; langTotals.es += d.es; langTotals.ru += d.ru; });
  const topLang = Object.entries(langTotals).sort((a, b) => b[1] - a[1])[0];
  const langNames = { en: 'English', es: 'Español', ru: 'Русский' };
  const langColors = { en: '#4f8ef7', es: '#f59e0b', ru: '#8b5cf6' };

  return (
    <>
      <div className="lt-card">
        <div className="lt-card-title">
          Динамика упоминаний по языкам
          <span className="lt-card-sub">по неделям</span>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 10 }} interval={0} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0b0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Area type="monotone" dataKey="en" stroke="#4f8ef7" fill="rgba(79,142,247,0.08)" name="English" strokeWidth={2} dot={{ r: 4, fill: '#4f8ef7' }} />
            <Area type="monotone" dataKey="es" stroke="#f59e0b" fill="rgba(245,158,11,0.08)" name="Español" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
            <Area type="monotone" dataKey="ru" stroke="#8b5cf6" fill="rgba(139,92,246,0.08)" name="Русский" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="stat-3">
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Пик активности</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0' }}>{peakWeek.label}</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{peakWeek.en + peakWeek.es + peakWeek.ru} упом.</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Самый активный язык</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: langColors[topLang[0]] }}>{langNames[topLang[0]]}</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{topLang[1]} упом. на пике</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Ср. активность / неделя</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0' }}>{avg}</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>комментариев всего</div>
        </div>
      </div>
    </>
  );
}

export default DynamicsChart;
