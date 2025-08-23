<template>
    <section class="p-4 space-y-4">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-semibold">Find Support（附近心理健康服务）</h1>
        <div class="text-sm opacity-80">
          我们仅临时使用你的位置来规划路线，不会存储精确坐标。
        </div>
      </header>
  
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <label class="text-sm font-medium block mb-1">Search places (e.g. “psychological counseling”, “crisis center”)</label>
          <div class="flex gap-2">
            <input
              v-model="q"
              @input="onQueryInput"
              type="text"
              placeholder="Type keywords, e.g. psychological counseling"
              class="flex-1 px-3 py-2 border rounded"
              aria-label="Search places"
            />
            <button class="px-3 py-2 border rounded" @click="useMyLocation" :disabled="locating">
              {{ locating ? 'Locating…' : 'Use my location' }}
            </button>
          </div>
          <p class="text-xs opacity-70 mt-1">
            Search powered by OpenStreetMap Nominatim. Low-volume demo use only.
          </p>
        </div>
      </div>
  
      <div v-if="results.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <article
          v-for="r in results"
          :key="r.place_id"
          class="p-3 border rounded hover:shadow-sm transition"
        >
          <div class="font-medium">{{ r.display_name }}</div>
          <div class="text-xs opacity-70 mt-1">Lat: {{ r.lat }} • Lon: {{ r.lon }}</div>
          <div class="flex gap-2 mt-2">
            <button class="px-2 py-1 border rounded" @click="goHere(r)">Route here</button>
            <button class="px-2 py-1 border rounded" @click="pinHere(r)">Pin</button>
          </div>
        </article>
      </div>
  
      <div ref="mapEl" class="w-full h-[70vh] rounded-xl overflow-hidden border"></div>
  
      <div class="sr-only">
        地图支持：地点搜索结果定位，以及从“我的位置”或点击地图起点到目标点的路线规划。使用 Tab 键可聚焦搜索框与按钮。
      </div>
    </section>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
  import 'leaflet-routing-machine'
  

  import iconUrl from 'leaflet/dist/images/marker-icon.png'
  import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
  import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
  L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })
  
  const mapEl = ref(null)
  let map, routing, startMarker, destMarker

  const q = ref('')
  const results = ref([])
  let debounceTimer = null
  const locating = ref(false)
  
  onMounted(() => {
    map = L.map(mapEl.value).setView([35.681, 139.767], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    routing = L.Routing.control({
      waypoints: [],
      routeWhileDragging: true,
      show: false, 
    }).addTo(map)

    let lastClickSetStart = false
    map.on('click', (e) => {
      if (!lastClickSetStart) {
        setStart(e.latlng)
        lastClickSetStart = true
      } else {
        setDestination(e.latlng, { fly: true, route: true })
        lastClickSetStart = false
      }
    })
  })

  function onQueryInput() {
    clearTimeout(debounceTimer)
    const query = q.value?.trim()
    if (!query) {
      results.value = []
      return
    }
    debounceTimer = setTimeout(() => doSearch(query), 400)
  }
  
  async function doSearch(query) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(query)}`
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en'
        }
      })
      const data = await res.json()
      results.value = (data || []).map(d => ({
        ...d,
        lat: parseFloat(d.lat),
        lon: parseFloat(d.lon)
      }))
      if (results.value[0]) {
        flyTo([results.value[0].lat, results.value[0].lon], 13)
      }
    } catch (e) {
      console.warn('Search failed:', e)
      results.value = []
    }
  }
  

  function pinHere(r) {
    const ll = L.latLng(r.lat, r.lon)
    setDestination(ll, { fly: true, route: false })
  }
  
  async function goHere(r) {
    const ll = L.latLng(r.lat, r.lon)
    if (!startMarker) {
      const ok = await tryUseGeolocation()
      if (!ok) {
        alert('Click the map to set a start point, then choose "Route here" again.')
        return
      }
    }
    setDestination(ll, { fly: true, route: true })
  }

  async function useMyLocation() {
    locating.value = true
    const ok = await tryUseGeolocation(true)
    locating.value = false
    if (!ok) alert('Unable to get your location. You can click the map to set start point.')
  }
  
  function tryUseGeolocation(fly = false) {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(false)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const ll = L.latLng(pos.coords.latitude, pos.coords.longitude)
          setStart(ll)
          if (fly) flyTo(ll, 14)
          resolve(true)
        },
        () => resolve(false),
        { enableHighAccuracy: true, timeout: 8000 }
      )
    })
  }
  

  function setStart(latlng) {
    if (startMarker) { map.removeLayer(startMarker) }
    startMarker = L.marker(latlng, { title: 'Start' }).addTo(map)
    updateRoute()
  }

  function setDestination(latlng, opts = { fly: false, route: false }) {
    if (destMarker) { map.removeLayer(destMarker) }
    destMarker = L.marker(latlng, { title: 'Destination' }).addTo(map)
    if (opts.fly) flyTo(latlng, 14)
    if (opts.route) updateRoute()
  }

  function updateRoute() {
    const start = startMarker?.getLatLng()
    const dest = destMarker?.getLatLng()
    if (start && dest) {
      routing.setWaypoints([start, dest])
    }
  }

  function flyTo(latlng, zoom = 13) {
    map?.flyTo(latlng, zoom, { duration: 0.8 })
  }
  </script>
  

  