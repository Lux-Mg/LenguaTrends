import React, { useState, useEffect, useRef } from 'react';
import { getWordCloud } from '../services/api';

const sentColors = { positive: '#22c55e', negative: '#ef4444', neutral: '#64748b' };

function WordCloudView() {
  const [lang, setLang] = useState('en');
  const [words, setWords] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    getWordCloud({ lang, limit: 40 }).then(res => setWords(res.data)).catch(console.error);
  }, [lang]);

  useEffect(() => {
    if (words.length > 0 && canvasRef.current) drawCloud();
  }, [words]);

  const drawCloud = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.parentElement.clientWidth || 700;
    const H = 380;
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const maxF = words[0].count;
    const placed = [];

    const overlap = (x, y, w, h) => {
      for (const p of placed) {
        if (x < p.x + p.w + 4 && x + w + 4 > p.x && y < p.y + p.h + 2 && y + h + 2 > p.y) return true;
      }
      return false;
    };

    ctx.textBaseline = 'top';

    for (const word of words) {
      const ratio = word.count / maxF;
      const size = Math.max(11, Math.round(ratio * 48));
      ctx.font = `${ratio > 0.4 ? 'bold' : 'normal'} ${size}px system-ui, sans-serif`;
      const color = sentColors[word.sentiment] || '#64748b';
      const metrics = ctx.measureText(word.word);
      const tw = metrics.width;
      const th = size * 1.2;

      let x, y, attempts = 0;
      const cx = W / 2, cy = H / 2;

      // Espiral desde el centro
      do {
        const angle = attempts * 0.5;
        const radius = attempts * 2.5;
        x = cx + Math.cos(angle) * radius - tw / 2;
        y = cy + Math.sin(angle) * radius - th / 2;
        attempts++;
      } while (overlap(x, y, tw, th) && attempts < 500);

      if (attempts < 500 && x > 0 && x + tw < W && y > 0 && y + th < H) {
        ctx.fillStyle = color;
        ctx.fillText(word.word, x, y);
        placed.push({ x, y, w: tw, h: th });
      }
    }
  };

  return (
    <>
      <div className="lt-filter">
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="lt-filter-label">Язык:</span>
          {[{ c: 'en', l: 'English' }, { c: 'es', l: 'Español' }, { c: 'ru', l: 'Русский' }].map(o => (
            <button key={o.c} onClick={() => setLang(o.c)}
              className={`lt-pill ${lang === o.c ? 'on' : ''}`}>{o.l}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          {[['Позитив', '#22c55e'], ['Негатив', '#ef4444'], ['Нейтрал', '#64748b']].map(([l, c]) => (
            <span key={l} style={{ fontSize: 12, color: c, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, background: c, borderRadius: '50%', display: 'inline-block' }} />{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 14 }}>
        <div className="lt-card">
          <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 6 }}>
            Размер слова пропорционален частоте · Цвет = тональность
          </div>
        </div>
        <div className="lt-card">
          <div className="lt-card-title" style={{ fontSize: 13 }}>Топ слов</div>
          {words.slice(0, 15).map((w, i) => (
            <div key={w.word} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13,
            }}>
              <span style={{ color: sentColors[w.sentiment] || '#94a3b8' }}>
                <span style={{ color: '#334155', marginRight: 6, fontSize: 11 }}>{i + 1}</span>
                {w.word}
              </span>
              <span style={{ color: '#475569', fontWeight: 500 }}>{w.count}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default WordCloudView;
