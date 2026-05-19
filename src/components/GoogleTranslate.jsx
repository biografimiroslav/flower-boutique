import React, { useEffect } from 'react';

export default function GoogleTranslate() {
  useEffect(() => {
    if (document.getElementById('google-translate-script')) {
      return;
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'uk', 
          includedLanguages: 'en,uk,sk,hu',
          // Прибрали layout, щоб завжди генерувався стандартний <select>
        },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element"></div>;
}