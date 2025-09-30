import { Language } from '../types';

const getLanguageName = (code: Language): string => {
  switch (code) {
    case 'en-US':
      return 'Inglês';
    case 'pt-BR':
      return 'Português';
  }
};

// Client-side: call a backend endpoint that holds the API key and performs the request.
// This avoids bundling the server SDK and exposing the key in the browser.
export const translateText = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string> => {
  if (!text.trim()) return '';

  const body = {
    text,
    sourceLang,
    targetLang,
  };

  try {
    // If a backend base URL is configured at build time, use it (for production with a server).
    // If not configured (static hosting like GitHub Pages), prefer client-side fallbacks so
    // we don't trigger the dev server proxy which may be unreachable and cause connection errors.
    const apiBaseEnv = (import.meta as any).env?.VITE_API_BASE;
    if (apiBaseEnv) {
      const apiBase = apiBaseEnv;
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Translation endpoint error: ${errText}`);
      }

      const data = await res.json();
      if (!data || typeof data.translation !== 'string') {
        throw new Error('Resposta do servidor em formato inesperado.');
      }

      return data.translation;
    }
  } catch (err) {
  console.warn('Server translation failed, attempting client-side fallback (LibreTranslate):', err);

    // Fallback strategy for static hosts:
    // 1) Try MyMemory public API (no key required, moderate quality)
    // 2) Then try LibreTranslate if available
    try {
      const short = (code: string) => (code && code.startsWith('pt') ? 'pt' : 'en');
      const source = short(sourceLang as unknown as string) || 'auto';
      const target = short(targetLang as unknown as string) || 'en';

      // 1) MyMemory GET
      const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
      const mmRes = await fetch(mmUrl);
      const mmData = await mmRes.json().catch(() => null);
      if (mmRes.ok && mmData && mmData.responseData && typeof mmData.responseData.translatedText === 'string') {
        try { (window as any).__translationFallback = true; } catch (e) {}
        return mmData.responseData.translatedText;
      }

      // 2) LibreTranslate POST (fallback)
      try {
        const libUrl = 'https://libretranslate.com/translate';
        const libPayload = {
          q: text,
          source: 'auto',
          target: target,
          format: 'text',
        };

        const libRes = await fetch(libUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(libPayload),
        });

        const libData = await libRes.json().catch(() => null);
        if (libRes.ok && libData && typeof libData.translatedText === 'string') {
          try { (window as any).__translationFallback = true; } catch (e) {}
          return libData.translatedText;
        }
      } catch (e) {
        console.warn('LibreTranslate attempt failed:', e);
      }

      console.error('Client-side fallbacks failed', { mmRes, mmData: mmData });
      throw new Error('Both server and client translation attempts failed.');
    } catch (fallbackErr) {
      console.error('Fallback translation error:', fallbackErr);
      throw new Error('Falha ao traduzir o texto. Verifique sua chave de API e conexão de rede.');
    }
  }
};