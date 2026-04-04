import React, { useState, useEffect } from 'react';
import StatsCards from './components/StatsCards';
import TopTrends from './components/TopTrends';
import SentimentChart from './components/SentimentChart';
import SentimentByMovie from './components/SentimentByMovie';
import LanguageBar from './components/LanguageBar';
import RecentComments from './components/RecentComments';
import WordCloudView from './components/WordCloudView';
import DynamicsChart from './components/DynamicsChart';
import FilterPanel from './components/FilterPanel';
import CommentsTable from './components/CommentsTable';
import { getStats, getTrends, getSentimentByLanguage, getSentimentByMovie } from './services/api';
import './App.css';

const tabs = [
  { id: 'dashboard', label: 'Главная' },
  { id: 'trends', label: 'Тренды' },
  { id: 'sentiment', label: 'Тональность' },
  { id: 'wordcloud', label: 'Облако слов' },
  { id: 'dynamics', label: 'Динамика' },
  { id: 'comments', label: 'Комментарии' },
];

function App() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [sentimentByLang, setSentimentByLang] = useState(null);
  const [movieSentiment, setMovieSentiment] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ lang: null, period: null, movieId: null, sentiment: null });
  const [allTrends, setAllTrends] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, t, sl, sm] = await Promise.all([
        getStats(), getTrends({ limit: 10 }),
        getSentimentByLanguage(),
        getSentimentByMovie({ limit: 5 }),
      ]);
      setStats(s.data); setTrends(t.data); setAllTrends(t.data);
      setSentimentByLang(sl.data); setMovieSentiment(sm.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    if (!stats) return;
    const params = {};
    if (filters.lang) params.lang = filters.lang;
    if (filters.period) params.period = filters.period;
    getTrends({ limit: 10, ...params }).then(r => setTrends(r.data)).catch(console.error);
    getSentimentByLanguage(filters.movieId ? { movie_id: filters.movieId } : {}).then(r => setSentimentByLang(r.data)).catch(console.error);
    getSentimentByMovie({ limit: 5, ...params }).then(r => setMovieSentiment(r.data)).catch(console.error);
  }, [filters]);

  if (loading && !stats) {
    return (
      <div className="lt-loading">
        <img src="/logo.png" alt="LenguaTrends" className="lt-loading-logo" />
        <div className="lt-loading-text">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="lt">
      <nav className="lt-nav">
        <div className="lt-brand">
          <img src="/logo.png" alt="LT" className="lt-logo-img" />
          <div>
            <div className="lt-name">LenguaTrends</div>
            <div className="lt-sub">Анализ трендов комментариев</div>
          </div>
        </div>
        <div className="lt-tabs">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`lt-tab ${activeTab === tab.id ? 'on' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="lt-main">
        {activeTab === 'dashboard' && (
          <>
            <StatsCards stats={stats} trends={allTrends} />
            <TopTrends trends={allTrends.slice(0, 5)} />
            <div className="lt-grid-side">
              <LanguageBar stats={stats} />
              <RecentComments />
            </div>
          </>
        )}
        {activeTab === 'trends' && (
          <>
            <FilterPanel filters={filters} onFilterChange={setFilters} movies={trends} />
            <TopTrends trends={trends} showDynamic />
          </>
        )}
        {activeTab === 'sentiment' && (
          <>
            <FilterPanel filters={filters} onFilterChange={setFilters} movies={trends} />
            <div className="lt-grid-2" style={{ marginBottom: 14 }}>
              <SentimentChart sentimentData={sentimentByLang} />
              <SentimentByMovie movieSentiment={movieSentiment} chartOnly />
            </div>
            <SentimentByMovie movieSentiment={movieSentiment} statsOnly />
          </>
        )}
        {activeTab === 'wordcloud' && <WordCloudView />}
        {activeTab === 'dynamics' && <DynamicsChart />}
        {activeTab === 'comments' && (
          <>
            <FilterPanel filters={filters} onFilterChange={setFilters} movies={trends} showSentimentFilter />
            <CommentsTable filters={filters} />
          </>
        )}
      </main>

      <footer className="lt-footer">
        LenguaTrends © 2026 — Программная система анализа трендов комментариев на различных языках
      </footer>
    </div>
  );
}

export default App;
