
export type Language = 'en-US' | 'pt-BR';
export type AppStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface LanguageOption {
  value: Language;
  label: string;
}
