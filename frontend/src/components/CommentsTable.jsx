import React, { useState, useEffect } from 'react';
import { useLang } from '../i18n/LangContext';
import { getComments } from '../services/api';

function CommentsTable({ filters }) {
  const { lang, t } = useLang();
  const sentLabel = { positive: t.positive, negative: t.negative, neutral: t.neutral };
  const sentCls = { positive: 'b-pos', negative: 'b-neg', neutral: 'b-neu' };

  const [data, setData] = useState({ comments: [], total: 0 });
  const [page, setPage] = useState(0);
  const limit = 12;

  useEffect(() => { setPage(0); load(0); }, [filters]);

  const load = async (offset) => {
    try {
      const params = { limit, offset };
      if (filters?.lang) params.lang = filters.lang;
      if (filters?.movieId) params.movie_id = filters.movieId;
      if (filters?.sentiment) params.sentiment = filters.sentiment;
      const res = await getComments(params);
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const go = (p) => { setPage(p); load(p * limit); };
  const totalPages = Math.ceil(data.total / limit) || 1;

  const movieTitle = (c) => {
    if (lang === 'es') return c.movie_es || c.movie || '—';
    if (lang === 'ru') return c.movie_ru || c.movie || '—';
    return c.movie || '—';
  };

  return (
    <div className="lt-card">
      <div className="lt-card-title">
        {t.commentsTitle} <span style={{ fontSize: 12, fontWeight: 400, color: '#95a5a6' }}>({data.total.toLocaleString()})</span>
      </div>
      <table className="lt-tbl" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 100 }} />
          <col style={{ width: 50 }} />
          <col />
          <col style={{ width: 170 }} />
          <col style={{ width: 60 }} />
        </colgroup>
        <thead>
          <tr>
            <th>{t.thSentimentCol}</th>
            <th>{t.thLang}</th>
            <th>{t.thComment}</th>
            <th>{t.thMovie}</th>
            <th style={{ textAlign: 'right' }}>{t.thScore}</th>
          </tr>
        </thead>
        <tbody>
          {data.comments.map((c, i) => (
            <tr key={i}>
              <td>
                {c.sentiment ? (
                  <span className={`bdg ${sentCls[c.sentiment.label] || 'b-und'}`}>
                    {sentLabel[c.sentiment.label] || t.undefined}
                  </span>
                ) : <span className="bdg b-und">{t.undefined}</span>}
              </td>
              <td style={{ color: '#7f8c8d' }}>
                {c.language === 'unsupported' ? '—' : c.language?.toUpperCase()}
              </td>
              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#4a5568' }}>
                {c.text}
              </td>
              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#95a5a6', fontSize: 11 }}>
                {movieTitle(c)}
              </td>
              <td style={{ textAlign: 'right' }}>
                {c.sentiment?.score != null ? (
                  <span style={{ fontSize: 11, color: '#95a5a6' }}>{c.sentiment.score.toFixed(2)}</span>
                ) : <span style={{ color: '#bdc3c7' }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="lt-pager">
        <button className="pg-btn" onClick={() => go(Math.max(0, page - 1))} disabled={page === 0}>←</button>
        <span style={{ fontSize: 12, color: '#95a5a6' }}>{page + 1} / {totalPages}</span>
        <button className="pg-btn" onClick={() => go(page + 1)} disabled={(page + 1) * limit >= data.total}>→</button>
      </div>
    </div>
  );
}

export default CommentsTable;
