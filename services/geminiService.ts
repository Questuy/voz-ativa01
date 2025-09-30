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
    const res = await fetch('/api/translate', {
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
  } catch (err) {
    console.error('Error calling translation endpoint:', err);
    throw new Error('Falha ao traduzir o texto. Verifique sua chave de API e conexão de rede.');
  }
};