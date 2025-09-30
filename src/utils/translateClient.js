// Módulo cliente para tradução sem backend usando LibreTranslate (CORS-friendly).
// Exemplo de uso:
import { translateText } from './utils/translateClient.js';
const translated = await translateText('Olá mundo', 'en');

export async function translateText(text, target = 'en') {
	if (!text) throw new Error('translateText: text is required');
	// endpoint público do LibreTranslate (pode trocar para outro host com CORS)
	const url = 'https://libretranslate.com/translate';

	const payload = {
		q: text,
		source: 'auto',
		target: target,
		format: 'text'
	};

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	let data;
	try {
		data = await res.json();
	} catch (e) {
		throw new Error('translateText: invalid JSON response');
	}

	if (!res.ok) {
		// retornar detalhe para facilitar debugging
		const message = data?.error || JSON.stringify(data) || `HTTP ${res.status}`;
		throw new Error(`translateText failed: ${message}`);
	}

	// resposta esperada: { translatedText: "..." }
	if (typeof data.translatedText !== 'string') {
		throw new Error('translateText: unexpected response shape: ' + JSON.stringify(data));
	}

	return data.translatedText;
}