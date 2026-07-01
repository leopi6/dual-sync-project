<template>
    <LoginView v-if="!isLoggedIn" @auth-success="onAuthSuccess" />

    <div v-else ref="appBgRef" class="h-[100dvh] flex flex-col w-full transition-all duration-700 ease-in-out relative overflow-hidden" :style="[{ backgroundColor: currentTheme.bgColor }]">

        <div v-if="customBgUrl" class="absolute inset-0 -z-10 transition-all duration-300"
             :style="{ backgroundImage: `url(${customBgUrl})`, backgroundSize: bgConfig.mode, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: `blur(${bgConfig.blur}px)`, opacity: bgConfig.opacity / 100, transform: bgConfig.blur > 10 ? 'scale(1.15)' : 'scale(1)' }">
        </div>
        <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none opacity-30 -z-0"></canvas>

        <header class="pb-5 px-6 relative z-10 flex items-center justify-between gap-4 w-full max-w-7xl mx-auto flex-shrink-0" style="padding-top: max(2.75rem, env(safe-area-inset-top));">
            <button @click="navigate('home')" class="w-12 h-12 glass-card flex items-center justify-center border-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-2xl flex-shrink-0" style="color: var(--text-color, #ffffff);" :class="currentView === 'home' ? 'opacity-0 pointer-events-none' : 'opacity-100'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            <div class="flex-1 text-center font-black tracking-widest uppercase text-sm transition-all duration-300" style="color: var(--text-color, #ffffff);">
                {{ viewTitleMap[currentView] }}
            </div>


            <div class="flex items-center gap-2">
                <button @click="logout" class="w-12 h-12 glass-card flex items-center justify-center border-white/5 hover:bg-red-500/20 active:scale-95 transition-all rounded-2xl flex-shrink-0 text-white/50 hover:text-red-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
                <button @click="showSettingsModal = true" class="w-12 h-12 glass-card flex items-center justify-center border-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-2xl flex-shrink-0" style="color: var(--text-color, #ffffff);">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </button>
            </div>
        </header>

        <main class="px-4 relative z-10 flex-1 min-h-0 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar">
            <Transition name="slide-fade" mode="out-in">
                <HomeDashboard v-if="currentView === 'home'" :initialUser="currentUser" @update:user="(u) => currentUser = u" @navigate="navigate" />
                <LearningDashboard v-else-if="currentView === 'study'" :userId="currentUser === 'bond' ? 'her' : currentUser" :key="'study-'+currentUser" />
                <LearningDashboard v-else-if="currentView === 'sport'" :userId="currentUser === 'bond' ? 'her' : currentUser" storage-key="sync_sport" check-in-title="运动量打卡" root-title-placeholder="请填写训练总目标" :key="'sport-'+currentUser" />
                <SleepDashboard v-else-if="currentView === 'sleep'" :userId="currentUser === 'bond' ? 'her' : currentUser" :key="'sleep-'+currentUser" />
                <AnalysisDashboard v-else-if="currentView === 'analysis'" :initialUserId="currentUser === 'bond' ? 'her' : currentUser" :key="'ana-'+currentUser" />
            </Transition>
        </main>

        <!-- 底部 Tab 导航（移动端主导航，适配全面屏底部安全区） -->
        <nav class="relative z-20 flex items-stretch justify-around bg-black/40 backdrop-blur-xl border-t border-white/10 px-2 pt-2 flex-shrink-0" style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom));">
            <button v-for="t in tabs" :key="t.view" @click="navigate(t.view)" class="flex-1 flex flex-col items-center gap-1 py-1 rounded-xl active:scale-90 transition-all" :style="{ color: currentView === t.view ? 'var(--accent-theme)' : 'rgba(255,255,255,0.42)' }">
                <svg v-if="t.view === 'home'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"></path></svg>
                <svg v-else-if="t.view === 'study'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                <svg v-else-if="t.view === 'sport'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <svg v-else-if="t.view === 'sleep'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <span class="text-[9px] font-bold tracking-wide">{{ t.label }}</span>
            </button>
        </nav>

        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showSettingsModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div class="glass-card w-full max-w-md p-6 relative border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto custom-scrollbar" style="color: var(--text-color, #ffffff);">
                        <button @click="showSettingsModal = false" class="absolute top-4 right-4 opacity-50 hover:opacity-100 p-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        <h3 class="text-xl font-black mb-8 tracking-wider">个性化系统配置</h3>

                        <div class="space-y-6">
                            <div>
                                <label class="block text-[10px] opacity-50 mb-3 uppercase tracking-widest font-bold">权威色彩美学预设</label>
                                <div class="grid grid-cols-5 gap-2">
                                    <button v-for="theme in themes" :key="theme.name" @click="applyTheme(theme)" class="h-10 rounded-xl transition-all border-2 flex items-center justify-center active:scale-90" :style="{ backgroundColor: theme.color, borderColor: currentTheme.name === theme.name ? 'white' : 'transparent', boxShadow: currentTheme.name === theme.name ? `0 0 15px ${theme.color}` : 'none' }"></button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] opacity-50 mb-3 uppercase tracking-widest font-bold">深空背景影像</label>
                                <div class="flex flex-col gap-3">
                                    <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleBackgroundUpload">
                                    <button v-if="!customBgUrl" @click="fileInputRef?.click()" class="w-full py-4 rounded-xl font-black tracking-widest text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg" style="background-color: var(--accent-theme); color: #fff;">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> 载入新背景
                                    </button>
                                    <div v-if="customBgUrl" class="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-4">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-xs font-bold text-white/80">🎨 背景精调编辑器</span>
                                            <button @click="fileInputRef?.click()" class="text-[10px] text-blue-400 font-bold px-2 py-1 rounded bg-blue-500/20 active:scale-90">更换</button>
                                        </div>
                                        <div class="space-y-1">
                                            <div class="flex justify-between text-[10px] text-white/50"><label>模糊度</label><span>{{ bgConfig.blur }}px</span></div>
                                            <input type="range" v-model.number="bgConfig.blur" @input="saveBgConfig" min="0" max="100" class="w-full accent-blue-500">
                                        </div>
                                        <button @click="clearCustomBackground" class="w-full mt-2 py-2.5 text-xs rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/30 active:scale-95 transition-all font-bold border border-red-500/20">卸载当前背景</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
    import LoginView from './components/LoginView.vue'
    import HomeDashboard from './components/HomeDashboard.vue'
    import LearningDashboard from './components/LearningDashboard.vue'
    import SleepDashboard from './components/SleepDashboard.vue'
    import AnalysisDashboard from './components/AnalysisDashboard.vue'

    type ViewMode = 'home' | 'study' | 'sport' | 'sleep' | 'analysis'
    type UserMode = 'her' | 'bond' | 'him'

    const isLoggedIn = ref(false)
    const currentView = ref<ViewMode>('home')
    const currentUser = ref<UserMode>('her')

    const viewTitleMap: Record<ViewMode, string> = { home: '中心控制台', study: '学业演进系统', sport: '运动打卡系统', sleep: '早睡早起系统', analysis: '核心数据分析' }

    const tabs = [
    { view: 'home', label: '首页' },
    { view: 'study', label: '学业' },
    { view: 'sport', label: '运动' },
    { view: 'sleep', label: '睡眠' },
    { view: 'analysis', label: '分析' }
    ] as const

    const navigate = (view: ViewMode) => { currentView.value = view }

    const onAuthSuccess = (userId: UserMode) => {
    currentUser.value = userId
    isLoggedIn.value = true
    }

    // 核心功能：安全注销并退回登录界面
    const logout = () => {
    localStorage.removeItem('sync_current_user')
    isLoggedIn.value = false
    currentView.value = 'home'
    }

    const themes = [
    { name: '极光蓝', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', bgColor: '#060818', textColor: '#ffffff' },
    { name: '樱花粉', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)', bgColor: '#1a0a2e', textColor: '#ffffff' },
    { name: '暗金骨', color: '#eab308', glow: 'rgba(234, 179, 8, 0.5)', bgColor: '#18181b', textColor: '#fef08a' },
    { name: '苍翠森', color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', bgColor: '#052c22', textColor: '#ffffff' },
    { name: '白昼版', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.3)', bgColor: '#f8fafc', textColor: '#1e293b' }
    ]
    const currentTheme = ref({...themes[0]})

    const applyTheme = (theme: typeof themes[0]) => { currentTheme.value = { ...theme }; updateGlobalVars(); localStorage.setItem('sync_theme', theme.name) }
    const updateGlobalVars = () => {
    const root = document.documentElement
    root.style.setProperty('--accent-theme', currentTheme.value.color)
    root.style.setProperty('--accent-glow', currentTheme.value.glow)
    root.style.setProperty('--text-color', currentTheme.value.textColor)
    root.style.setProperty('--bg-base', currentTheme.value.bgColor)
    }

    // ===== 深空星空背景（修复原本空置的 canvas，移动端友好、可暂停） =====
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    const appBgRef = ref<HTMLElement | null>(null)
    let rafId = 0
    let cleanupStar: (() => void) | null = null

    const initStarfield = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let stars: { x: number, y: number, r: number, a: number, tw: number }[] = []

    const resize = () => {
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    const count = Math.min(70, Math.floor(window.innerWidth / 8))
    stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    r: (Math.random() * 1.2 + 0.3) * dpr, a: Math.random() * Math.PI * 2, tw: Math.random() * 0.02 + 0.004
    }))
    }
    resize()

    const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const s of stars) {
    s.a += s.tw
    const alpha = 0.25 + Math.abs(Math.sin(s.a)) * 0.6
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${alpha})`
    ctx.fill()
    }
    if (!reduce) rafId = requestAnimationFrame(draw)
    }
    draw()

    const onVisibility = () => {
    if (document.hidden) { cancelAnimationFrame(rafId) }
    else if (!reduce) { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(draw) }
    }
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    cleanupStar = () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', onVisibility)
    }
    }

    onMounted(() => {
    const savedUser = localStorage.getItem('sync_current_user')
    if (savedUser) {
    currentUser.value = savedUser as UserMode
    isLoggedIn.value = true
    }
    const savedTheme = localStorage.getItem('sync_theme')
    const matched = themes.find(t => t.name === savedTheme)
    applyTheme(matched || currentTheme.value)
    if (isLoggedIn.value) nextTick(initStarfield)
    })

    watch(isLoggedIn, (v) => {
    if (v) nextTick(initStarfield)
    else { cleanupStar?.(); cleanupStar = null }
    })
    onUnmounted(() => cleanupStar?.())

    const customBgUrl = ref<string | null>(localStorage.getItem('sync_custom_bg'))
    const defaultBgConfig = { blur: 60, opacity: 50, mode: 'cover' }
    const bgConfig = ref(JSON.parse(localStorage.getItem('sync_bg_config') || JSON.stringify(defaultBgConfig)))
    const saveBgConfig = () => { localStorage.setItem('sync_bg_config', JSON.stringify(bgConfig.value)) }

    const showSettingsModal = ref(false)
    const fileInputRef = ref<HTMLInputElement | null>(null)

    const handleBackgroundUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
    // 压缩到最长边 1600px，再转 JPEG，避免大图把 localStorage 撑爆
    const maxDim = 1600
    let w = img.width, h = img.height
    if (w > maxDim || h > maxDim) {
    const scale = maxDim / Math.max(w, h)
    w = Math.round(w * scale); h = Math.round(h * scale)
    }
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
    try {
    localStorage.setItem('sync_custom_bg', dataUrl)
    customBgUrl.value = dataUrl
    bgConfig.value = { ...defaultBgConfig }
    saveBgConfig()
    } catch (err) {
    alert('这张图片压缩后仍然过大，浏览器本地存储放不下，请换一张更小的图片。')
    }
    }
    img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
    }

    const clearCustomBackground = () => {
    customBgUrl.value = null; localStorage.removeItem('sync_custom_bg'); localStorage.removeItem('sync_bg_config')
    }
</script>

<style scoped>
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .slide-fade-enter-active {
        transition: all 0.4s ease-out;
    }

    .slide-fade-leave-active {
        transition: all 0.3s ease-in;
    }

    .slide-fade-enter-from {
        opacity: 0;
        transform: translateY(15px);
    }

    .slide-fade-leave-to {
        opacity: 0;
        transform: translateY(-15px);
    }

    .fade-scale-enter-active, .fade-scale-leave-active {
        transition: all 0.3s ease;
    }

    .fade-scale-enter-from, .fade-scale-leave-to {
        opacity: 0;
        transform: scale(0.95);
        filter: blur(20px);
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    input[type=range] {
        -webkit-appearance: none;
        background: rgba(255,255,255,0.1);
        height: 6px;
        border-radius: 4px;
        outline: none;
    }

        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #fff;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
</style>