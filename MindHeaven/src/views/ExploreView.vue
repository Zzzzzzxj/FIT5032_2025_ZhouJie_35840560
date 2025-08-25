<template>
    <section class="wrap">
      <div class="section-header">
        <h1 class="page-title">Explore</h1>
        <p class="page-desc">Search places and plan a route. Location is approximate and for general guidance only.</p>
      </div>
  
      <!-- 1) 地图在上方，铺满容器宽度 -->
      <div class="map card" role="region" aria-label="interactive map">
        <div ref="mapEl" class="leaflet-map" />
      </div>
  
      <!-- 2) 输入面板在地图下方，居中显示 -->
      <aside class="panel card" role="complementary" aria-label="Search and routing">
        <div class="row">
          <label class="lbl" for="q">Search a place</label>
          <InputText id="q" v-model="query" class="wfull"
                     placeholder="e.g. counseling, cafe, park"
                     @keyup.enter="onSearch"/>
          <Button class="wfull mt6" icon="pi pi-search" label="Search" @click="onSearch" />
        </div>
  
        <div class="row two">
          <div>
            <label class="lbl" for="from">From</label>
            <InputText id="from" v-model="fromText" class="wfull" placeholder="Use 'My location' or lng,lat"/>
            <small class="hint" @click="useMyLocationAsFrom">Use my location</small>
          </div>
          <div>
            <label class="lbl" for="to">To</label>
            <InputText id="to" v-model="toText" class="wfull" placeholder="Destination address or lng,lat"/>
          </div>
        </div>
  
        <div class="row two">
          <div>
            <label class="lbl" for="mode">Mode</label>
            <Dropdown id="mode" v-model="profile" :options="profiles"
                      optionLabel="label" optionValue="value" class="wfull" />
          </div>
          <div class="btn-row">
            <Button class="wfull" icon="pi pi-directions" label="Get route" @click="onRoute" />
            <Button class="wfull" icon="pi pi-times" label="Clear" severity="secondary" @click="clearRoute" />
          </div>
        </div>
  
        <div class="results">
          <div class="results-head">
            <strong>Search Results</strong>
            <span class="muted" v-if="places.length">({{ places.length }})</span>
          </div>
  
          <ul class="place-list" v-if="places.length">
            <li v-for="p in places" :key="p.place_id" @click="focusPlace(p)">
              <div class="title">{{ p.display_name?.split(',')[0] || 'Place' }}</div>
              <div class="sub muted">{{ p.display_name }}</div>
            </li>
          </ul>
          <div v-else class="muted tiny">No results yet. Try searching “counseling” or “university”.</div>
  
          <div v-if="routeInfo" class="route-info">
            <div><strong>Distance:</strong> {{ routeInfo.distanceKm }} km</div>
            <div><strong>Duration:</strong> {{ routeInfo.durationMin }} min</div>
            <div class="muted tiny">Profile: {{ profile }}</div>
          </div>
        </div>
      </aside>
    </section>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import L from 'leaflet'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import Dropdown from 'primevue/dropdown'
  
  const mapEl = ref(null)
  let map
  let tiles
  let searchLayer = L.layerGroup()
  let routeLine = null
  let fromMarker = null
  let toMarker = null
  
  // 表单状态
  const query = ref('')
  const places = ref([])
  const fromText = ref('My location')
  const toText = ref('')
  const profile = ref('foot') // OSRM: walking/cycling/driving ← 映射 foot/bike/car
  const profiles = [
    { label: 'Walking', value: 'foot' },
    { label: 'Cycling', value: 'bike' },
    { label: 'Driving', value: 'car' }
  ]
  const routeInfo = ref(null)
  
  // 初始化地图（上方全宽）
  onMounted(() => {
    map = L.map(mapEl.value, { center: [-37.8136, 144.9631], zoom: 12 }) // Melbourne
    tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map)
    searchLayer.addTo(map)
  })
  
  // 搜索（Nominatim）
  async function onSearch() {
    const q = query.value?.trim()
    if (!q) return
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '10')
    url.searchParams.set('addressdetails', '0')
    url.searchParams.set('accept-language', 'en')
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MindHaven-Student-Project/1.0', 'Referer': location.origin }
      })
      const data = await res.json()
      places.value = data || []
      renderPlaceMarkers(places.value)
      if (places.value[0]) focusPlace(places.value[0])
    } catch (e) {
      console.warn('Nominatim search failed', e)
    }
  }
  
  function renderPlaceMarkers(list) {
    searchLayer.clearLayers()
    list.forEach(p => {
      const lat = parseFloat(p.lat)
      const lon = parseFloat(p.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return
      const m = L.marker([lat, lon]).bindPopup(p.display_name || 'Place')
      searchLayer.addLayer(m)
    })
  }
  function focusPlace(p) {
    const lat = parseFloat(p.lat)
    const lon = parseFloat(p.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return
    map.flyTo([lat, lon], 14, { duration: 0.6 })
  }
  
  // “我的位置”作为起点
  function useMyLocationAsFrom() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        fromText.value = `${longitude.toFixed(6)}, ${latitude.toFixed(6)}`
        setMarker('from', [latitude, longitude])
        map.flyTo([latitude, longitude], 14, { duration: 0.6 })
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }
  
  // 路线规划（OSRM demo）
  async function onRoute() {
    const start = await resolveToLatLng(fromText.value)
    const end   = await resolveToLatLng(toText.value)
    if (!start || !end) return
  
    setMarker('from', start)
    setMarker('to', end)
  
    const modeMap = { foot: 'walking', bike: 'cycling', car: 'driving' }
    const mode = modeMap[profile.value] || 'walking'
    const url = new URL(`https://router.project-osrm.org/route/v1/${mode}/${start[1]},${start[0]};${end[1]},${end[0]}`)
    url.searchParams.set('overview', 'full')
    url.searchParams.set('geometries', 'geojson')
    url.searchParams.set('alternatives', 'false')
  
    try {
      const res = await fetch(url)
      const data = await res.json()
      const route = data?.routes?.[0]
      if (!route) return
      drawRoute(route)
      fitRoute(route)
      routeInfo.value = {
        distanceKm: (route.distance/1000).toFixed(2),
        durationMin: Math.round(route.duration/60)
      }
    } catch (e) {
      console.warn('OSRM route failed', e)
    }
  }
  
  function clearRoute() {
    if (routeLine) { map.removeLayer(routeLine); routeLine = null }
    routeInfo.value = null
    if (fromMarker) { map.removeLayer(fromMarker); fromMarker = null }
    if (toMarker)   { map.removeLayer(toMarker);   toMarker   = null }
  }
  
  function drawRoute(route) {
    const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
    if (routeLine) map.removeLayer(routeLine)
    routeLine = L.polyline(coords, { color:'#3b82f6', weight:5, opacity:0.85 }).addTo(map)
  }
  function fitRoute(route) {
    const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
    const bounds = L.latLngBounds(coords)
    map.fitBounds(bounds, { padding:[40,40] })
  }
  
  // 文本→坐标：支持 “lng,lat” 或地址
  async function resolveToLatLng(text) {
    const t = (text || '').trim()
    if (!t) return null
    const m = t.match(/^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/)
    if (m) {
      const lng = parseFloat(m[1]), lat = parseFloat(m[3])
      if (Number.isFinite(lng) && Number.isFinite(lat)) return [lat, lng]
    }
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', t)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MindHaven-Student-Project/1.0', 'Referer': location.origin }
      })
      const data = await res.json()
      const f = data?.[0]
      const lat = parseFloat(f?.lat), lon = parseFloat(f?.lon)
      if (Number.isFinite(lat) && Number.isFinite(lon)) return [lat, lon]
      return null
    } catch {
      return null
    }
  }
  
  function setMarker(which, latlng) {
    if (which === 'from') {
      if (fromMarker) fromMarker.setLatLng(latlng)
      else fromMarker = L.marker(latlng, { title:'Start' }).addTo(map)
    } else {
      if (toMarker) toMarker.setLatLng(latlng)
      else toMarker = L.marker(latlng, { title:'Destination' }).addTo(map)
    }
  }
  </script>
  
  <style scoped>
  /* 地图在上，宽度占满；高度响应式 */
  .map{ padding:0; overflow:hidden; border-radius: 14px; }
  .leaflet-map{ width:100%; height: 62vh; min-height: 360px; }
  
  /* 下方输入面板：居中、最大宽度限制，避免溢出 */
  .panel{
    max-width: 980px;
    margin: 14px auto 0;
    padding: 14px;
    background: rgba(255,255,255,0.96);
    border-radius: 14px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
  
  /* 表单布局 */
  .row{ margin-bottom: 10px; }
  .two{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .lbl{ display:block; font-size:13px; color:#34495e; margin-bottom:4px; }
  .wfull{ width: 100%; }
  .mt6{ margin-top: 6px; }
  .hint{ color:#2563eb; cursor:pointer; user-select:none; display:inline-block; margin-top:4px; }
  .hint:hover{ text-decoration: underline; }
  .btn-row{ display:flex; gap:8px; align-items:center; }
  
  /* 结果列表 */
  .results{ margin-top: 8px; }
  .results-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .place-list{ list-style:none; padding:0; margin:0; max-height: 220px; overflow:auto; }
  .place-list li{
    border:1px solid #e5e7eb; border-radius:8px; padding:8px 10px; margin-bottom:8px;
    cursor:pointer; background:#fafafa;
  }
  .place-list li:hover{ background:#f3f4f6; }
  .place-list .title{ font-weight:600; color:#1f2937; }
  .place-list .sub{ font-size:12px; }
  .route-info{
    margin-top: 10px;
    background:#f8fafc;
    border:1px solid #e2e8f0;
    border-radius:8px;
    padding:8px 10px;
    display:flex; gap:12px; flex-wrap:wrap;
  }
  
  /* 移动端：表单双列改单列，地图高度降低一点 */
  @media (max-width: 900px){
    .two{ grid-template-columns: 1fr; }
    .leaflet-map{ height: 52vh; }
  }
  </style>
  