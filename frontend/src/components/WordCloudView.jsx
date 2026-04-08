import React, { useState, useEffect, useRef } from 'react';
import { useLang, getLangName } from '../i18n/LangContext';
import { getWordCloud } from '../services/api';

const sentColors = { positive: '#66BB6A', negative: '#E57373', neutral: '#90A4AE' };

function WordCloudView() {
  const { lang, t } = useLang();
  const [wcLang, setWcLang] = useState('en');
  const [words, setWords] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    getWordCloud({ lang: wcLang, limit: 40 }).then(res => setWords(res.data)).catch(console.error);
  }, [wcLang]);

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
      ctx.font = `${ratio > 0.4 ? 'bold' : 'normal'} ${size}px "DM Sans", system-ui, sans-serif`;
      const color = sentColors[word.sentiment] || '#90A4AE';
      const metrics = ctx.measureText(word.word);
      const tw = metrics.width;
      const th = size * 1.2;

      let x, y, attempts = 0;
      const cx = W / 2, cy = H / 2;

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
          <span className="lt-filter-label">{t.filterLang}</span>
          {['en', 'es', 'ru'].map(l => (
            <button key={l} onClick={() => setWcLang(l)}
              className={`lt-pill ${wcLang === l ? 'on' : ''}`}>{getLangName(l, lang)}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          {[[t.positive, '#66BB6A'], [t.negative, '#E57373'], [t.neutral, '#90A4AE']].map(([l, c]) => (
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
          <div style={{ textAlign: 'center', fontSize: 12, color: '#95a5a6', marginTop: 6 }}>
            {t.wordcloudSub}
          </div>
        </div>
        <div className="lt-card">
          <div className="lt-card-title" style={{ fontSize: 13 }}>{t.topWords}</div>
          {words.slice(0, 15).map((w, i) => (
            <div key={w.word} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '5px 0', borderBottom: '1px solid #eef0f2', fontSize: 13,
            }}>
              <span style={{ color: sentColors[w.sentiment] || '#90A4AE' }}>
                <span style={{ color: '#95a5a6', marginRight: 6, fontSize: 11 }}>{i + 1}</span>
                {w.word}
              </span>
              <span style={{ color: '#7f8c8d', fontWeight: 500 }}>{w.count}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default WordCloudView;
