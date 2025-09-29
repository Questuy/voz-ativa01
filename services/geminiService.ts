import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

const getLanguageName = (code: Language): string => {
    switch(code) {
        case 'en-US': return 'Inglês';
        case 'pt-BR': return 'Português';
    }
};

export const translateText = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const sourceLanguageName = getLanguageName(sourceLang);
    const targetLanguageName = getLanguageName(targetLang);

    const prompt = `Traduza o seguinte texto de ${sourceLanguageName} para ${targetLanguageName}. Forneça apenas o texto traduzido, sem quaisquer explicações, introduções ou aspas adicionais. O texto original é: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const translatedText = response.text.trim();
    return translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Falha ao traduzir o texto. Verifique sua chave de API e conexão de rede.");
  }
};