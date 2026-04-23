from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from collections import Counter
import re
import unicodedata
from app.database import get_db
from app.models.comment import Comment

router = APIRouter(prefix="/api/wordcloud", tags=["wordcloud"])


def _strip_accents(s: str) -> str:
    # Para comparar stopwords sin importar tildes: "pelicula" == "película"
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")

STOP_WORDS = {
    "en": {
        "a", "an", "the", "this", "that", "these", "those",
        "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
        "you", "your", "yours", "yourself", "yourselves",
        "he", "him", "his", "himself", "she", "her", "hers", "herself",
        "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
        "in", "on", "at", "to", "for", "of", "with", "by", "from", "up", "about",
        "into", "through", "during", "before", "after", "above", "below", "between",
        "out", "off", "over", "under", "again", "further", "against", "along",
        "around", "among", "without", "within", "upon", "across", "toward", "towards",
        "and", "but", "or", "nor", "so", "yet", "both", "either", "neither",
        "is", "am", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "having", "do", "does", "did", "doing",
        "will", "would", "shall", "should", "may", "might", "must", "can", "could",
        "get", "got", "getting", "let", "make", "made", "go", "going", "gone",
        "come", "came", "take", "took", "taken", "give", "gave", "say", "said",
        "know", "knew", "think", "thought", "see", "saw", "seen", "want", "look",
        "don", "doesn", "didn", "won", "wouldn", "shouldn", "couldn", "isn",
        "aren", "wasn", "weren", "hasn", "haven", "hadn", "ain",
        "dont", "doesnt", "didnt", "wont", "cant", "im", "ive", "ill",
        "youre", "youve", "youll", "hes", "shes", "thats", "whats", "theres",
        "theyre", "theyll", "weve", "heres",
        "not", "no", "very", "really", "just", "also", "too", "much", "more",
        "most", "only", "even", "still", "already", "always", "never", "ever",
        "now", "then", "here", "there", "where", "when", "how", "what", "which",
        "who", "whom", "whose", "why", "all", "each", "every", "any", "some",
        "such", "than", "other", "another", "same", "few", "many", "own",
        "well", "back", "way", "thing", "things", "like", "one", "two",
        "new", "first", "last", "long", "great", "little", "right", "big",
        "old", "good", "bad", "best", "worst", "sure", "real", "actually",
        "pretty", "quite", "enough", "lot", "something", "anything", "nothing",
        "everything", "someone", "anyone", "everyone", "nobody",
        "because", "since", "while", "although", "though", "however",
        "if", "else", "until", "unless", "whether",
        "movie", "movies", "film", "films", "people", "man", "part", "end",
        "yeah", "yes", "okay", "lol", "omg", "wow",
        "feel", "mark", "wait", "being",
        "seeing", "review", "reviews", "watched", "watching", "seen", "watch",
        "time", "gonna", "does", "lot", "put",
        # youtube / reseñas
        "cinema", "trailer", "trailers", "scene", "scenes", "character", "characters",
        "guys", "guy", "hey", "hi", "hello", "welcome", "thanks", "thank",
        "subscribe", "subscribed", "channel", "video", "videos",
        "please", "go", "today", "guess", "think", "thought",
    },
    "es": {
        "el", "la", "los", "las", "un", "una", "unos", "unas", "lo", "al", "del",
        "yo", "me", "mi", "mí", "tú", "te", "ti", "él", "ella", "le", "se", "sí",
        "nosotros", "nosotras", "nos", "ellos", "ellas", "les",
        "su", "sus", "mis", "tu", "tus", "nuestro", "nuestra", "nuestros", "nuestras",
        "mío", "mía", "tuyo", "tuya", "suyo", "suya",
        "de", "en", "a", "por", "para", "con", "sin", "sobre", "entre", "hasta",
        "desde", "hacia", "según", "durante", "contra", "tras", "ante", "bajo",
        "y", "e", "o", "u", "pero", "sino", "ni", "que", "porque", "aunque",
        "como", "cuando", "donde", "mientras", "pues", "ya",
        "es", "son", "soy", "eres", "somos", "fue", "era", "eran", "ser", "sido",
        "está", "están", "estar", "estoy", "estaba", "estuvo",
        "ha", "han", "has", "he", "haber", "hay", "había", "hubo",
        "tiene", "tienen", "tengo", "tener", "tenía",
        "puede", "pueden", "puedo", "poder", "podía",
        "hace", "hacer", "hizo", "hecho",
        "va", "van", "voy", "vas", "ir", "iba",
        "ver", "veo", "visto", "vi", "verla", "verlo",
        "dar", "dio", "doy", "saber", "sé", "sabe",
        "querer", "quiero", "quiere", "decir", "dice", "dijo",
        "no", "sí", "si", "más", "mas", "muy", "tan", "también", "tampoco",
        "ya", "aún", "aun", "bien", "mal", "solo", "sólo", "mucho", "poco",
        "todo", "toda", "todos", "todas", "otro", "otra", "otros", "otras",
        "este", "esta", "esto", "estos", "estas", "ese", "esa", "eso", "esos", "esas",
        "aquel", "aquella", "aquello",
        "aquí", "aqui", "ahí", "ahi", "allí", "alli",
        "ahora", "antes", "después", "luego", "siempre", "nunca", "jamás",
        "casi", "algo", "nada", "alguien", "nadie",
        "cada", "cual", "cuál", "uno", "dos", "tres", "vez", "veces", "día", "año",
        "así", "además", "menos", "mejor", "peor",
        "película", "pelicula", "peliculas", "películas", "peli", "pelis",
        "video", "videos", "parte", "tipo", "cosas", "cosa", "final", "gran",
        "creo", "parece", "manera", "forma", "bueno", "buena",
        "jaja", "jajaja", "jeje", "xd", "fin", "tengo", "primera", "verdad",
        "tiempo", "dan", "tal", "ser", "sido", "pues",
        # youtube / reseñas
        "cine", "trailer", "tráiler", "trailers", "tráilers", "escena", "escenas",
        "canal", "suscríbete", "suscribete", "suscriban", "suscribanse",
        "hola", "saludos", "gracias", "amigos", "amigo", "chicos", "gente",
        "bienvenidos", "bienvenido", "vídeo",
        "reseña", "resena", "reseñas", "resenas", "crítica", "critica", "análisis", "analisis",
        "voy", "creo", "digo", "dije", "aver", "haber",
        "comentario", "comentarios", "comenten", "comenta",
    },
    "ru": {
        "в", "на", "с", "по", "к", "из", "о", "за", "от", "до", "для", "при",
        "без", "через", "между", "под", "над", "перед", "около", "после",
        "про", "об", "ко", "во", "со",
        "и", "а", "но", "или", "да", "ни", "то", "что", "как", "чтобы",
        "если", "когда", "потому", "поэтому", "хотя", "пока", "либо",
        "я", "мне", "меня", "мной", "мы", "нам", "нас", "нами",
        "ты", "тебе", "тебя", "тобой", "вы", "вам", "вас", "вами",
        "он", "его", "ему", "им", "она", "её", "ей", "ею",
        "оно", "они", "их", "ним", "ними", "них",
        "себя", "себе", "собой",
        "мой", "моя", "моё", "мои", "твой", "твоя", "твоё", "твои",
        "свой", "своя", "своё", "свои", "своего", "своей", "своих",
        "наш", "наша", "наше", "наши", "ваш", "ваша", "ваше", "ваши",
        "этот", "эта", "это", "эти", "этого", "этой", "этих", "этом", "этому",
        "тот", "та", "те", "того", "той", "тех", "тому", "том",
        "какой", "какая", "какое", "какие", "какого",
        "такой", "такая", "такое", "такие", "такого",
        "который", "которая", "которое", "которые", "которого", "которой", "которых",
        "весь", "вся", "всё", "все", "всего", "всей", "всех", "всем",
        "сам", "сама", "само", "сами",
        "кто", "чего", "чему", "чем",
        "быть", "был", "была", "было", "были", "есть", "будет", "буду", "будут",
        "может", "могу", "можно", "мочь",
        "надо", "нужно", "нужен", "нужна",
        "стать", "стал", "стала",
        "хотеть", "хочу", "хочет",
        "знать", "знаю", "знает",
        "говорить", "говорит", "сказать", "сказал",
        "делать", "делает", "сделать",
        "не", "нет", "ну", "же", "бы", "ли", "вот",
        "так", "уже", "ещё", "еще", "тоже", "также",
        "очень", "более", "менее", "только", "просто", "даже",
        "почему", "потому", "именно", "будто", "тем", "прям", "лишь", "ведь",
        "конце", "начале", "середине", "конец",
        "тут", "там", "здесь", "где", "куда", "откуда",
        "сейчас", "теперь", "тогда", "потом", "сначала", "опять", "снова",
        "всегда", "никогда", "иногда",
        "конечно", "вообще", "вроде", "кстати", "ведь", "разве",
        "один", "одна", "одно", "одни", "два", "три", "раз",
        "лучше", "хуже", "больше", "меньше",
        "фильм", "фильма", "фильме", "фильмы", "фильмов", "фильмом",
        "люди", "человек", "часть", "части",
        "него", "неё", "ней",
        "смотреть", "смотрел", "смотрим", "посмотрел", "посмотреть", "обзор", "обзоры",
        "видео", "много", "хоть", "второй", "время", "спасибо",
        # youtube / reseñas
        "кино", "кинематограф", "кинотеатр",
        "привет", "здравствуйте", "друзья", "ребята", "люди",
        "канал", "подпишись", "подписывайтесь", "подпишитесь", "подписка",
        "трейлер", "трейлеры", "ролик", "ролики", "рецензия", "рецензии",
        "сцена", "сцены", "персонаж", "персонажи",
        "комментарий", "комментарии", "комментарии",
    },
}


