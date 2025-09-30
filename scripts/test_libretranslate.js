const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  try {
    const url = 'https://libretranslate.com/translate';
    const payload = { q: 'Olá mundo', source: 'pt', target: 'en', format: 'text' };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    console.log('status:', res.status);
    console.log('body:', data);
  } catch (err) {
    console.error('request failed:', err);
    process.exit(1);
  }
})();