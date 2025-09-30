// Clean translate client that uses VITE_API_BASE when configured.
export async function translateText(text: string, target: string) {
	const apiBase = (import.meta as any).env?.VITE_API_BASE;
	if (!apiBase) {
		// No backend configured; let caller handle fallback
		throw new Error('No backend configured');
	}

	const res = await fetch(`${apiBase.replace(/\/$/, '')}/translate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ text, target }),
	});

	const json = await res.json();
	if (!res.ok) throw new Error(json.error || 'Translation failed');
	return json.translated || json.translation || null;
}