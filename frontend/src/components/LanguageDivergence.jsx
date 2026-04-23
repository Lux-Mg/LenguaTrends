import React, { useState, useEffect } from 'react';
import { useLang, getLangName } from '../i18n/LangContext';
import { getLanguageDivergence } from '../services/api';

const LANG_COLORS = { ru: '#d62728', es: '#f39c12', en: '#2c3e50' };

function LanguageDivergence() {
  const { lang, t, getTitle } = useLang();
  const [data, setData] = useState([]);
  const [minCount, setMinCount] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLanguageDivergence({ min_count: minCount })
      .then(res => setData(res.data || []))
      .catch(err => { console.error(err); setData([]); })
      .finally(() => setLoading(false));
  }, [minCount]);

  const pctClass = (p) => p >= 60 ? 'pct-p' : p < 40 ? 'pct-n' : 'pct-m';

  // Busca la pelicula donde el idioma dado supera al maximo de los otros por mayor margen
  const favoriteOf = (code) => {
    let best = null, bestGap = -Infinity;
    for (const m of data) {
      const here = m.by_language?.[code];
      if (!here || !m.languages_included.includes(code)) continue;
      const othersPcts = m.languages_included.filter(l => l !== code).map(l => m.by_language[l].pct_positive);
      if (othersPcts.length === 0) continue;
      const gap = here.pct_positive - Math.max(...othersPcts);
      if (gap > bestGap) { bestGap = gap; best = { movie: m, gap, pct: here.pct_positive }; }
    }
    return best;
  };

  const mostDivisive = data[0];

  // Helper: promedio de %pos entre los 3 idiomas (solo funciona si tiene los 3)
  const avg3 = (m) => (m.by_language.es.pct_positive + m.by_language.en.pct_positive + m.by_language.ru.pct_positive) / 3;

  // Mayor acuerdo: 3 idiomas, menor spread (sin filtro de promedio)
  const mostAgreement = data
    .filter(m => m.languages_included.length === 3)
    .sort((a, b) => a.spread_pct - b.spread_pct)[0] || null;

  // Mas apreciada en promedio: 3 idiomas, spread <= 20pp (evita divisivas), mayor promedio
  const mostAppreciated = data
    .filter(m => m.languages_included.length === 3 && m.spread_pct <= 20)
    .sort((a, b) => avg3(b) - avg3(a))[0] || null;

  const favRu = favoriteOf('ru');
  const favEs = favoriteOf('es');
  const favEn = favoriteOf('en');

  return (
    <div>
      <div className="lt-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
        <div style={{ fontSize: 13, color: '#7f8c8d' }}>{t.divMinCount}</div>
        {[50, 75, 100, 150].map(n => (
          <button
            key={n}
            onClick={() => setMinCount(n)}
            className={`pg-btn ${minCount === n ? 'on' : ''}`}
            style={minCount === n ? { background: '#2c3e50', color: '#fff', borderColor: '#2c3e50' } : null}
          >
            ≥ {n}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#95a5a6' }}>
          {data.length} {t.divMoviesShown}
        </div>
      </div>

      <div className="stat-3" style={{ marginTop: 14, marginBottom: 14 }}>
        <FavCard
          label={t.divFavRu}
          sub={t.divFavRuSub}
          langCode="ru"
          fav={favRu}
          t={t}
          getTitle={getTitle}
        />
        <FavCard
          label={t.divFavEs}
          sub={t.divFavEsSub}
          langCode="es"
          fav={favEs}
          t={t}
          getTitle={getTitle}
        />
        <FavCard
          label={t.divFavEn}
          sub={t.divFavEnSub}
          langCode="en"
          fav={favEn}
          t={t}
          getTitle={getTitle}
        />
      </div>

      <div className="stat-3" style={{ marginBottom: 14 }}>
        <div className="stat-card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 2 }}>{t.divMostDivisive}</div>
          <div style={{ fontSize: 10.5, color: '#b0b8bf', marginBottom: 8, fontStyle: 'italic' }}>
            {getLangName('en', lang) + ' · ' + getLangName('es', lang) + ' · ' + getLangName('ru', lang)}
          </div>
          {mostDivisive ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#e74c3c' }}>{getTitle(mostDivisive)}</div>
              <div style={{ fontSize: 12, color: '#7f8c8d', marginTop: 4 }}>
                {t.divSpread}: <strong>{mostDivisive.spread_pct} pp</strong>
                {' · '}
                {mostDivisive.winner.toUpperCase()} {mostDivisive.by_language[mostDivisive.winner].pct_positive}%
                {' ↔ '}
                {mostDivisive.loser.toUpperCase()} {mostDivisive.by_language[mostDivisive.loser].pct_positive}%
              </div>
            </>
          ) : <div style={{ color: '#bdc3c7' }}>—</div>}
        </div>

        <div className="stat-card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 2 }}>{t.divMostAgreement}</div>
          <div style={{ fontSize: 10.5, color: '#b0b8bf', marginBottom: 8, fontStyle: 'italic' }}>{t.divMostAgreementSub}</div>
          {mostAgreement ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#2c3e50' }}>{getTitle(mostAgreement)}</div>
              <div style={{ fontSize: 12, color: '#7f8c8d', marginTop: 4 }}>
                {t.divSpread}: <strong>{mostAgreement.spread_pct} pp</strong>
                {' · '}
                ES {mostAgreement.by_language.es.pct_positive}%
                {' · '}
                EN {mostAgreement.by_language.en.pct_positive}%
                {' · '}
                RU {mostAgreement.by_language.ru.pct_positive}%
              </div>
            </>
          ) : <div style={{ color: '#bdc3c7', fontSize: 13 }}>{t.divNoConsensus}</div>}
        </div>

        <div className="stat-card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 2 }}>{t.divMostAppreciated}</div>
          <div style={{ fontSize: 10.5, color: '#b0b8bf', marginBottom: 8, fontStyle: 'italic' }}>{t.divMostAppreciatedSub}</div>
          {mostAppreciated ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#27ae60' }}>{getTitle(mostAppreciated)}</div>
              <div style={{ fontSize: 12, color: '#7f8c8d', marginTop: 4 }}>
                {t.divSpread}: <strong>{avg3(mostAppreciated).toFixed(1)}%</strong> avg
                {' · '}
                ES {mostAppreciated.by_language.es.pct_positive}%
                {' · '}
                EN {mostAppreciated.by_language.en.pct_positive}%
                {' · '}
                RU {mostAppreciated.by_language.ru.pct_positive}%
              </div>
            </>
          ) : <div style={{ color: '#bdc3c7', fontSize: 13 }}>{t.divNoConsensus}</div>}
        </div>
      </div>

      <div className="lt-card">
        <div className="lt-card-title">
          {t.divTableTitle}
          <span className="lt-card-sub">{t.divTableSub}</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#95a5a6' }}>{t.loading}</div>
        ) : data.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#95a5a6' }}>{t.divNoData}</div>
        ) : (
          <table className="lt-tbl">
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th>{t.thTitle}</th>
                <th style={{ textAlign: 'center', width: 100 }}>
                  <span style={{ color: LANG_COLORS.es }}>ES</span>
                </th>
                <th style={{ textAlign: 'center', width: 100 }}>
                  <span style={{ color: LANG_COLORS.en }}>EN</span>
                </th>
                <th style={{ textAlign: 'center', width: 100 }}>
                  <span style={{ color: LANG_COLORS.ru }}>RU</span>
                </th>
                <th style={{ textAlign: 'center', width: 80 }}>{t.divSpread}</th>
                <th style={{ textAlign: 'center', width: 90 }}>{t.divWinner}</th>
                <th style={{ textAlign: 'center', width: 90 }}>{t.divLoser}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m, i) => (
                <tr key={m.id} className={i < 3 ? 'top3' : ''}>
                  <td>
                    <span style={{ fontWeight: 700, color: i === 0 ? '#e67e22' : i === 1 ? '#95a5a6' : i === 2 ? '#cd7f32' : '#bdc3c7' }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {getTitle(m)}
                  </td>
                  <LangCell data={m.by_language.es} pctClass={pctClass} />
                  <LangCell data={m.by_language.en} pctClass={pctClass} />
                  <LangCell data={m.by_language.ru} pctClass={pctClass} />
                  <td style={{ textAlign: 'center', fontWeight: 600, color: m.spread_pct >= 20 ? '#e74c3c' : m.spread_pct >= 10 ? '#f39c12' : '#7f8c8d' }}>
                    {m.spread_pct} pp
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: LANG_COLORS[m.winner], fontWeight: 600, fontSize: 12 }}>
                      {m.winner.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: LANG_COLORS[m.loser], fontWeight: 600, fontSize: 12, opacity: 0.55 }}>
                      {m.loser.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ fontSize: 11, color: '#95a5a6', padding: '8px 4px 0', lineHeight: 1.5 }}>
        {t.divMethodology}
      </div>
    </div>
  );
}

