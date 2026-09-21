const CACHE='caminho-de-luz-v1-4-0';
const ASSETS=['./index.html','./manifest.webmanifest','./logo-48.png','./logo-180.png','./logo-192.png','./logo-512.png','./content.js','./app.js','./refinement.css','./lessons.js','./study.js','./study.css','./audiobooks-data.js','./audiobooks.js','./audiobooks.css','./christ-song.js','./christ.css'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const path of ASSETS){const response=await fetch(path,{cache:'reload'});if(!response.ok||response.redirected)throw new Error('Asset unavailable');await cache.put(path,response)}
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('caminho-de-luz-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||req.headers.has('range'))return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{try{return await fetch(req)}catch{return await caches.match('./index.html')||new Response('Abra o aplicativo com internet uma vez para preparar o modo offline.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})}})());return;
  }
  if(!ASSETS.some(p=>new URL(p,self.registration.scope).pathname===url.pathname))return;
  event.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(req,{ignoreSearch:true});return hit||fetch(req)})());
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const target=new URL('./#today',self.registration.scope).href;const pages=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const page of pages){if(page.url.startsWith(self.registration.scope)){await page.focus();await page.navigate(target);return}}await self.clients.openWindow(target)})())});
