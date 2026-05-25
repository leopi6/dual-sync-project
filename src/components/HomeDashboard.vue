<template>
    <div class="flex flex-col gap-6 h-full w-full text-white select-none pb-8" :style="`--accent-theme: ${currentThemeColor}; --accent-glow: ${currentThemeGlow};`">

        <div class="glass-card p-6 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-[var(--accent-theme)] rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>

            <h2 class="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-4 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                全域数据雷达
            </h2>

            <div class="flex items-end justify-between">
                <div>
                    <div class="text-4xl font-mono font-black tracking-tighter drop-shadow-[0_0_15px_var(--accent-glow)]">
                        {{ activeUser === 'bond' ? 'DUAL' : (activeUser === 'her' ? 'HER' : 'HIS') }}
                        <span class="text-lg opacity-50 ml-1">SYNC</span>
                    </div>
                    <div class="text-[10px] mt-2 opacity-60">最近一次同步: 刚刚</div>
                </div>

                <div class="relative w-16 h-16 flex items-center justify-center rounded-full border border-white/10 bg-black/40 shadow-inner">
                    <div class="absolute inset-0 rounded-full border-[2px] border-[var(--accent-theme)] border-t-transparent animate-spin" style="animation-duration: 3s;"></div>
                    <span class="text-xs font-black">ACT</span>
                </div>
            </div>
        </div>

        <div class="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
            <button v-for="u in users" :key="u.id"
                    @click="switchUser(u.id)"
                    class="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    :class="activeUser === u.id ? 'bg-white/15 text-white shadow-md border border-white/10' : 'text-white/40 hover:text-white/70 border border-transparent'">
                <span class="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" :style="{ backgroundColor: activeUser === u.id ? 'var(--accent-theme)' : 'transparent' }"></span>
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
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'

    const props = defineProps<{
    initialUser: 'her' | 'bond' | 'him'
    }>()

    const emit = defineEmits<{
    (e: 'update:user', userId: 'her' | 'bond' | 'him'): void
    (e: 'navigate', view: 'study' | 'sport' | 'sleep' | 'analysis'): void
    }>()

    const currentThemeColor = computed(() => getComputedStyle(document.documentElement).getPropertyValue('--accent-theme').trim() || '#3b82f6')
    const currentThemeGlow = computed(() => getComputedStyle(document.documentElement).getPropertyValue('--accent-glow').trim() || 'rgba(59, 130, 246, 0.5)')

    const activeUser = ref(props.initialUser)

    const users = [
    { id: 'her', label: 'HER DATA' },
    { id: 'bond', label: 'DUAL SYNC' },
    { id: 'him', label: 'HIS DATA' }
    ] as const

    const switchUser = (id: 'her' | 'bond' | 'him') => {
    activeUser.value = id
    emit('update:user', id)
    }

    const enterModule = (module: 'study' | 'sport' | 'sleep') => {
    if (activeUser.value === 'bond') {
    // 如果在“对比”模式下点击，强制进入深度分析视图
    emit('navigate', 'analysis')
    } else {
    // 否则进入具体打卡视图
    emit('navigate', module)
    }
    }
</script>

<style scoped>
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
    }
</style>