function LangCell({ data, pctClass }) {
  if (!data || !data.total) {
    return <td style={{ textAlign: 'center', color: '#d0d4d8' }}>—</td>;
  }
  return (
    <td style={{ textAlign: 'center' }}>
      <span className={pctClass(data.pct_positive)} style={{ fontWeight: 600 }}>
        {data.pct_positive}%
      </span>
      <div style={{ fontSize: 10, color: '#95a5a6', marginTop: 2 }}>N={data.total}</div>
    </td>
  );
}

function FavCard({ label, sub, langCode, fav, t, getTitle }) {
  return (
    <div className="stat-card" style={{ textAlign: 'left', borderLeft: `3px solid ${LANG_COLORS[langCode]}` }}>
      <div style={{ fontSize: 13, color: '#95a5a6', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10.5, color: '#b0b8bf', marginBottom: 8, fontStyle: 'italic' }}>{sub}</div>}
      {fav ? (
        <>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#2c3e50' }}>{getTitle(fav.movie)}</div>
          <div style={{ fontSize: 12, color: '#7f8c8d', marginTop: 4 }}>
            {fav.pct}% {t.positiveComments}
            {fav.gap > 0 && (
              <span style={{ color: '#27ae60', marginLeft: 6, fontWeight: 600 }}>
                +{fav.gap.toFixed(1)}pp
              </span>
            )}
          </div>
        </>
      ) : <div style={{ color: '#bdc3c7', fontSize: 14 }}>{t.divNoData}</div>}
    </div>
  );
}

export default LanguageDivergence;
