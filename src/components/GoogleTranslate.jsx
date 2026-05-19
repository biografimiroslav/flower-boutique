import React, { useEffect } from 'react';

export default function GoogleTranslate() {
  useEffect(() => {
    // Захист від подвійного завантаження скрипта
    if (document.getElementById('google-translate-script')) {
      return;
    }

    // Ініціалізація віджета
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'uk', // Мова оригіналу
          includedLanguages: 'en,uk,sk,hu', // Які мови показувати в списку
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
    };

    // Динамічне додавання скрипта Google на сторінку
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element" className="translate-widget"></div>;
}