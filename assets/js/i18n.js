let currentLanguage = es;

const LANGUAGES = {
    es,
    en
};

const setLanguage = language => {
    if (!LANGUAGES[language]) {
        throw new Error(`Idioma '${language}' no soportado.`);
    }
    
    currentLanguage = LANGUAGES[language];

    document.documentElement.lang = language;
};

const t = (key, params = {}) => {

    let text = key
        .split(".")
        .reduce((obj, part) => obj?.[part], currentLanguage);

    if (!text) {
        return key;
    }

    Object.entries(params).forEach(([param, value]) => {
        text = text.replaceAll(`{${param}}`, value);
    });

    return text;

};