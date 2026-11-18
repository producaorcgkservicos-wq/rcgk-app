// Service worker do app RCGK: guarda a "casca" do app para abrir rápido e funcionar como aplicativo.
// Os dados (negócios, custos) sempre vêm do servidor; nada de cliente fica guardado aqui.
const VERSAO = 'rcgk-v1';
const CASCA = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(CASCA)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // chamadas à API (POST) passam direto
  const url = new URL(req.url);
  if (url.hostname.endsWith('script.google.com') || url.hostname.endsWith('googleusercontent.com')) return;
  if (req.mode === 'navigate') {                          // página: tenta a versão nova, senão usa a guardada
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSAO).then(x => x.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {          // demais arquivos (ícones, fontes, gráficos)
    const rede = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSAO).then(x => x.put(req, c)); } return r; }).catch(() => hit);
    return hit || rede;
  }));
});
