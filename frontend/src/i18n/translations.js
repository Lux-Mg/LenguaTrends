const translations = {
  ru: {
    // Nav
    appName: 'LenguaTrends',
    appSub: 'Анализ трендов комментариев',

    // Tabs
    tabDashboard: 'Главная',
    tabTrends: 'Тренды',
    tabSentiment: 'Тональность',
    tabWordcloud: 'Облако слов',
    tabDynamics: 'Динамика',
    tabDivergence: 'Межъязыковые различия',
    tabComments: 'Комментарии',

    // Divergence view
    divMinCount: 'Минимум комментариев на язык:',
    divMoviesShown: 'фильмов в таблице',
    divFavRu: 'Относительный фаворит русских',
    divFavEs: 'Относительный фаворит испанцев',
    divFavEn: 'Относительный фаворит англичан',
    divFavRuSub: 'Русские оценили выше, чем другие языки',
    divFavEsSub: 'Испанцы оценили выше, чем другие языки',
    divFavEnSub: 'Англичане оценили выше, чем другие языки',
    divMostDivisive: 'Самый спорный фильм',
    divMostAgreement: 'Наибольшее согласие между языками',
    divMostAgreementSub: 'все три языка оценили почти одинаково',
    divMostAppreciated: 'Самый ценимый в среднем',
    divMostAppreciatedSub: 'самая высокая средняя доля позитива',
    divNoConsensus: 'Недостаточно данных',
    divSpread: 'Разброс',
    divWinner: 'Больше понравился',
    divLoser: 'Меньше понравился',
    divTableTitle: 'Различия в оценках по языкам',
    divTableSub: 'отсортировано по максимальному разбросу',
    divNoData: 'Нет данных с таким минимумом',
    divMethodology: 'Метрика: доля позитивных комментариев (%) на язык на фильм. Разброс = макс. − мин. среди языков с достаточной выборкой. Фильм попадает в таблицу, если минимум два языка имеют не меньше указанного числа комментариев.',

    // KPI
    kpiComments: 'Комментариев',
    kpiMovies: 'Фильмов',
    kpiProcessed: 'Обработано',
    kpiTopMovie: 'Самый обсуждаемый фильм',
    kpiMentions: 'упом.',

    // Trends
    trendsTitle: 'трендов',
    trendsTop: 'Топ',
    trendsSub: 'по числу упоминаний',
    thRank: '#',
    thTitle: 'Название',
    thMentions: 'Упоминаний',
    thCount: 'Кол.',
    thPositive: 'Поз.%',
    thDynamic: 'Динам.',
    thSentiment: 'Тональность',

    // Sentiment
    positive: 'Позитив',
    negative: 'Негатив',
    neutral: 'Нейтрал',
    undefined: 'Не определён',
    sentByLang: 'Тональность по языкам',
    sentByMovie: 'Тональность по фильмам',
    sentCount: 'кол. комментариев',
    comments: 'комм.',
    mostPositiveLang: 'Самый позитивный язык',
    mostPositiveMovie: 'Самый позитивный фильм',
    mostCriticized: 'Наиболее критикуемый',
    positiveComments: 'позитивных комм.',

    // Languages
    langRu: 'Русский',
    langEn: 'Английский',
    langEs: 'Испанский',

    // Word cloud
    wordcloudTitle: 'Облако слов',
    wordcloudSub: 'Размер слова пропорционален частоте · Цвет = тональность',
    topWords: 'Топ слов',

    // Dynamics
    dynamicsTitle: 'Динамика упоминаний по языкам',
    dynamicsSub: 'по неделям',
    peakActivity: 'Пик активности',
    mostActiveLang: 'Самый активный язык',
    avgWeekly: 'Ср. активность / неделя',
    totalComments: 'комментариев всего',
    mentionsCount: 'упом.',
    mentionsPeak: 'упом. на пике',

    // Filters
    filterLang: 'Язык:',
    filterPeriod: 'Период:',
    filterSentiment: 'Тональность:',
    filterMovie: 'Фильм:',
    filterAll: 'Все',
    days7: '7д',
    days30: '30д',
    days90: '90д',

    // Comments table
    commentsTitle: 'Комментарии',
    thSentimentCol: 'Тональность',
    thLang: 'Язык',
    thComment: 'Комментарий',
    thMovie: 'Фильм',
    thScore: 'Оценка',

    // Language distribution
    langDistribution: 'Распределение по языкам',
    totalAnalyzed: 'Всего проанализировано',

    // Recent comments
    recentComments: 'Последние комментарии',

    // Footer
    footer: 'LenguaTrends © 2026 — Программная система анализа трендов комментариев на различных языках',

    // Months
    months: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],

    // Loading
    loading: 'Загрузка...',
  },

  es: {
    appName: 'LenguaTrends',
    appSub: 'Análisis de tendencias de comentarios',

    tabDashboard: 'Inicio',
    tabTrends: 'Tendencias',
    tabSentiment: 'Sentimiento',
    tabWordcloud: 'Nube de palabras',
    tabDynamics: 'Dinámica',
    tabDivergence: 'Diferencias por idioma',
    tabComments: 'Comentarios',

    divMinCount: 'Mínimo de comentarios por idioma:',
    divMoviesShown: 'películas en la tabla',
    divFavRu: 'Favorita relativa de rusohablantes',
    divFavEs: 'Favorita relativa de hispanohablantes',
    divFavEn: 'Favorita relativa de anglohablantes',
    divFavRuSub: 'Los rusos la valoraron mejor que el resto',
    divFavEsSub: 'Los hispanos la valoraron mejor que el resto',
    divFavEnSub: 'Los anglos la valoraron mejor que el resto',
    divMostDivisive: 'Película más divisiva',
    divMostAgreement: 'Mayor acuerdo entre idiomas',
    divMostAgreementSub: 'los 3 idiomas la valoraron casi igual',
    divMostAppreciated: 'Más apreciada en promedio',
    divMostAppreciatedSub: 'mayor % positivo promedio entre idiomas',
    divNoConsensus: 'Datos insuficientes',
    divSpread: 'Brecha',
    divWinner: 'Gustó más',
    divLoser: 'Gustó menos',
    divTableTitle: 'Diferencias de opinión por idioma',
    divTableSub: 'ordenado por mayor brecha',
    divNoData: 'Sin datos con ese mínimo',
    divMethodology: 'Métrica: porcentaje de comentarios positivos (%) por idioma por película. Brecha = máx. − mín. entre los idiomas con muestra suficiente. Una película aparece si al menos dos idiomas tienen comentarios ≥ al mínimo indicado.',

    kpiComments: 'Comentarios',
    kpiMovies: 'Películas',
    kpiProcessed: 'Procesados',
    kpiTopMovie: 'Película más comentada',
    kpiMentions: 'menc.',

    trendsTitle: 'tendencias',
    trendsTop: 'Top',
    trendsSub: 'por número de menciones',
    thRank: '#',
    thTitle: 'Título',
    thMentions: 'Menciones',
    thCount: 'Cant.',
    thPositive: 'Pos.%',
    thDynamic: 'Dinam.',
    thSentiment: 'Sentimiento',

    positive: 'Positivo',
    negative: 'Negativo',
    neutral: 'Neutro',
    undefined: 'Sin definir',
    sentByLang: 'Sentimiento por idiomas',
    sentByMovie: 'Sentimiento por películas',
    sentCount: 'cant. de comentarios',
    comments: 'com.',
    mostPositiveLang: 'Idioma más positivo',
    mostPositiveMovie: 'Película más positiva',
    mostCriticized: 'Más criticada',
    positiveComments: 'comentarios positivos',

    langRu: 'Ruso',
    langEn: 'Inglés',
    langEs: 'Español',

    wordcloudTitle: 'Nube de palabras',
    wordcloudSub: 'El tamaño es proporcional a la frecuencia · Color = sentimiento',
    topWords: 'Top palabras',

    dynamicsTitle: 'Dinámica de menciones por idiomas',
    dynamicsSub: 'por semanas',
    peakActivity: 'Pico de actividad',
    mostActiveLang: 'Idioma más activo',
    avgWeekly: 'Prom. actividad / semana',
    totalComments: 'comentarios en total',
    mentionsCount: 'menc.',
    mentionsPeak: 'menc. en pico',

    filterLang: 'Idioma:',
    filterPeriod: 'Período:',
    filterSentiment: 'Sentimiento:',
    filterMovie: 'Película:',
    filterAll: 'Todos',
    days7: '7d',
    days30: '30d',
    days90: '90d',

    commentsTitle: 'Comentarios',
    thSentimentCol: 'Sentimiento',
    thLang: 'Idioma',
    thComment: 'Comentario',
    thMovie: 'Película',
    thScore: 'Punt.',

    langDistribution: 'Distribución por idiomas',
    totalAnalyzed: 'Total analizado',

    recentComments: 'Comentarios recientes',

    footer: 'LenguaTrends © 2026 — Sistema de análisis de tendencias de comentarios en múltiples idiomas',

    months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],

    loading: 'Cargando...',
  },

  en: {
    appName: 'LenguaTrends',
    appSub: 'Comment trend analysis',

    tabDashboard: 'Dashboard',
    tabTrends: 'Trends',
    tabSentiment: 'Sentiment',
    tabWordcloud: 'Word Cloud',
    tabDynamics: 'Dynamics',
    tabDivergence: 'Cross-language differences',
    tabComments: 'Comments',

    divMinCount: 'Minimum comments per language:',
    divMoviesShown: 'movies shown',
    divFavRu: 'Relative favorite of Russian speakers',
    divFavEs: 'Relative favorite of Spanish speakers',
    divFavEn: 'Relative favorite of English speakers',
    divFavRuSub: 'Russians rated it higher than other languages',
    divFavEsSub: 'Spanish speakers rated it higher than other languages',
    divFavEnSub: 'English speakers rated it higher than other languages',
    divMostDivisive: 'Most divisive movie',
    divMostAgreement: 'Most cross-language agreement',
    divMostAgreementSub: 'all three languages rated it nearly equally',
    divMostAppreciated: 'Most appreciated on average',
    divMostAppreciatedSub: 'highest average positive % across languages',
    divNoConsensus: 'Not enough data',
    divSpread: 'Spread',
    divWinner: 'Liked most',
    divLoser: 'Liked least',
    divTableTitle: 'Sentiment differences by language',
    divTableSub: 'sorted by largest spread',
    divNoData: 'No data at this threshold',
    divMethodology: 'Metric: percentage of positive comments (%) per language per movie. Spread = max − min among languages with sufficient sample. A movie is included if at least two languages have comments ≥ the selected minimum.',

    kpiComments: 'Comments',
    kpiMovies: 'Movies',
    kpiProcessed: 'Processed',
    kpiTopMovie: 'Most discussed movie',
    kpiMentions: 'ment.',

    trendsTitle: 'trends',
    trendsTop: 'Top',
    trendsSub: 'by number of mentions',
    thRank: '#',
    thTitle: 'Title',
    thMentions: 'Mentions',
    thCount: 'Count',
    thPositive: 'Pos.%',
    thDynamic: 'Dynam.',
    thSentiment: 'Sentiment',

    positive: 'Positive',
    negative: 'Negative',
    neutral: 'Neutral',
    undefined: 'Undefined',
    sentByLang: 'Sentiment by language',
    sentByMovie: 'Sentiment by movie',
    sentCount: 'comment count',
    comments: 'comm.',
    mostPositiveLang: 'Most positive language',
    mostPositiveMovie: 'Most positive movie',
    mostCriticized: 'Most criticized',
    positiveComments: 'positive comments',

    langRu: 'Russian',
    langEn: 'English',
    langEs: 'Spanish',

    wordcloudTitle: 'Word Cloud',
    wordcloudSub: 'Word size is proportional to frequency · Color = sentiment',
    topWords: 'Top words',

    dynamicsTitle: 'Mention dynamics by language',
    dynamicsSub: 'weekly',
    peakActivity: 'Peak activity',
    mostActiveLang: 'Most active language',
    avgWeekly: 'Avg. activity / week',
    totalComments: 'total comments',
    mentionsCount: 'ment.',
    mentionsPeak: 'ment. at peak',

    filterLang: 'Language:',
    filterPeriod: 'Period:',
    filterSentiment: 'Sentiment:',
    filterMovie: 'Movie:',
    filterAll: 'All',
    days7: '7d',
    days30: '30d',
    days90: '90d',

    commentsTitle: 'Comments',
    thSentimentCol: 'Sentiment',
    thLang: 'Lang.',
    thComment: 'Comment',
    thMovie: 'Movie',
    thScore: 'Score',

    langDistribution: 'Language distribution',
    totalAnalyzed: 'Total analyzed',

    recentComments: 'Recent comments',

    footer: 'LenguaTrends © 2026 — Multilingual comment trend analysis system',

    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    loading: 'Loading...',
  },
};

export default translations;