@router.get("/")
def get_wordcloud(
    lang: str = Query("en"), movie_id: int = Query(None),
    limit: int = Query(100), db: Session = Depends(get_db),
):
    from app.models.comment import SentimentResult

    query = db.query(Comment.text, SentimentResult.label).join(
        SentimentResult, SentimentResult.comment_id == Comment.id
    ).filter(Comment.language == lang, Comment.processed.is_(True))

    if movie_id:
        query = query.filter(Comment.media_entity_id == movie_id)

    results = query.all()
    # set de stopwords normalizadas (sin tildes) para que "pelicula" matchee "película"
    stop_words_norm = {_strip_accents(w) for w in STOP_WORDS.get(lang, set())}
    word_counter = Counter()
    word_sentiment = {}

    for text, label in results:
        words = re.findall(r'[a-záéíóúñа-яёü]+', text.lower())
        for word in words:
            if len(word) <= 2:
                continue
            if _strip_accents(word) in stop_words_norm:
                continue
            word_counter[word] += 1
            if word not in word_sentiment:
                word_sentiment[word] = {"positive": 0, "negative": 0, "neutral": 0}
            if label in word_sentiment[word]:
                word_sentiment[word][label] += 1

    out = []
    for word, count in word_counter.most_common(limit):
        s = word_sentiment.get(word, {})
        dominant = max(s, key=s.get) if s else "neutral"
        out.append({"word": word, "count": count, "sentiment": dominant})
    return out
