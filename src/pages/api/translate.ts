import type { NextApiRequest, NextApiResponse } from 'next';

// Apenas POST
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { text, target } = req.body;
	if (!text || !target) {
		return res.status(400).json({ error: 'Missing parameters' });
	}

	try {
		const apiKey = process.env.GEMINI_API_KEY_PRIVATE;
		// Chamada à API de tradução Google (REST v2). Ajuste endpoint se usar outro serviço.
		const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
		const payload = {
			q: text,
			target: target,
			format: 'text'
		};

		const r = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const data = await r.json();

		if (!r.ok) {
			// encaminhar erro detalhado para debug
			return res.status(r.status).json({ error: data.error || 'Translation API error', details: data });
		}

		// estrutura esperada: data.data.translations[0].translatedText
		const translated = data?.data?.translations?.[0]?.translatedText ?? null;
		return res.status(200).json({ translated });
	} catch (err) {
		return res.status(500).json({ error: 'Internal server error', details: String(err) });
	}
}