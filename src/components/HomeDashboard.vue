<template>
    <div class="flex flex-col gap-6 h-full w-full text-white select-none pb-8" :style="`--accent-theme: ${currentThemeColor};`">

        <div class="glass-card relative overflow-hidden group min-h-[140px] flex flex-col justify-between p-0 shadow-lg border-white/10">
            <div class="absolute inset-0 z-0 transition-all duration-1000 opacity-80" :style="weatherBgStyle"></div>

            <div class="relative z-10 flex items-start justify-between p-5">
                <div class="flex flex-col">
                    <div class="flex items-center gap-1.5 opacity-80 mb-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span class="text-[10px] font-bold tracking-widest uppercase">{{ geoData[weatherUser]?.city || '定位同步中...' }}</span>
                    </div>
                    <div class="text-4xl font-mono font-black drop-shadow-md flex items-start">
                        {{ geoData[weatherUser]?.temp || '--' }}<span class="text-lg mt-1 opacity-70">°</span>
                    </div>
                    <div class="text-[10px] mt-1 opacity-70 uppercase tracking-widest">{{ weatherDesc }}</div>
                </div>

                <button @click="openMap" class="w-12 h-12 rounded-full bg-black/20 border border-white/20 backdrop-blur-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg group-hover:bg-black/40">
                    <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
            </div>

            <div class="absolute -bottom-6 -right-4 z-10 opacity-70 pointer-events-none">
                <div v-if="weatherCode === 'clear'" class="w-24 h-24 bg-yellow-400 rounded-full blur-[2px] shadow-[0_0_40px_rgba(250,204,21,0.6)] animate-[spin_10s_linear_infinite] border-4 border-yellow-300/30"></div>
                <div v-else-if="weatherCode === 'cloudy'" class="relative w-32 h-20">
                    <div class="absolute right-4 bottom-4 w-16 h-16 bg-white/80 rounded-full blur-[1px] animate-[pulse_4s_ease-in-out_infinite]"></div>
                    <div class="absolute right-12 bottom-2 w-12 h-12 bg-white/60 rounded-full blur-[1px]"></div>
                </div>
                <div v-else class="w-24 h-24 bg-blue-400/50 rounded-full blur-[10px] animate-pulse"></div>
            </div>
        </div>

        <div class="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
            <button v-for="u in users" :key="u.id" @click="switchUser(u.id)"
                    class="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    :class="activeUser === u.id ? 'bg-white/15 text-white shadow-md border border-white/10' : 'text-white/40 hover:text-white/70'">
                {{ u.label }}
            </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
            <button @click="enterModule('study')" class="glass-card p-5 flex flex-col items-start gap-4 hover:bg-white/10 active:scale-[0.98] transition-all group text-left border-white/5 hover:border-[var(--accent-theme)] relative overflow-hidden">
                <div class="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <div>
                    <h3 class="text-lg font-black tracking-wider">学业演进系统</h3>
                    <p class="text-[10px] text-white/50 mt-1 uppercase tracking-widest">支持 EVM 模型的多层级目标拆解</p>
                </div>
            </button>

            <button @click="enterModule('sport')" class="glass-card p-5 flex flex-col items-start gap-4 hover:bg-white/10 active:scale-[0.98] transition-all group text-left border-white/5 hover:border-green-500/50 relative overflow-hidden">
                <div class="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                    <h3 class="text-lg font-black tracking-wider">机能训练矩阵</h3>
                    <p class="text-[10px] text-white/50 mt-1 uppercase tracking-widest">动态频率推演与多维数据打卡</p>
                </div>
            </button>

            <button @click="enterModule('sleep')" class="glass-card p-5 flex flex-col items-start gap-4 hover:bg-white/10 active:scale-[0.98] transition-all group text-left border-white/5 hover:border-indigo-500/50 sm:col-span-2 relative overflow-hidden">
                <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                </div>
                <div>
                    <h3 class="text-lg font-black tracking-wider">昼夜节律重塑</h3>
                    <p class="text-[10px] text-white/50 mt-1 uppercase tracking-widest">月度时序追踪与作息周期评估</p>
                </div>
            </button>
        </div>

        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showMap" class="fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl flex flex-col p-4">
                    <header class="flex justify-between items-center py-4 z-20">
                        <h3 class="text-lg font-black tracking-widest uppercase">Global <span class="opacity-50">Locator</span></h3>
                        <button @click="closeMap" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 shadow-lg border border-white/10 hover:bg-white/20 transition-all"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    </header>

                    <div class="flex-1 rounded-[2.5rem] bg-[#000] relative overflow-hidden shadow-2xl z-10 border border-white/5">
                        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex bg-black/50 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-2xl">
                            <button @click="changeMapStyle('dark')" :class="currentMapType === 'dark' ? 'bg-white/20 text-white' : 'text-white/50'" class="px-4 py-2 rounded-full text-[10px] font-bold transition-all">极简暗黑</button>
                            <button @click="changeMapStyle('satellite')" :class="currentMapType === 'satellite' ? 'bg-white/20 text-white' : 'text-white/50'" class="px-4 py-2 rounded-full text-[10px] font-bold transition-all">实况卫星</button>
                            <button @click="changeMapStyle('street')" :class="currentMapType === 'street' ? 'bg-white/20 text-white' : 'text-white/50'" class="px-4 py-2 rounded-full text-[10px] font-bold transition-all">城市交通</button>
                        </div>

                        <div id="maplibreContainer" class="w-full h-full absolute inset-0 z-0 cursor-crosshair"></div>
                    </div>

                    <div class="py-6 text-center text-[10px] opacity-40 uppercase tracking-[0.2em] font-mono">MapLibre WebGL Engine Online</div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, nextTick } from 'vue'
    import maplibregl from 'maplibre-gl'
    import 'maplibre-gl/dist/maplibre-gl.css'

    const props = defineProps<{ initialUser: 'her' | 'bond' | 'him' }>()
    const emit = defineEmits(['update:user', 'navigate'])
    const currentThemeColor = computed(() => getComputedStyle(document.documentElement).getPropertyValue('--accent-theme').trim() || '#3b82f6')

    const activeUser = ref(props.initialUser)
    // 满足需求：锁定天气读取对象，不会因为切到 DUAL SYNC 就丢失定位信息
    const weatherUser = ref(props.initialUser === 'bond' ? 'her' : props.initialUser)
    const showMap = ref(false)

    // 满足需求：将 DUAL SYNC 修改为 分析面板
    const users = [{ id: 'her', label: 'HER DATA' }, { id: 'bond', label: '分析面板' }, { id: 'him', label: 'HIS DATA' }] as const

    let mapInstance: maplibregl.Map | null = null
    const currentMapType = ref<'dark'|'satellite'|'street'>('dark')

    const geoData = ref<Record<string, { temp: number, code: number, city: string, lat: number, lng: number }>>(
    JSON.parse(localStorage.getItem('sync_geo_data') || '{}')
    )

    const weatherCode = computed(() => {
    const code = geoData.value[weatherUser.value]?.code || 0
    if (code <= 1) return 'clear'
    if (code <= 3) return 'cloudy'
    return 'rain'
    })
    const weatherDesc = computed(() => {
    const map: Record<string, string> = { 'clear': '晴朗 / CLEAR', 'cloudy': '多云 / CLOUDS', 'rain': '降水 / PRECIPITATION' }
    return map[weatherCode.value] || '测算中...'
    })
    const weatherBgStyle = computed(() => {
    const styles: Record<string, string> = {
    'clear': 'background: linear-gradient(135deg, #1e3a8a, #3b82f6);',
    'cloudy': 'background: linear-gradient(135deg, #475569, #94a3b8);',
    'rain': 'background: linear-gradient(135deg, #0f172a, #334155);'
    }
    return styles[weatherCode.value] || styles['cloudy']
    })

    const initGeospatialSync = () => {
    const currentUser = localStorage.getItem('sync_current_user') || 'him'
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
    async (pos) => await fetchWeatherData(currentUser, pos.coords.latitude, pos.coords.longitude),
    () => {
    const fallback = currentUser === 'him' ? { lat: 1.34, lng: 103.68, city: 'Singapore' } : { lat: 25.04, lng: 102.70, city: 'Kunming' }
    fetchWeatherData(currentUser, fallback.lat, fallback.lng, fallback.city)
},
    { timeout: 5000 }
    )
    }
    }

    const fetchWeatherData = async (user: string, lat: number, lng: number, forceCity?: string) => {
    try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
    const data = await res.json()
    geoData.value[user] = { temp: Math.round(data.current_weather.temperature), code: data.current_weather.weathercode, city: forceCity || `${lat.toFixed(2)}, ${lng.toFixed(2)}`, lat, lng }
    localStorage.setItem('sync_geo_data', JSON.stringify(geoData.value))
    } catch (e) { console.error(e) }
    }

    // 核心：无 Key 免费图源配置体系
    const mapStyles = {
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    street: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    satellite: {
    version: 8,
    sources: {
    'esri-satellite': {
    type: 'raster',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    tileSize: 256,
    attribution: 'Tiles &copy; Esri'
    }
    },
    layers: [{
    id: 'satellite-layer',
    type: 'raster',
    source: 'esri-satellite',
    minzoom: 0,
    maxzoom: 20
    }]
    } as maplibregl.StyleSpecification
    }

    const openMap = () => {
    showMap.value = true
    nextTick(() => {
    if (!mapInstance) {
    mapInstance = new maplibregl.Map({
    container: 'maplibreContainer',
    style: mapStyles[currentMapType.value],
    center: [103.68, 1.34],
    zoom: 2,
    pitch: 45, // 开启 3D 倾斜视角
    attributionControl: false
    })

    const createMarkerElement = (label: string, color: string) => {
    const el = document.createElement('div')
    el.innerHTML = `
    <div class="relative w-8 h-8 flex items-center justify-center -ml-4 -mt-4 cursor-pointer hover:scale-125 transition-transform">
    <div class="absolute inset-0 rounded-full animate-pulse opacity-40 blur-[4px]" style="background-color: ${color}"></div>
    <div class="w-6 h-6 bg-[#0f172a] rounded-full border-2 shadow-xl z-10 flex items-center justify-center text-[9px] font-black" style="border-color: ${color}; color: ${color};">${label}</div>
    </div>`
    return el
    }

    const himPos: [number, number] = [geoData.value['him']?.lng || 103.68, geoData.value['him']?.lat || 1.34]
    const herPos: [number, number] = [geoData.value['her']?.lng || 102.70, geoData.value['her']?.lat || 25.04]

    // HTML Marker 在切换 style 时不会被清空
    new maplibregl.Marker({ element: createMarkerElement('HIS', '#3b82f6') })
    .setLngLat(himPos).addTo(mapInstance)
    new maplibregl.Marker({ element: createMarkerElement('HER', '#ec4899') })
    .setLngLat(herPos).addTo(mapInstance)

    // 高级飞行动画
    mapInstance.flyTo({
    center: [(himPos[0] + herPos[0]) / 2, (himPos[1] + herPos[1]) / 2],
    zoom: 3.5, // 扁平 3D 视角下，这个缩放比刚好能看完整个亚洲
    speed: 0.8,
    curve: 1.2
    })
    }
    })
    }

    // 无缝切换地图模式
    const changeMapStyle = (type: 'dark' | 'satellite' | 'street') => {
    if (!mapInstance) return
    currentMapType.value = type
    mapInstance.setStyle(mapStyles[type])
    }

    const closeMap = () => {
    showMap.value = false
    if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    }
    }

    onMounted(initGeospatialSync)

    const switchUser = (id: 'her' | 'bond' | 'him') => {
    activeUser.value = id
    // 当切换的不是 分析面板 时，更新天气底座锁定对象
    if (id !== 'bond') {
    weatherUser.value = id
    }
    emit('update:user', id)
    }

    const enterModule = (module: 'study' | 'sport' | 'sleep') => {
    activeUser.value === 'bond' ? emit('navigate', 'analysis') : emit('navigate', module)
    }
</script>

<style scoped>
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(25px);
        border-radius: 1.5rem;
    }

    .fade-scale-enter-active, .fade-scale-leave-active {
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .fade-scale-enter-from, .fade-scale-leave-to {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
        filter: blur(10px);
    }

    /* 抹除控件白边并适配指针 */
    :deep(.maplibregl-canvas-container) {
        cursor: crosshair;
    }

    :deep(.maplibregl-ctrl-bottom-left), :deep(.maplibregl-ctrl-bottom-right) {
        display: none !important;
    }
</style>