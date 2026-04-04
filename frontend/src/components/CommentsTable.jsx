import React, { useState, useEffect } from 'react';
import { getComments } from '../services/api';

const sentLabel = { positive: 'Позитив', negative: 'Негатив', neutral: 'Нейтрал' };
const sentCls = { positive: 'b-pos', negative: 'b-neg', neutral: 'b-neu' };

function CommentsTable({ filters }) {
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

  return (
    <div className="lt-card">
      <div className="lt-card-title">
        Комментарии <span style={{ fontSize: 12, fontWeight: 400, color: '#334155' }}>({data.total.toLocaleString()})</span>
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
            <th>Тональность</th>
            <th>Язык</th>
            <th>Комментарий</th>
            <th>Фильм</th>
            <th style={{ textAlign: 'right' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {data.comments.map((c, i) => (
            <tr key={i}>
              <td>
                {c.sentiment ? (
                  <span className={`bdg ${sentCls[c.sentiment.label] || 'b-und'}`}>
                    {sentLabel[c.sentiment.label] || 'Не определён'}
                  </span>
                ) : <span className="bdg b-und">Не определён</span>}
              </td>
              <td style={{ color: '#64748b' }}>
                {c.language === 'unsupported' ? '—' : c.language?.toUpperCase()}
              </td>
              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }}>
                {c.text}
              </td>
              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569', fontSize: 11 }}>
                {c.movie || '—'}
              </td>
              <td style={{ textAlign: 'right' }}>
                {c.sentiment?.score != null ? (
                  <span style={{ fontSize: 11, color: '#475569' }}>{c.sentiment.score.toFixed(2)}</span>
                ) : <span style={{ color: '#334155' }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="lt-pager">
        <button className="pg-btn" onClick={() => go(Math.max(0, page - 1))} disabled={page === 0}>←</button>
        <span style={{ fontSize: 12, color: '#475569' }}>{page + 1} / {totalPages}</span>
        <button className="pg-btn" onClick={() => go(page + 1)} disabled={(page + 1) * limit >= data.total}>→</button>
      </div>
    </div>
  );
}

export default CommentsTable;
