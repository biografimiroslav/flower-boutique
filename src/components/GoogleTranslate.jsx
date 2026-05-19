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
          pageLanguage: 'uk', 
          includedLanguages: 'en,uk,sk,hu',
        },
        'google_translate_element'
      );
    };

    // Динамічне додавання скрипта
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element"></div>;
}