// Carnet TAGE MAGE : fonctionne hors ligne après la première ouverture.
const CACHE='carnet-tage-v20';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // Polices Google : mises en cache au premier passage
  if(url.hostname.endsWith('fonts.googleapis.com')||url.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{c.put(req,r.clone());return r}).catch(()=>hit))));return}
  if(url.origin!==location.origin)return;
  // Pages : réseau d'abord (pour les mises à jour), cache si hors ligne
  if(req.mode==='navigate'){e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));return r}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req)));
});
