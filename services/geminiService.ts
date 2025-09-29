// services/geminiService.ts

export type LanguageCode = 'en' | 'pt';

// Função auxiliar para mapear códigos longos (pt-BR, en-US) para curtos
const mapLang = (code: string): LanguageCode | '' => {
  if (!code) return '';
  if (code.startsWith('pt')) return 'pt';
  if (code.startsWith('en')) return 'en';
  return code.split('-')[0] as LanguageCode; // fallback
};

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  try {
    // Pega a chave de API do .env.local (precisa começar com VITE_)
    const apiKey: string | undefined = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      throw new Error('⚠️ VITE_API_KEY não configurada no .env.local');
    }

    // Converte idiomas (ex: pt-BR -> pt, en-US -> en)
    const source = mapLang(sourceLang);
    const target = mapLang(targetLang);

    if (!target) {
      throw new Error(`Idioma alvo inválido: ${targetLang}`);
    }

    // Endpoint da API Google Translate
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    // Corpo da requisição
    const body: Record<string, any> = {
      q: text,
      source: source || undefined, // se não passar, o Google detecta automaticamente
      target,
      format: 'text',
    };

    // Chamada HTTP
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Se falhar no nível HTTP
    if (!res.ok) {
      const textResp = await res.text();
      console.error('❌ Resposta HTTP não OK:', res.status, textResp);
      throw new Error(`HTTP ${res.status}: ${textResp}`);
    }

    // Converte JSON
    const data = await res.json();

    // Extrai a tradução
    const translated: string | undefined =
      data?.data?.translations?.[0]?.translatedText;

    if (!translated) {
      console.error('⚠️ Resposta inesperada da API:', data);
      throw new Error('Resposta inesperada da API de tradução');
    }

    return translated;
  } catch (err) {
    console.error('❌ Erro ao traduzir:', err);
    throw new Error(
      'Falha ao traduzir o texto. Verifique sua chave de API e conexão de rede.'
    );
  }
}

