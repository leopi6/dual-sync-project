<template>
    <div ref="appBgRef"
         class="min-h-screen w-full transition-all duration-700 ease-in-out pb-20 relative overflow-hidden flex flex-col"
         :style="[{ backgroundColor: currentTheme.bgColor }, customBgStyle]">

        <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none opacity-30"></canvas>
        <div v-if="customBgUrl" class="absolute inset-0 bg-cover bg-center -z-10 blur-[80px] scale-110 opacity-60" :style="customBgStyle"></div>

        <header class="pt-10 pb-4 px-6 relative z-50 flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
            <button @click="dashboardRef?.goHome()"
                    class="w-12 h-12 glass-card flex items-center justify-center border-white/5 hover:bg-white/10 active:scale-90 transition-all rounded-2xl group"
                    title="主盘">
                <svg class="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            </button>

            <div class="relative w-64 h-12 bg-black/20 rounded-2xl p-1 backdrop-blur-xl border border-white/10 flex shadow-inner">
                <div ref="pillRef" class="absolute top-1 bottom-1 w-[calc(33.33%-0.25rem)] rounded-xl z-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)" :style="pillStyle"></div>
                <button v-for="mode in modes"
                        :key="mode.id"
                        @click="switchMode(mode.id)"
                        class="flex-1 relative z-10 text-xs font-black tracking-tighter transition-all flex items-center justify-center uppercase hover:scale-105 active:scale-95"
                        :style="{ color: currentMode === mode.id ? '#ffffff' : 'rgba(255,255,255,0.3)' }">
                    {{ mode.label }}
                </button>
            </div>

            <button @click="showSettingsModal = true"
                    class="w-12 h-12 glass-card flex items-center justify-center border-white/5 hover:bg-white/10 active:scale-90 transition-all rounded-2xl group">
                <svg class="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </button>
        </header>

        <main class="px-4 relative z-10 flex-1 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar pt-2">
            <Transition name="slide-fade" mode="out-in">
                <LearningDashboard v-if="currentMode !== 'bond'"
                                   ref="dashboardRef"
                                   :userId="currentMode"
                                   :key="currentMode" />

                <AnalysisDashboard v-else
                                   :initialUserId="'him'" />
            </Transition>
        </main>

        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showSettingsModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div class="glass-card w-full max-w-md p-6 relative border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.8)]" style="color: var(--text-color, #ffffff);">
                        <button @click="showSettingsModal = false" class="absolute top-4 right-4 opacity-40 hover:opacity-100 p-2"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        <h3 class="text-xl font-black mb-8 tracking-widest uppercase">个性化配置</h3>

                        <div class="space-y-8">
                            <div>
                                <label class="block text-[10px] opacity-40 mb-4 uppercase tracking-[0.2em] font-bold">主题色彩方案</label>
                                <div class="grid grid-cols-5 gap-3">
                                    <button v-for="theme in themes" :key="theme.name"
                                            @click="applyTheme(theme)"
                                            class="h-10 rounded-xl transition-all border-2 flex items-center justify-center active:scale-90"
                                            :style="{ backgroundColor: theme.color, borderColor: currentTheme.name === theme.name ? 'white' : 'transparent', boxShadow: currentTheme.name === theme.name ? `0 0 15px ${theme.color}` : 'none' }"></button>
                                </div>
                                <div class="mt-6 flex flex-col gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div v-for="item in [{l:'组件强调',v:'color'},{l:'背景色底',v:'bgColor'},{l:'全局文字',v:'textColor'}]" :key="item.v" class="flex items-center justify-between">
                                        <label class="text-xs opacity-60">{{ item.l }}</label>
                                        <input type="color" v-model="currentTheme[item.v]" @input="updateCustomTheme" class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0">
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label class="block text-[10px] opacity-40 mb-4 uppercase tracking-[0.2em] font-bold">深空背景影像</label>
                                <div class="flex flex-col gap-3">
                                    <div class="aspect-video glass-card border-dashed border-white/10 rounded-2xl flex items-center justify-center bg-black/40 overflow-hidden relative group">
                                        <img v-if="customBgUrl" :src="customBgUrl" class="absolute inset-0 w-full h-full object-cover">
                                        <div v-else class="text-white/20 text-[10px] text-center px-8 uppercase leading-relaxed">上传高分辨率图像<br>将获得更深邃的模糊质感</div>
                                    </div>
                                    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleBackgroundUpload">
                                    <button @click="fileInputRef?.click()" class="w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 active:scale-95" style="background-color: var(--accent-theme); color: #fff;">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> 载入新背景
                                    </button>
                                    <button v-if="customBgUrl" @click="clearCustomBackground" class="w-full py-2 text-[10px] font-bold uppercase opacity-40 hover:opacity-100 transition-opacity">重置为原始黑蓝</button>
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
    import { ref, computed, watch, onMounted } from 'vue'
    import gsap from 'gsap'
    import LearningDashboard from './components/LearningDashboard.vue'
    import AnalysisDashboard from './components/AnalysisDashboard.vue'

    const dashboardRef = ref<InstanceType<typeof LearningDashboard> | null>(null)

    // 核心模式定义
    type Mode = 'him' | 'bond' | 'her'
    const currentMode = ref<Mode>('him')
    const pillRef = ref<HTMLElement | null>(null)

    const modes: { id: Mode, label: string }[] = [
    { id: 'him', label: 'Him' },
    { id: 'bond', label: '分析' }, // 修改为“分析”
    { id: 'her', label: 'Her' }
    ]

    // --- 主题引擎增强 ---
    const themes = [
    { name: '极光蓝', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', bgColor: '#060818', textColor: '#ffffff' },
    { name: '樱花粉', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)', bgColor: '#1a0a2e', textColor: '#ffffff' },
    { name: '黑金', color: '#eab308', glow: 'rgba(234, 179, 8, 0.5)', bgColor: '#121212', textColor: '#fef08a' },
    { name: '苍翠', color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', bgColor: '#052c22', textColor: '#ffffff' },
    { name: '白昼', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.3)', bgColor: '#f8fafc', textColor: '#1e293b' }
    ]
    const currentTheme = ref({...themes[0]})

    const applyTheme = (theme: any) => {
    currentTheme.value = { ...theme }
    updateGlobalVars()
    }

    const updateCustomTheme = () => {
    currentTheme.value.name = '自定义'
    currentTheme.value.glow = currentTheme.value.color + '80'
    updateGlobalVars()
    }

    const updateGlobalVars = () => {
    const root = document.documentElement
    root.style.setProperty('--accent-theme', currentTheme.value.color)
    root.style.setProperty('--accent-glow', currentTheme.value.glow)
    root.style.setProperty('--text-color', currentTheme.value.textColor)
    root.style.setProperty('--bg-base', currentTheme.value.bgColor)
    }

    onMounted(() => {
    applyTheme(currentTheme.value)
    })

    // --- 背景逻辑 ---
    const customBgUrl = ref<string | null>(localStorage.getItem('sync_custom_bg'))
    const showSettingsModal = ref(false)
    const fileInputRef = ref<HTMLInputElement | null>(null)
    const customBgStyle = computed(() => customBgUrl.value ? { backgroundImage: `url(${customBgUrl.value})` } : {})

    const handleBackgroundUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file && file.size < 5 * 1024 * 1024) {
    const reader = new FileReader()
    reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    customBgUrl.value = dataUrl
    localStorage.setItem('sync_custom_bg', dataUrl)
    showSettingsModal.value = false
    }
    reader.readAsDataURL(file)
    }
    }

    const clearCustomBackground = () => { customBgUrl.value = null; localStorage.removeItem('sync_custom_bg') }

    // --- 导航滑块逻辑 ---
    const pillStyle = computed(() => {
    const index = modes.findIndex(m => m.id === currentMode.value)
    return {
    transform: `translateX(${index * 100}%)`,
    backgroundColor: 'var(--accent-theme)',
    boxShadow: `0 0 20px var(--accent-glow)`
    }
    })

    const switchMode = (mode: Mode) => {
    if (currentMode.value === mode) return
    currentMode.value = mode
    // 触觉反馈 (如果手机支持)
    if ('vibrate' in navigator) navigator.vibrate(10)
    }

    // 监听模式变化进行背景全局过渡
    watch(currentMode, (newVal) => {
    // 分析模式时背景稍微调暗一点
    const brightness = newVal === 'bond' ? 0.8 : 1
    gsap.to(document.body, {
    filter: `brightness(${brightness})`,
    duration: 0.8
    })
    })
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
        transform: translateY(20px);
    }

    .slide-fade-leave-to {
        opacity: 0;
        transform: translateY(-20px);
    }

    .fade-scale-enter-active, .fade-scale-leave-active {
        transition: all 0.3s ease;
    }

    .fade-scale-enter-from, .fade-scale-leave-to {
        opacity: 0;
        transform: scale(0.95);
        filter: blur(10px);
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
    /* 移动端隐藏滚动条 */
</style>