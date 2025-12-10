// reactch.js - frontend logic for reaction sender
const logEl = document.getElementById('log');
const form = document.getElementById('form');
const clearBtn = document.getElementById('clear');

function addLog(t, type='info') {
  const prefix = (type === 'success') ? '✅ ' : (type === 'error' ? '❌ ' : '');
  logEl.innerText = `${prefix}${t}\n\n` + logEl.innerText;
}

clearBtn && clearBtn.addEventListener('click', () => { logEl.innerText = ''; });

form && form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const link = document.getElementById('link').value.trim();
  const emoji = document.getElementById('emoji').value.trim().replace(/,/g,' ').split(/\s+/).filter(Boolean).join(',');
  const apis = document.getElementById('apikeys').value.split('\n').map(s=>s.trim()).filter(Boolean);

  if (!link || !emoji || apis.length === 0) { addLog('Isi semua kolom terlebih dahulu', 'error'); return; }

  addLog('Memulai pengiriman request...');

  let success = false;
  let lastError = 'Unknown error';

  for (const api of apis) {
    try {
      const url = `https://react.whyux-xec.my.id/api/rch?link=${encodeURIComponent(link)}&emoji=${encodeURIComponent(emoji)}`;
      addLog(`Mengirim request dengan API key: ${api}`);
      const res = await fetch(url, { method: 'GET', headers: { 'x-api-key': api } });
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch (err) { json = null; }

      if (json && json.success) {
        addLog(`React Sent! Target: ${json.link} | Emoji: ${json.emojis}`, 'success');
        success = true;
        break;
      } else {
        lastError = (json && (json.details?.message || json.error)) || (`HTTP ${res.status} ${res.statusText}`);
        addLog(`Gagal dengan key ini — ${lastError}`, 'error');
        const low = lastError.toLowerCase();
        if (!low.includes('limit') && !low.includes('coin')) break;
      }
    } catch (err) {
      console.error(err);
      lastError = 'Terjadi Kesalahan Sistem';
      addLog(`Exception: ${err.message}`, 'error');
    }
  }

  if (!success) {
    addLog(`GAGAL — Pesan: ${lastError}\nInfo: Apikey kemungkinan habis. Ambil di https://asitha.top/login?ref=hillaryy2555`, 'error');
  }
});