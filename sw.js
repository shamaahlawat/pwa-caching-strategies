// Service Worker

// Cache name
const pwaCache = 'pwa-cache-1';

// Static assets to cache on install
const staticCache = [ '/', 'index.html', '/placeholder.png', '/style.css', '/main.js', '/thumb.png' ];


// SW fetch handler with different caching strategies
self.addEventListener('fetch', (e) => {


  // 5. Cache & Network Race with offline content
  let firstResponse = new Promise((resolve, reject) => {

    // Track rejections
    let firstRejectionReceived = false;
    let rejectOnce = () => {
      if (firstRejectionReceived) {

        if (e.request.url.match('thumb.png')) {
          resolve(caches.match('/placeholder.png'));
        } else {
          reject('No response received.')
        }
      } else {
        firstRejectionReceived = true;
      }
    };

    // Try Network
    fetch(e.request).then( (res) => {
      // Check res ok
      res.ok ? resolve(res) : rejectOnce();
    }).catch(rejectOnce);

    // Try Cache
    caches.match(e.request).then( (res) => {
      // Check cache found
      res ? resolve(res) : rejectOnce();
    }).catch(rejectOnce);

  });
  e.respondWith(firstResponse);


  // // 4. Cache with Network Update
  // e.respondWith(
  //   caches.open(pwaCache).then( (cache) => {
  //
  //     // Return from cache
  //     return cache.match(e.request).then( (res) => {
  //
  //       // Update
  //       let updatedRes = fetch(e.request).then( (newRes) => {
  //         // Cache new response
  //         cache.put(e.request, newRes.clone());
  //         return newRes;
  //       });
  //
  //       return res || updatedRes;
  //     })
  //   })
  // );

  // // 3. Network with cache fallback
  // e.respondWith(
  //   fetch(e.request).then( (res) => {
  //
  //     // Cache latest version
  //     caches.open(pwaCache).then( cache => cache.put(e.request, res) );
  //     return res.clone();
  //
  //   // Fallback to cache
  //   }).catch( err => caches.match(e.request) )
  // );

  // // 2. Cache with Network Fallback
  // e.respondWith(
  //   caches.match(e.request).then( (res) => {
  //     if(res) return res;
  //
  //     // Fallback
  //     return fetch(e.request).then( (newRes) => {
  //       // Cache fetched response
  //       caches.open(pwaCache).then( cache => cache.put(e.request, newRes) );
  //       return newRes.clone();
  //     })
  //   })
  // );

  // // 1. Cache only. Static assets - App Shell
  // e.respondWith(caches.match(e.request));

});


// SW install and cache static assets
self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open(pwaCache)
        .then( cache => cache.addAll(staticCache) )
    );
});

// SW Activate and cache cleanup
self.addEventListener('activate', (e) => {
    let cacheCleaned = caches.keys().then((keys) => {
        keys.forEach( (key) => {
            if (key !== pwaCache) return caches.delete(key);
        });
    });
    e.waitUntil(cacheCleaned);
});
