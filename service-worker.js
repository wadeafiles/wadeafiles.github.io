/* global caches, fetch, self */

// Fill here with your cache name-version.
const CACHE_NAME ='Wadea-Files-Cache'
// This is the list of URLs to be cached by your Progressive Web App.
const CACHED_URLS = [
  "/",
  "/index.html",
  "/js/alpinejs.cdn.min.js",
  "/js/bootstrap.bundle.min.js",
  "/js/bootstrap.bundle.min.js.map",
  "/js/cropper.js",
  "/js/intersect.js",
  "/js/intersect.cdn.min.js",
  "/js/jquery.min.js",
  "/js/notify.min.js",
  "/js/pocketbase.umd.js.map",
  "/js/pocketbase.umd.js",
  "/css/pico.min.css",
  "/css/pico.min.css.map",
  "/css/boxicons.min.css",
  "/fonts/boxicons.woff2",
  "/Blank-Avatar.jpeg",
  "/favicon.png",
  "/manifest.webmanifest",
  "/ios/144.png"
]

// Open cache on install.
self.addEventListener('install', event => {
  event.waitUntil(async function () {
    const cache = await caches.open(CACHE_NAME)

    await cache.addAll(CACHED_URLS)
  }())
})

// Cache and update with stale-while-revalidate policy.
self.addEventListener('fetch', event => {
  if(event.request.method !== "GET" || event.request.url.includes("/api/") || event.request.url.replace(self.location.origin,'').startsWith("/auth")){
    return
  }
  try {
	  const { request } = event

	  // Prevent Chrome Developer Tools error:
	  // Failed to execute 'fetch' on 'ServiceWorkerGlobalScope': 'only-if-cached' can be set only with 'same-origin' mode
	  //
	  // See also https://stackoverflow.com/a/49719964/1217468
	  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
		return
	  }

	  event.respondWith(async function () {
		const cache = await caches.open(CACHE_NAME)

		const cachedResponsePromise = await cache.match(request)
		const networkResponsePromise = fetch(request)

		if (request.url.startsWith(self.location.origin) && CACHED_URLS.includes(event.request.url.replace(self.location.origin,''))) {
     // console.log(event.request.url.replace(self.location.origin,''),CACHED_URLS.includes(event.request.url.replace(self.location.origin,'')))
		  event.waitUntil(async function () {
			const networkResponse = await networkResponsePromise

			await cache.put(request, networkResponse.clone())
		  }())
		}

		return cachedResponsePromise || networkResponsePromise
	  }())
	}
	catch {
		return
	}
})

// Clean up caches other than current.
self.addEventListener('activate', event => {
  event.waitUntil(async function () {
    const cacheNames = await caches.keys()

    await Promise.all(
      cacheNames.filter((cacheName) => {
        const deleteThisCache = cacheName !== CACHE_NAME

        return deleteThisCache
      }).map(cacheName => caches.delete(cacheName))
    )
  }())
})
