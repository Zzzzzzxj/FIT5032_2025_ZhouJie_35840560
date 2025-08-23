<!-- src/views/ExploreView.vue -->
<template>
    <section class="p-4 space-y-4">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Find Support（附近心理健康服务）</h1>
        <div class="text-sm opacity-80">
          我们仅临时使用你的位置来规划路线，不会存储精确坐标。
        </div>
      </header>
  
      <div ref="mapEl" class="w-full h-[70vh] rounded-xl overflow-hidden"></div>
  
      <div class="sr-only">
        <!-- 无障碍文字说明 -->
        地图支持地点搜索与路线规划。使用 Tab 键可聚焦搜索框并输入地址或机构名称。
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import mapboxgl from 'mapbox-gl'
  import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
  import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
  import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
  import '@mapbox/mapbox-gl-directions/dist/mapbox-directions.css'
  
  const mapEl = ref(null)
  
  onMounted(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
  
    const map = new mapboxgl.Map({
      container: mapEl.value,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [139.767, 35.681], // 东京站附近，先给个默认中心
      zoom: 12
    })
  
    // 搜索框（POI 搜索）
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      placeholder: '搜索心理咨询/精神科/危机中心等…',
    })
    map.addControl(geocoder)
  
    // 路线规划（驾车/步行/骑行）
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving',
      alternatives: true,
      controls: { instructions: true }
    })
    map.addControl(directions, 'top-left')
  
    // 定位到用户当前位置（可选）
    const geo = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserHeading: true
    })
    map.addControl(geo)
  
    // 点击地图设置起/终点（可选增强）
    map.on('click', (e) => {
      // 第一次点击设起点，第二次点击设终点（简化：都用 Directions 控件去填）
      // 这里演示：把点击点设为目的地（终点）
      directions.setDestination([e.lngLat.lng, e.lngLat.lat])
    })
  })
  </script>
  
  <style scoped>
  /* 减少动画的“Calm Mode”可在全局类 .reduce-motion 下调低过渡 */
  </style>
  