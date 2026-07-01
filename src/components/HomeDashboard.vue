<template>
    <div class="flex flex-col gap-5 h-full w-full text-white select-none pb-8" :style="`--accent-theme: ${currentThemeColor};`">

        <!-- ========== 天气主卡（Apple 天气质感） ========== -->
        <div class="weather-hero glass-card relative overflow-hidden group shadow-2xl border-white/10">
            <div class="absolute inset-0 z-0 transition-all duration-1000" :style="weatherBgStyle"></div>
            <div class="absolute inset-x-0 top-0 h-32 z-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>

            <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <template v-if="weatherCode === 'clear'">
                    <div class="sun-core"></div>
                    <div class="sun-rays"></div>
                </template>
                <template v-else-if="weatherCode === 'cloudy'">
                    <div class="cloud cloud-a"></div>
                    <div class="cloud cloud-b"></div>
                </template>
                <template v-else-if="weatherCode === 'rain' || weatherCode === 'storm'">
                    <div class="cloud cloud-a opacity-60"></div>
                    <span v-for="n in 16" :key="n" class="rain-drop" :style="rainStyle(n)"></span>
                    <div v-if="weatherCode === 'storm'" class="lightning"></div>
                </template>
                <template v-else-if="weatherCode === 'snow'">
                    <span v-for="n in 14" :key="n" class="snow-flake" :style="snowStyle(n)"></span>
                </template>
            </div>

            <div class="relative z-10 p-5 sm:p-6 flex flex-col gap-4">
                <div class="flex items-start justify-between">
                    <div class="flex flex-col">
                        <div class="flex items-center gap-1.5 opacity-90 mb-2">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span class="text-[11px] font-bold tracking-[0.18em] uppercase">{{ locationLabel }}</span>
                        </div>

                        <div class="flex items-start">
                            <span class="text-6xl sm:text-7xl font-thin tracking-tighter leading-none drop-shadow-lg tabular-nums">{{ geoData[weatherUser]?.temp ?? '--' }}</span>
                            <span class="text-3xl font-thin mt-1 opacity-60">°</span>
                        </div>

                        <div class="mt-2 text-sm font-medium opacity-90 tracking-wide">{{ weatherDesc }}</div>
                        <div class="mt-1 flex items-center gap-3 text-[11px] opacity-70 font-medium tabular-nums">
                            <span v-if="geoData[weatherUser]?.high != null">最高 {{ geoData[weatherUser]?.high }}°</span>
                            <span v-if="geoData[weatherUser]?.low != null">最低 {{ geoData[weatherUser]?.low }}°</span>
                            <span v-if="geoData[weatherUser]?.wind != null" class="flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8h11a3 3 0 100-6 3 3 0 00-2.83 2M3 16h15a3 3 0 110 6 3 3 0 01-2.83-2M3 12h18"></path></svg>
                                {{ geoData[weatherUser]?.wind }} km/h
                            </span>
                        </div>
                    </div>

                    <button @click="openMap" class="w-12 h-12 rounded-2xl bg-black/25 border border-white/25 backdrop-blur-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg flex-shrink-0">
                        <svg class="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </button>
                </div>

                <div v-if="geoData[weatherUser]?.forecast?.length" class="forecast-strip flex items-stretch gap-1.5 pt-3 mt-1 border-t border-white/15">
                    <div v-for="(f, i) in geoData[weatherUser]?.forecast" :key="i"
                         class="flex-1 flex flex-col items-center gap-1.5 py-1 rounded-xl"
                         :class="i === 0 ? 'bg-white/10' : ''">
                        <span class="text-[10px] font-bold opacity-70 tracking-wide">{{ f.label }}</span>
                        <svg v-if="f.cat === 'clear'" class="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></g></svg>
                        <svg v-else-if="f.cat === 'cloudy'" class="w-5 h-5 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5 19a4.5 4.5 0 010-9 6 6 0 0111.6-1.6A4 4 0 0117.5 19h-11z"/></svg>
                        <svg v-else-if="f.cat === 'snow'" class="w-5 h-5 text-sky-100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M6 16a4 4 0 010-8 5.5 5.5 0 0110.6-1.5A3.5 3.5 0 0117 16"/><path d="M8 20v.01M12 19v.01M16 20v.01"/></svg>
                        <svg v-else class="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M6 14a4 4 0 010-8 5.5 5.5 0 0110.6-1.5A3.5 3.5 0 0117 14"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/></svg>
                        <div class="text-[10px] font-bold tabular-nums leading-tight text-center">
                            <span>{{ f.max }}°</span>
                            <span class="opacity-50 ml-0.5">{{ f.min }}°</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========== 用户切换 ========== -->
        <div class="relative flex bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
            <div class="seg-thumb" :style="segThumbStyle"></div>
            <button v-for="u in users" :key="u.id" @click="switchUser(u.id)"
                    class="relative z-10 flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors duration-300 flex items-center justify-center"
                    :class="activeUser === u.id ? 'text-white' : 'text-white/40 hover:text-white/70'">
                {{ u.label }}
            </button>
        </div>

        <!-- ========== 模块入口 ========== -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
            <button @click="enterModule('study')" class="module-card glass-card group" style="--c:59,130,246;">
                <div class="module-icon">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <div class="flex-1">
                    <h3 class="text-lg font-black tracking-wider">学业演进系统</h3>
                    <p class="text-[10px] text-white/50 mt-1 uppercase tracking-widest">EVM 模型的多层级目标拆解</p>
                </div>
                <span class="module-arrow">→</span>
            </button>

            <button @click="enterModule('sport')" class="module-card glass-card group" style="--c:16,185,129;">
                <div class="module-icon">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div class="flex-1">
                    <h3 class="text-lg font-black tracking-wider">运动打卡系统</h3>
                    <p class="text-[10px] text-white/50 mt-1 uppercase tracking-widest">目标拆解与多维健身打卡</p>
                </div>
                <span class="module-arrow">→</span>
            </button>

            <button @click="enterModule('sleep')" class="module-card glass-card group sm:col-span-2" style="--c:99,102,241;">
                <div class="module-icon">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                </div>
                <div class="flex-1">
                    <h3 class="text-lg font-black tracking-wider">早睡早起系统</h3>
                    <p class="text-[10px] text-white/50 mt-1 uppercase tracking-widest">记录入睡与起床，养成节律</p>
                </div>
                <span class="module-arrow">→</span>
            </button>
        </div>

        <!-- ========== 地图（Apple 地图风格 + 昼夜晨昏线） ========== -->
        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showMap" class="fixed inset-0 z-[300] bg-black/60 backdrop-blur-2xl flex flex-col">
                    <header class="px-5 pb-3 flex flex-col items-center gap-2 z-20" style="padding-top: max(2.75rem, env(safe-area-inset-top));">
                        <div class="w-10 h-1.5 rounded-full bg-white/30"></div>
                        <div class="w-full flex justify-between items-center mt-1">
                            <div class="flex flex-col">
                                <h3 class="text-lg font-black tracking-wide leading-none">地图</h3>
                                <span class="text-[10px] text-white/50 mt-1 tracking-wider">你们相距 <span class="text-white/80 font-bold tabular-nums">{{ distanceKm.toLocaleString() }}</span> 公里</span>
                            </div>
                            <button @click="closeMap" class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-90 hover:bg-white/25 transition-all border border-white/10"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                    </header>

                    <div class="flex-1 mx-3 mb-3 rounded-[2.2rem] relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10">
                        <div id="maplibreContainer" class="w-full h-full absolute inset-0 z-0"></div>

                        <!-- 右上：日照开关 + 重新居中 -->
                        <div class="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            <button @click="toggleTerminator" class="w-11 h-11 rounded-full bg-white/85 backdrop-blur-xl flex items-center justify-center shadow-lg active:scale-90 transition-all border border-black/5" :title="enableTerminator ? '关闭昼夜' : '开启昼夜'">
                                <svg v-if="enableTerminator" class="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                                <svg v-else class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></g></svg>
                            </button>
                            <button @click="recenterMap" class="w-11 h-11 rounded-full bg-white/85 backdrop-blur-xl flex items-center justify-center shadow-lg active:scale-90 transition-all border border-black/5">
                                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.5 8.5L22 12l-8.5 3.5L12 22l-3.5-8.5L2 12l8.5-1.5z" transform="rotate(45 12 12)"/></svg>
                            </button>
                        </div>

                        <!-- 底部：可横向滑动的样式切换 -->
                        <div class="absolute bottom-5 inset-x-0 z-20 flex justify-center px-4">
                            <div class="flex flex-nowrap overflow-x-auto no-bar gap-1 bg-white/80 backdrop-blur-2xl p-1 rounded-2xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] max-w-full">
                                <button v-for="s in mapTabs" :key="s.id" @click="changeMapStyle(s.id)"
                                        class="px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                                        :class="currentMapType === s.id ? 'bg-blue-500 text-white shadow' : 'text-slate-600 hover:bg-black/5'">
                                    {{ s.label }}
                                </button>
                            </div>
                        </div>
                    </div>
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
    const weatherUser = ref(props.initialUser === 'bond' ? 'her' : props.initialUser)
    const showMap = ref(false)

    const users = [{ id: 'her', label: 'HER DATA' }, { id: 'him', label: 'HIS DATA' }] as const

    const segThumbStyle = computed(() => {
    const idx = users.findIndex(u => u.id === activeUser.value)
    return { transform: `translateX(${idx * 100}%)` }
    })

    let mapInstance: maplibregl.Map | null = null
    type MapType = 'standard' | 'satellite' | 'dark'
    const currentMapType = ref<MapType>('standard')
    const mapTabs = [
    { id: 'standard', label: '标准' },
    { id: 'satellite', label: '卫星' },
    { id: 'dark', label: '夜间' }
    ] as const

    interface GeoEntry {
    temp: number; code: number; city: string; district?: string; lat: number; lng: number;
    high?: number; low?: number; wind?: number;
    forecast?: { label: string; cat: string; max: number; min: number }[]
    }
    const geoData = ref<Record<string, GeoEntry>>(JSON.parse(localStorage.getItem('sync_geo_data') || '{}'))

    const catOf = (code: number) => {
    if (code <= 1) return 'clear'
    if (code <= 3) return 'cloudy'
    if (code >= 71 && code <= 77) return 'snow'
    if (code >= 95) return 'storm'
    return 'rain'
    }

    const weatherCode = computed(() => catOf(geoData.value[weatherUser.value]?.code ?? 0))
    const weatherDesc = computed(() => {
    const map: Record<string, string> = { clear: '晴朗', cloudy: '多云', rain: '有降水', snow: '降雪', storm: '雷暴' }
    return map[weatherCode.value] || '测算中…'
    })
    const weatherBgStyle = computed(() => {
    const styles: Record<string, string> = {
    clear: 'background: linear-gradient(160deg, #2563eb 0%, #38bdf8 60%, #7dd3fc 100%);',
    cloudy: 'background: linear-gradient(160deg, #475569 0%, #64748b 55%, #94a3b8 100%);',
    rain: 'background: linear-gradient(160deg, #0f172a 0%, #1e293b 55%, #334155 100%);',
    snow: 'background: linear-gradient(160deg, #334155 0%, #64748b 55%, #cbd5e1 100%);',
    storm: 'background: linear-gradient(160deg, #020617 0%, #1e1b4b 55%, #312e81 100%);'
    }
    return styles[weatherCode.value] || styles['cloudy']
    })

    const rainStyle = (n: number) => ({ left: `${(n * 6.2) % 100}%`, animationDelay: `${(n % 5) * 0.18}s`, animationDuration: `${0.5 + (n % 3) * 0.15}s` })
    const snowStyle = (n: number) => ({ left: `${(n * 7.1) % 100}%`, animationDelay: `${(n % 6) * 0.4}s`, animationDuration: `${3 + (n % 4)}s` })

    // 位置标签：优先「区 · 市」，否则市，再否则占位
    const locationLabel = computed(() => {
    const g = geoData.value[weatherUser.value]
    if (!g) return '定位同步中…'
    if (g.district && g.district !== g.city) return `${g.city} · ${g.district}`
    return g.city || '定位同步中…'
    })

    const fallbackOf = (u: string) => u === 'him'
    ? { lat: 1.34, lng: 103.68, city: 'Singapore' }
    : { lat: 25.04, lng: 102.70, city: 'Kunming' }

    const initGeospatialSync = () => {
    // 关键修复：定位对象 = 当前登录用户本人（不再读可能过期的 localStorage），HIS 登录就更新 HIS 的定位
    const me = weatherUser.value
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeatherData(me, pos.coords.latitude, pos.coords.longitude),
    () => { const fb = fallbackOf(me); fetchWeatherData(me, fb.lat, fb.lng, fb.city) },
    { enableHighAccuracy: true, timeout: 8000 }
    )
    } else {
    const fb = fallbackOf(me); fetchWeatherData(me, fb.lat, fb.lng, fb.city)
    }
    }

    const weekdayCN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const fetchWeatherData = async (user: string, lat: number, lng: number, forceCity?: string) => {
    try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`)
    const data = await res.json()
    const cw = data.current_weather
    const d = data.daily
    const forecast = (d?.time || []).slice(0, 5).map((t: string, i: number) => ({
    label: i === 0 ? '今天' : weekdayCN[new Date(t).getDay()],
    cat: catOf(d.weathercode[i]),
    max: Math.round(d.temperature_2m_max[i]),
    min: Math.round(d.temperature_2m_min[i])
    }))

    // 逆地理编码：精确到「市 + 区/县」（免费、无需 Key）
    let city = forceCity || `${lat.toFixed(2)}, ${lng.toFixed(2)}`
    let district: string | undefined
    try {
    const geo = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`)
    const gj = await geo.json()
    if (gj.city || gj.locality) {
    city = gj.city || gj.locality
    district = gj.locality && gj.locality !== city ? gj.locality : undefined
    }
    } catch (e) { /* 逆地理失败不影响天气展示 */ }

    geoData.value[user] = {
    temp: Math.round(cw.temperature), code: cw.weathercode,
    city, district, lat, lng,
    wind: Math.round(cw.windspeed),
    high: forecast[0]?.max, low: forecast[0]?.min, forecast
    }
    localStorage.setItem('sync_geo_data', JSON.stringify(geoData.value))
    } catch (e) { console.error(e) }
    }

    // 通用栅格图源构造
    const raster = (tiles: string[], attribution: string, maxzoom = 19): maplibregl.StyleSpecification => ({
    version: 8,
    sources: { src: { type: 'raster', tiles, tileSize: 256, attribution } },
    layers: [{ id: 'raster-layer', type: 'raster', source: 'src', minzoom: 0, maxzoom }]
    })

    // 无 Key 免费图源
    const mapStyles: Record<MapType, string | maplibregl.StyleSpecification> = {
    standard: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    satellite: raster(['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], 'Tiles © Esri', 20)
    }

    // ===== 昼夜晨昏线（跟随真实 UTC 时间） =====
    const enableTerminator = ref(true)
    let terminatorTimer: ReturnType<typeof setInterval> | null = null
    const rad = Math.PI / 180

    const getJulian = (date: Date) => (date.valueOf() / 86400000) + 2440587.5
    const getGMST = (jd: number) => (18.697374558 + 24.06570982441908 * (jd - 2451545.0)) % 24
    const sunEclLng = (jd: number) => {
    const n = jd - 2451545.0
    const L = (280.460 + 0.9856474 * n) % 360
    const g = (357.528 + 0.9856003 * n) % 360
    return L + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad)
    }
    const obliquity = (jd: number) => 23.4393 - 0.0000004 * (jd - 2451545.0)
    const nightPolygon = () => {
    const now = new Date()
    const jd = getJulian(now)
    const gmst = getGMST(jd)
    const lambda = sunEclLng(jd)
    const eps = obliquity(jd)
    const alpha = Math.atan2(Math.cos(eps * rad) * Math.sin(lambda * rad), Math.cos(lambda * rad)) / rad
    const delta = Math.asin(Math.sin(eps * rad) * Math.sin(lambda * rad)) / rad
    const coords: [number, number][] = []
    for (let lng = -180; lng <= 180; lng += 1) {
    const ha = (gmst + lng / 15) * 15 - alpha
    const lat = Math.atan(-Math.cos(ha * rad) / Math.tan(delta * rad)) / rad
    coords.push([lng, lat])
    }
    if (delta < 0) { coords.push([180, 90], [-180, 90]) }
    else { coords.push([180, -90], [-180, -90]) }
    return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} } as any
    }

    const addTerminator = () => {
    if (!mapInstance || !mapInstance.isStyleLoaded() || !enableTerminator.value) return
    const src = mapInstance.getSource('terminator-src') as any
    if (src) { src.setData(nightPolygon()); return }
    mapInstance.addSource('terminator-src', { type: 'geojson', data: nightPolygon() })
    mapInstance.addLayer({ id: 'terminator-fill', type: 'fill', source: 'terminator-src', paint: { 'fill-color': '#070b1f', 'fill-opacity': 0.4 } })
    }
    const removeTerminator = () => {
    if (!mapInstance) return
    if (mapInstance.getLayer('terminator-fill')) mapInstance.removeLayer('terminator-fill')
    if (mapInstance.getSource('terminator-src')) mapInstance.removeSource('terminator-src')
    }
    const toggleTerminator = () => {
    enableTerminator.value = !enableTerminator.value
    enableTerminator.value ? addTerminator() : removeTerminator()
    }

    const createMarkerElement = (label: string, color: string) => {
    const el = document.createElement('div')
    el.className = 'dsync-marker'
    el.innerHTML = `<div class="dsync-pulse" style="background:${color}"></div><div class="dsync-dot" style="background:${color}"></div><div class="dsync-tag" style="color:${color}">${label}</div>`
    return el
    }

    const himPos = (): [number, number] => [geoData.value['him']?.lng || 103.68, geoData.value['him']?.lat || 1.34]
    const herPos = (): [number, number] => [geoData.value['her']?.lng || 102.70, geoData.value['her']?.lat || 25.04]

    // 两地大圆距离（公里）
    const haversineKm = (a: [number, number], b: [number, number]) => {
    const R = 6371
    const dLat = (b[1] - a[1]) * rad, dLng = (b[0] - a[0]) * rad
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(s))
    }
    const distanceKm = computed(() => Math.round(haversineKm(himPos(), herPos())))

    const addLink = () => {
    if (!mapInstance || !mapInstance.isStyleLoaded()) return
    const data = { type: 'Feature', geometry: { type: 'LineString', coordinates: [himPos(), herPos()] }, properties: {} } as any
    const src = mapInstance.getSource('link-src') as any
    if (src) { src.setData(data); return }
    mapInstance.addSource('link-src', { type: 'geojson', data })
    mapInstance.addLayer({ id: 'link-line', type: 'line', source: 'link-src', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#a855f7', 'line-width': 2, 'line-dasharray': [1.5, 1.5], 'line-opacity': 0.85 } })
    }

    const openMap = () => {
    showMap.value = true
    nextTick(() => {
    if (mapInstance) return
    mapInstance = new maplibregl.Map({
    container: 'maplibreContainer',
    style: mapStyles[currentMapType.value],
    center: [103.68, 1.34], zoom: 2, pitch: 0, attributionControl: false
    })

    mapInstance.on('load', () => {
    try { (mapInstance as any).setProjection?.({ type: 'globe' }) } catch (e) {}
    addTerminator(); addLink()
    })
    mapInstance.on('styledata', () => { try { (mapInstance as any).setProjection?.({ type: 'globe' }) } catch (e) {}; if (enableTerminator.value) addTerminator(); addLink() })
    terminatorTimer = setInterval(() => { if (enableTerminator.value) addTerminator() }, 60000)

    new maplibregl.Marker({ element: createMarkerElement('HIS', '#3b82f6') }).setLngLat(himPos()).addTo(mapInstance)
    new maplibregl.Marker({ element: createMarkerElement('HER', '#ec4899') }).setLngLat(herPos()).addTo(mapInstance)

    const h = himPos(), r = herPos()
    mapInstance.flyTo({ center: [(h[0] + r[0]) / 2, (h[1] + r[1]) / 2], zoom: 3.5, speed: 0.8, curve: 1.2 })
    })
    }

    const recenterMap = () => {
    if (!mapInstance) return
    const h = himPos(), r = herPos()
    mapInstance.flyTo({ center: [(h[0] + r[0]) / 2, (h[1] + r[1]) / 2], zoom: 3.5, speed: 1.0, curve: 1.4 })
    }

    const changeMapStyle = (type: MapType) => {
    if (!mapInstance) return
    currentMapType.value = type
    mapInstance.setStyle(mapStyles[type])
    }

    const closeMap = () => {
    showMap.value = false
    if (terminatorTimer) { clearInterval(terminatorTimer); terminatorTimer = null }
    if (mapInstance) { mapInstance.remove(); mapInstance = null }
    }

    onMounted(initGeospatialSync)

    const switchUser = (id: 'her' | 'him') => {
    activeUser.value = id
    weatherUser.value = id
    emit('update:user', id)
    }

    const enterModule = (module: 'study' | 'sport' | 'sleep') => {
    emit('navigate', module)
    }
</script>

<style scoped>
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        border-radius: 1.75rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .weather-hero { min-height: 200px; border-radius: 2rem; }

    .seg-thumb {
        position: absolute; top: 6px; left: 6px;
        width: calc((100% - 12px) / 2); height: calc(100% - 12px);
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 0.75rem;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        transition: transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
        z-index: 0;
    }

    .module-card {
        padding: 1.25rem; display: flex; align-items: center; gap: 1rem; text-align: left;
        position: relative; overflow: hidden;
        border-color: rgba(255, 255, 255, 0.06);
        transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
    }
    .module-card:hover { transform: translateY(-3px); border-color: rgba(var(--c), 0.55); background: rgba(var(--c), 0.08); }
    .module-card:active { transform: scale(0.98); }
    .module-icon {
        width: 3rem; height: 3rem; flex-shrink: 0; border-radius: 1rem;
        display: flex; align-items: center; justify-content: center;
        color: rgb(var(--c)); background: rgba(var(--c), 0.18);
        border: 1px solid rgba(var(--c), 0.3); box-shadow: 0 0 18px rgba(var(--c), 0.18);
        transition: transform 0.25s ease;
    }
    .module-card:hover .module-icon { transform: scale(1.08); }
    .module-arrow { font-size: 1.1rem; font-weight: 900; color: rgba(var(--c), 0.9); opacity: 0; transform: translateX(-6px); transition: all 0.25s ease; }
    .module-card:hover .module-arrow { opacity: 1; transform: translateX(0); }

    .sun-core { position: absolute; right: -10px; bottom: -10px; width: 130px; height: 130px; border-radius: 50%; background: radial-gradient(circle, #fde047 0%, #facc15 55%, rgba(250, 204, 21, 0) 72%); filter: blur(2px); box-shadow: 0 0 60px rgba(250, 204, 21, 0.6); animation: pulse-soft 4s ease-in-out infinite; }
    .sun-rays { position: absolute; right: 5px; bottom: 5px; width: 100px; height: 100px; background: conic-gradient(from 0deg, rgba(255,255,255,0.25), transparent 25%, rgba(255,255,255,0.25) 50%, transparent 75%, rgba(255,255,255,0.25)); border-radius: 50%; mix-blend-mode: overlay; animation: spin 18s linear infinite; }
    @keyframes pulse-soft { 0%,100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.08); opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .cloud { position: absolute; border-radius: 999px; background: rgba(255, 255, 255, 0.85); filter: blur(4px); }
    .cloud-a { width: 110px; height: 40px; right: 10px; bottom: 30px; opacity: 0.7; animation: drift 9s ease-in-out infinite; }
    .cloud-b { width: 70px; height: 28px; right: 80px; bottom: 65px; opacity: 0.5; animation: drift 12s ease-in-out infinite reverse; }
    @keyframes drift { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-16px); } }

    .rain-drop { position: absolute; top: -10px; width: 2px; height: 14px; border-radius: 2px; background: linear-gradient(transparent, rgba(186, 230, 253, 0.85)); animation: fall linear infinite; }
    @keyframes fall { to { transform: translateY(230px); opacity: 0; } }

    .lightning { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.6); opacity: 0; animation: flash 6s steps(1) infinite; }
    @keyframes flash { 0%,92%,100% { opacity: 0; } 93%,95% { opacity: 0.55; } 94% { opacity: 0; } }

    .snow-flake { position: absolute; top: -10px; width: 6px; height: 6px; border-radius: 50%; background: rgba(255, 255, 255, 0.9); animation: snow-fall linear infinite; }
    @keyframes snow-fall { to { transform: translateY(230px) translateX(14px); opacity: 0.2; } }

    .no-bar::-webkit-scrollbar { display: none; }
    .no-bar { -ms-overflow-style: none; scrollbar-width: none; }

    .fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }

    :deep(.maplibregl-ctrl-bottom-left), :deep(.maplibregl-ctrl-bottom-right) { display: none !important; }
</style>

<style>
    .dsync-marker { position: relative; width: 0; height: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .dsync-pulse { position: absolute; width: 30px; height: 30px; border-radius: 50%; opacity: 0.35; animation: dsync-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
    .dsync-dot { position: relative; width: 15px; height: 15px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); z-index: 2; transition: transform 0.2s ease; }
    .dsync-marker:hover .dsync-dot { transform: scale(1.2); }
    .dsync-tag { position: absolute; top: 16px; font-size: 10px; font-weight: 900; letter-spacing: 0.05em; background: rgba(255, 255, 255, 0.92); padding: 1px 7px; border-radius: 999px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25); white-space: nowrap; }
    @keyframes dsync-ping { 0% { transform: scale(0.6); opacity: 0.5; } 80%, 100% { transform: scale(2.4); opacity: 0; } }
</style>
