<template>
    <div ref="appBgRef"
         class="min-h-screen w-full transition-all duration-700 ease-in-out pb-24 relative overflow-hidden"
         :style="[{ backgroundColor: currentTheme.bgColor }, customBgStyle]">

        <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none opacity-30"></canvas>
        <div v-if="customBgUrl" class="absolute inset-0 bg-cover bg-center -z-10 blur-[80px] scale-110 opacity-60" :style="customBgStyle"></div>

        <header class="pt-12 pb-6 px-6 relative z-10 flex items-center justify-between gap-4 max-w-7xl mx-auto">
            <button @click="dashboardRef?.goHome" class="w-12 h-12 glass-card flex items-center justify-center border-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-2xl flex-shrink-0" style="color: var(--text-color, #ffffff);">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            </button>

            <div class="relative w-full max-w-[280px] h-12 bg-black/20 rounded-2xl p-1 backdrop-blur-xl border border-white/10 flex shadow-inner">
                <div ref="pillRef" class="absolute top-1 bottom-1 w-[calc(33.33%-0.25rem)] rounded-xl z-0 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)" :style="pillStyle"></div>
                <button v-for="mode in modes"
                        :key="mode.id"
                        @click="switchMode(mode.id)"
                        class="flex-1 relative z-10 text-[11px] font-black tracking-widest transition-colors flex items-center justify-center uppercase active:scale-95"
                        :style="{ color: currentMode === mode.id ? '#ffffff' : 'rgba(255,255,255,0.4)' }">
                    {{ mode.label }}
                </button>
            </div>

            <button @click="showSettingsModal = true" class="w-12 h-12 glass-card flex items-center justify-center border-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-2xl flex-shrink-0" style="color: var(--text-color, #ffffff);">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </button>
        </header>

        <main class="px-4 relative z-10 flex-1 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar">
            <Transition name="slide-fade" mode="out-in">
                <LearningDashboard ref="dashboardRef"
                                   v-if="currentMode !== 'bond'"
                                   :userId="currentMode"
                                   :key="'dash-'+currentMode" />

                <AnalysisDashboard v-else
                                   :initialUserId="'her'"
                                   :key="'ana-'+currentMode" />
            </Transition>
        </main>

        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showSettingsModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div class="glass-card w-full max-w-md p-6 relative border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.8)]" style="color: var(--text-color, #ffffff);">
                        <button @click="showSettingsModal = false" class="absolute top-4 right-4 opacity-50 hover:opacity-100 p-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        <h3 class="text-xl font-black mb-8 tracking-wider">个性化系统配置</h3>

                        <div class="space-y-6">
                            <div>
                                <label class="block text-[10px] opacity-50 mb-3 uppercase tracking-widest font-bold">权威色彩美学预设</label>
                                <div class="grid grid-cols-5 gap-2">
                                    <button v-for="theme in themes" :key="theme.name"
                                            @click="applyTheme(theme)"
                                            class="h-10 rounded-xl transition-all border-2 flex items-center justify-center active:scale-90"
                                            :style="{ backgroundColor: theme.color, borderColor: currentTheme.name === theme.name ? 'white' : 'transparent', boxShadow: currentTheme.name === theme.name ? `0 0 15px ${theme.color}` : 'none' }"></button>
                                </div>
                                <div class="mt-4 flex flex-col gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div class="flex items-center justify-between">
                                        <label class="text-xs opacity-60">强调色 (组件)：</label>
                                        <input type="color" v-model="(currentTheme as any).color" @input="updateCustomTheme" class="w-8 h-8 rounded cursor-pointer bg-transparent border-0">
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <label class="text-xs opacity-60">背景色 (纯色底)：</label>
                                        <input type="color" v-model="(currentTheme as any).bgColor" @input="updateCustomTheme" class="w-8 h-8 rounded cursor-pointer bg-transparent border-0">
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <label class="text-xs opacity-60">全局文字颜色：</label>
                                        <input type="color" v-model="(currentTheme as any).textColor" @input="updateCustomTheme" class="w-8 h-8 rounded cursor-pointer bg-transparent border-0">
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label class="block text-[10px] opacity-50 mb-3 uppercase tracking-widest font-bold">深空背景影像</label>
                                <div class="flex flex-col gap-3">
                                    <div class="aspect-[16/9] glass-card border-dashed border-white/20 rounded-2xl flex items-center justify-center bg-black/30 overflow-hidden relative group">
                                        <img v-if="customBgUrl" :src="customBgUrl" class="absolute inset-0 w-full h-full object-cover blur-sm transition-all">
                                        <span v-if="!customBgUrl" class="opacity-30 text-xs px-4 text-center">高清图能产生高级模糊感</span>
                                    </div>
                                    <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleBackgroundUpload">
                                    <button @click="fileInputRef?.click()" class="w-full py-4 rounded-xl font-black tracking-widest text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg" style="background-color: var(--accent-theme); color: #fff;">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> 载入新背景
                                    </button>
                                    <button v-if="customBgUrl" @click="clearCustomBackground" class="w-full py-2 text-xs rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all font-bold">清除上传，还原纯色底</button>
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
    import { ref, computed, onMounted } from 'vue'
    import LearningDashboard from './components/LearningDashboard.vue'
    import AnalysisDashboard from './components/AnalysisDashboard.vue'

    const dashboardRef = ref<InstanceType<typeof LearningDashboard> | null>(null)

    type Mode = 'her' | 'bond' | 'him'
    const currentMode = ref<Mode>('her')
    // @ts-ignore
    const pillRef = ref<HTMLElement | null>(null)

    const modes: { id: Mode, label: string }[] = [
    { id: 'her', label: 'Her' },
    { id: 'bond', label: '分析' },
    { id: 'him', label: 'His' }
    ]

    const themes = [
    { name: '极光蓝', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', bgColor: '#060818', textColor: '#ffffff' },
    { name: '樱花粉', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)', bgColor: '#1a0a2e', textColor: '#ffffff' },
    { name: '暗金骨', color: '#eab308', glow: 'rgba(234, 179, 8, 0.5)', bgColor: '#18181b', textColor: '#fef08a' },
    { name: '苍翠森', color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', bgColor: '#052c22', textColor: '#ffffff' },
    { name: '白昼版', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.3)', bgColor: '#f8fafc', textColor: '#1e293b' }
    ]
    const currentTheme = ref({...themes[0]})

    const applyTheme = (theme: typeof themes[0]) => {
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

    onMounted(() => { applyTheme(currentTheme.value) })

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

    const pillStyle = computed(() => {
    const index = modes.findIndex(m => m.id === currentMode.value)
    return {
    transform: `translateX(${index * 100}%)`,
    backgroundColor: 'var(--accent-theme)',
    boxShadow: `0 0 25px var(--accent-glow)`
    }
    })

    const switchMode = (mode: Mode) => { currentMode.value = mode }
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
</style>