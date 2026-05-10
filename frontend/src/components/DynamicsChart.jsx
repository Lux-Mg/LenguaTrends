import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLang, getLangName } from '../i18n/LangContext';
import { getDynamics } from '../services/api';

const LANG_COLORS = { en: '#2ecc71', es: '#e67e22', ru: '#3498db' };

function DynamicsChart() {
  const { lang, t } = useLang();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState('month');
  const [yearFilter, setYearFilter] = useState('latest'); // 'latest' | 'all' | '2026' | '2025' | etc.

  useEffect(() => {
    setLoading(true);
    getDynamics({ granularity, period: 'all' })
      .then(res => setData(res.data?.data || []))
      .catch(err => { console.error(err); setData([]); })
      .finally(() => setLoading(false));
  }, [granularity]);

  // Años disponibles en el dataset (para granularidad mes)
  const availableYears = useMemo(() => {
    if (granularity !== 'month') return [];
    const years = new Set();
    data.forEach(d => {
      const y = d.key.split('-')[0];
      if (y) years.add(y);
    });
    return Array.from(years).sort();
  }, [data, granularity]);

  // Filtra los datos según filtro de año cuando granularidad = mes
  const chartData = useMemo(() => {
    if (granularity === 'year') {
      return data.map(d => ({ ...d, label: d.key }));
    }

    // granularidad mes
    let filtered = data;
    if (yearFilter !== 'all') {
      const targetYear = yearFilter === 'latest'
        ? (availableYears[availableYears.length - 1] || '')
        : yearFilter;
      filtered = data.filter(d => d.key.startsWith(targetYear + '-'));
    }
    return filtered.map(d => {
      const [y, m] = d.key.split('-');
      return { ...d, label: `${t.months[parseInt(m, 10) - 1]} ${y}` };
    });
  }, [data, granularity, yearFilter, availableYears, t.months]);

  const stats = useMemo(() => {
    const totals = { en: 0, es: 0, ru: 0 };
    chartData.forEach(d => { totals.en += d.en; totals.es += d.es; totals.ru += d.ru; });
    const total = totals.en + totals.es + totals.ru;
    const avg = chartData.length > 0 ? Math.round(total / chartData.length) : 0;
    const peak = chartData.reduce((p, d) => (d.en + d.es + d.ru) > (p.en + p.es + p.ru) ? d : p,
                                  { label: '—', en: 0, es: 0, ru: 0 });
    const topLang = Object.entries(totals).sort((a, b) => b[1] - a[1])[0] || ['en', 0];
    return { totals, avg, peak, topLang, total };
  }, [chartData]);

  const granLabel = granularity === 'month' ? t.granMonth.toLowerCase() : t.granYear.toLowerCase();

  const Btn = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className="pg-btn"
      style={active ? { background: '#2c3e50', color: '#fff', borderColor: '#2c3e50' } : null}
    >
      {children}
    </button>
  );

  const showDots = chartData.length <= 16;
  const selectStyle = {
    fontFamily: 'inherit',
    fontSize: 13,
    padding: '6px 28px 6px 12px',
    borderRadius: 8,
    border: '1px solid #dce1e6',
    background: '#fff',
    color: '#2c3e50',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%237f8c8d\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
  };

  return (
    <>
      <div className="lt-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: '#7f8c8d' }}>{t.granularity}</div>
        <Btn active={granularity === 'month'} onClick={() => setGranularity('month')}>{t.granMonth}</Btn>
        <Btn active={granularity === 'year'} onClick={() => setGranularity('year')}>{t.granYear}</Btn>

        {granularity === 'month' && availableYears.length > 0 && (
          <>
            <div style={{ width: 1, height: 22, background: '#dce1e6', margin: '0 4px' }} />
            <div style={{ fontSize: 13, color: '#7f8c8d' }}>{t.yearLabel}</div>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectStyle}>
              {availableYears.slice().reverse().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
              <option value="all">{t.allYears}</option>
            </select>
          </>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#95a5a6' }}>
          {chartData.length} {granLabel}
        </div>
      </div>

      <div className="lt-card">
        <div className="lt-card-title">
          {t.dynamicsTitle}
          <span className="lt-card-sub">{granLabel}</span>
        </div>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#95a5a6' }}>{t.loading}</div>
        ) : chartData.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#95a5a6' }}>—</div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#7f8c8d', fontSize: 11 }}
                interval="preserveStartEnd"
                angle={chartData.length > 12 ? -25 : 0}
                textAnchor={chartData.length > 12 ? 'end' : 'middle'}
                height={chartData.length > 12 ? 60 : 40}
              />
              <YAxis tick={{ fill: '#95a5a6', fontSize: 11 }} />
              <Tooltip
                animationDuration={0}
                contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, color: '#2c3e50', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                cursor={{ stroke: '#bdc3c7', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Area type="monotone" dataKey="en" stroke={LANG_COLORS.en} fill="rgba(46,204,113,0.1)" name={getLangName('en', lang)} strokeWidth={2} dot={showDots ? { r: 3, fill: LANG_COLORS.en } : false} activeDot={{ r: 4 }} isAnimationActive={false} />
              <Area type="monotone" dataKey="es" stroke={LANG_COLORS.es} fill="rgba(230,126,34,0.1)" name={getLangName('es', lang)} strokeWidth={2} dot={showDots ? { r: 3, fill: LANG_COLORS.es } : false} activeDot={{ r: 4 }} isAnimationActive={false} />
              <Area type="monotone" dataKey="ru" stroke={LANG_COLORS.ru} fill="rgba(52,152,219,0.1)" name={getLangName('ru', lang)} strokeWidth={2} dot={showDots ? { r: 3, fill: LANG_COLORS.ru } : false} activeDot={{ r: 4 }} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="stat-3">
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 6 }}>{t.peakActivity}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50' }}>{stats.peak.label}</div>
          <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>{stats.peak.en + stats.peak.es + stats.peak.ru} {t.mentionsCount}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 6 }}>{t.mostActiveLang}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: LANG_COLORS[stats.topLang[0]] }}>{getLangName(stats.topLang[0], lang)}</div>
          <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>{stats.topLang[1]} {t.mentionsPeak}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 6 }}>{t.avgWeekly}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50' }}>{stats.avg}</div>
          <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>{t.totalComments}</div>
        </div>
      </div>
    </>
  );
}

export default DynamicsChart;
