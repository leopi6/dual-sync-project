<template>
    <div class="flex flex-col gap-4 pb-10 text-white select-none w-full" :style="`--accent-theme: ${currentThemeColor};`">

        <!-- 顶部：标题 + 连续天数 -->
        <div class="glass-card p-5 flex items-center justify-between border-white/10">
            <div class="flex items-center gap-3">
                <span class="w-1.5 h-8 rounded-full" style="background-color: var(--accent-theme); box-shadow: 0 0 14px var(--accent-theme);"></span>
                <div>
                    <h2 class="text-xl font-black tracking-wider">睡眠节律</h2>
                    <p class="text-[10px] opacity-50 uppercase tracking-widest mt-0.5">记录入睡与起床，养成早睡早起</p>
                </div>
            </div>
            <div class="flex flex-col items-center px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10">
                <span class="text-2xl font-black font-mono leading-none">{{ streak }}</span>
                <span class="text-[9px] opacity-50 mt-1 tracking-widest">连续天</span>
            </div>
        </div>

        <!-- 统计三宫格 -->
        <div class="grid grid-cols-3 gap-3">
            <div class="glass-card p-4 flex flex-col items-center gap-1 border-white/5">
                <span class="text-[9px] opacity-50 tracking-widest uppercase">平均时长</span>
                <span class="text-base font-black font-mono">{{ avgDuration }}</span>
            </div>
            <div class="glass-card p-4 flex flex-col items-center gap-1 border-white/5">
                <span class="text-[9px] opacity-50 tracking-widest uppercase">平均入睡</span>
                <span class="text-base font-black font-mono">{{ avgBedtime }}</span>
            </div>
            <div class="glass-card p-4 flex flex-col items-center gap-1 border-white/5">
                <span class="text-[9px] opacity-50 tracking-widest uppercase">平均起床</span>
                <span class="text-base font-black font-mono">{{ avgWake }}</span>
            </div>
        </div>

        <!-- 近 7 晚柱状图 -->
        <div class="glass-card p-5 border-white/10">
            <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-bold opacity-70 tracking-widest uppercase">近 7 晚睡眠时长</span>
                <span class="text-[9px] opacity-40 font-mono">目标 8h</span>
            </div>
            <div class="flex items-end justify-between gap-2 h-32">
                <div v-for="bar in weekBars" :key="bar.date" class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span class="text-[9px] font-mono opacity-60">{{ bar.hours > 0 ? bar.hours.toFixed(1) : '' }}</span>
                    <div class="w-full rounded-lg transition-all duration-500 relative" :class="bar.color"
                         :style="{ height: `${Math.max(bar.hours / 12 * 100, bar.hours > 0 ? 6 : 2)}%`, opacity: bar.hours > 0 ? 1 : 0.18 }">
                    </div>
                    <span class="text-[9px] opacity-50 font-bold" :class="bar.isToday ? 'text-[var(--accent-theme)]' : ''">{{ bar.label }}</span>
                </div>
            </div>
        </div>

        <!-- 记录今晚 -->
        <button @click="openEditor()" class="py-4 w-full rounded-2xl font-black tracking-widest text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg" style="background-color: var(--accent-theme); color: #fff;">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            记录一晚睡眠
        </button>

        <!-- 历史列表 -->
        <div class="flex flex-col gap-2.5">
            <div v-if="sortedRecords.length === 0" class="text-center py-10 opacity-30 text-xs tracking-widest uppercase">
                还没有记录，从今晚开始吧
            </div>
            <div v-for="rec in sortedRecords" :key="rec.id"
                 class="glass-card p-4 flex items-center gap-3 border-white/5 active:bg-white/10 transition-colors cursor-pointer"
                 @click="openEditor(rec)">
                <div class="flex flex-col items-center justify-center w-12 flex-shrink-0">
                    <span class="text-[9px] opacity-40 font-bold">{{ monthOf(rec.date) }}月</span>
                    <span class="text-xl font-black font-mono leading-none">{{ dayOf(rec.date) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 text-sm font-mono font-bold">
                        <span>{{ rec.bedtime }}</span>
                        <svg class="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        <span>{{ rec.wakeTime }}</span>
                    </div>
                    <div v-if="rec.note" class="text-[10px] opacity-40 truncate mt-1">📝 {{ rec.note }}</div>
                </div>
                <div class="flex flex-col items-end gap-1 flex-shrink-0">
                    <span class="text-sm font-black font-mono" :class="durColor(durationMin(rec))">{{ fmtDur(durationMin(rec)) }}</span>
                    <button @click.stop="deleteRecord(rec.id)" class="text-[10px] text-red-400/70 hover:text-red-400 active:scale-90 transition-all">删除</button>
                </div>
            </div>
        </div>

        <!-- 编辑/新增弹窗 -->
        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showModal" class="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md" @click.self="showModal = false">
                    <div class="glass-card w-full max-w-md p-6 relative border-white/20 shadow-2xl" style="color: var(--text-color, #ffffff);">
                        <h3 class="text-lg font-black mb-5 tracking-wider">{{ editingId ? '修改睡眠记录' : '记录一晚睡眠' }}</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs opacity-50 mb-1">日期（哪一晚）</label>
                                <input v-model="form.date" type="date" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none [color-scheme:dark] font-mono">
                            </div>
                            <div class="flex gap-4">
                                <div class="flex-1">
                                    <label class="block text-xs opacity-50 mb-1">入睡时间</label>
                                    <input v-model="form.bedtime" type="time" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none [color-scheme:dark] font-mono text-center">
                                </div>
                                <div class="flex-1">
                                    <label class="block text-xs opacity-50 mb-1">起床时间</label>
                                    <input v-model="form.wakeTime" type="time" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none [color-scheme:dark] font-mono text-center">
                                </div>
                            </div>
                            <div class="text-center text-xs opacity-60 font-mono py-1">
                                本次时长：<span class="font-black" :class="durColor(previewDuration)">{{ fmtDur(previewDuration) }}</span>
                            </div>
                            <div>
                                <label class="block text-xs opacity-50 mb-1">备注（可选）</label>
                                <input v-model="form.note" type="text" placeholder="如：睡前刷手机太久 / 睡得很沉" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none">
                            </div>
                            <div class="flex gap-3 mt-6">
                                <button @click="showModal = false" class="flex-1 py-3 rounded-xl bg-white/5 font-bold active:bg-white/10">取消</button>
                                <button @click="submit" class="flex-1 py-3 rounded-xl font-black text-white" style="background-color: var(--accent-theme);">确认保存</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'

    const props = defineProps<{ userId: string }>()
    const currentThemeColor = computed(() => getComputedStyle(document.documentElement).getPropertyValue('--accent-theme').trim() || '#6366f1')

    interface SleepRecord { id: string; date: string; bedtime: string; wakeTime: string; note?: string }

    const STORAGE = 'sync_sleep'
    const load = (uid: string): SleepRecord[] => {
    try { return JSON.parse(localStorage.getItem(`${STORAGE}_${uid}`) || '[]') } catch { return [] }
    }
    const records = ref<SleepRecord[]>(load(props.userId))
    const save = () => localStorage.setItem(`${STORAGE}_${props.userId}`, JSON.stringify(records.value))
    watch(() => props.userId, (uid) => { records.value = load(uid) })

    // ===== 时间计算 =====
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return (h || 0) * 60 + (m || 0) }
    const durationMin = (rec: { bedtime: string, wakeTime: string }) => {
    let d = toMin(rec.wakeTime) - toMin(rec.bedtime)
    if (d <= 0) d += 1440   // 跨过午夜
    return d
    }
    const fmtDur = (min: number) => `${Math.floor(min / 60)}小时${min % 60}分`
    const durColor = (min: number) => min >= 450 ? 'text-green-400' : (min < 360 ? 'text-red-400' : 'text-amber-400')

    const iso = (d: Date) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
    const monthOf = (s: string) => Number(s.split('-')[1])
    const dayOf = (s: string) => Number(s.split('-')[2])

    const sortedRecords = computed(() => [...records.value].sort((a, b) => b.date.localeCompare(a.date)))

    // ===== 统计 =====
    const avgDuration = computed(() => {
    if (!records.value.length) return '—'
    const avg = records.value.reduce((s, r) => s + durationMin(r), 0) / records.value.length
    return fmtDur(Math.round(avg))
    })
    // 平均入睡：以 18:00 为基准消除午夜环绕
    const avgBedtime = computed(() => {
    if (!records.value.length) return '—'
    const base = 18 * 60
    const avgShift = records.value.reduce((s, r) => s + ((toMin(r.bedtime) - base + 1440) % 1440), 0) / records.value.length
    const real = (Math.round(avgShift) + base) % 1440
    return `${String(Math.floor(real / 60)).padStart(2, '0')}:${String(real % 60).padStart(2, '0')}`
    })
    const avgWake = computed(() => {
    if (!records.value.length) return '—'
    const avg = records.value.reduce((s, r) => s + toMin(r.wakeTime), 0) / records.value.length
    const real = Math.round(avg) % 1440
    return `${String(Math.floor(real / 60)).padStart(2, '0')}:${String(real % 60).padStart(2, '0')}`
    })
    const streak = computed(() => {
    const dates = new Set(records.value.map(r => r.date))
    let count = 0
    const d = new Date()
    if (!dates.has(iso(d))) d.setDate(d.getDate() - 1)  // 今天没记就从昨天起算
    while (dates.has(iso(d))) { count++; d.setDate(d.getDate() - 1) }
    return count
    })

    const weekBars = computed(() => {
    const byDate = new Map(records.value.map(r => [r.date, r]))
    const labels = ['日', '一', '二', '三', '四', '五', '六']
    const bars = []
    const today = iso(new Date())
    for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const ds = iso(d)
    const rec = byDate.get(ds)
    const hours = rec ? durationMin(rec) / 60 : 0
    const color = hours >= 7.5 ? 'bg-green-500/80' : (hours >= 6 ? 'bg-amber-500/80' : (hours > 0 ? 'bg-red-500/80' : 'bg-white/40'))
    bars.push({ date: ds, label: labels[d.getDay()], hours, color, isToday: ds === today })
    }
    return bars
    })

    // ===== 增改删 =====
    const showModal = ref(false)
    const editingId = ref<string | null>(null)
    const form = ref({ date: iso(new Date()), bedtime: '23:00', wakeTime: '07:00', note: '' })

    const previewDuration = computed(() => durationMin(form.value))

    const openEditor = (rec?: SleepRecord) => {
    if (rec) {
    editingId.value = rec.id
    form.value = { date: rec.date, bedtime: rec.bedtime, wakeTime: rec.wakeTime, note: rec.note || '' }
    } else {
    editingId.value = null
    form.value = { date: iso(new Date()), bedtime: '23:00', wakeTime: '07:00', note: '' }
    }
    showModal.value = true
    }

    const submit = () => {
    if (!form.value.date || !form.value.bedtime || !form.value.wakeTime) return
    if (editingId.value) {
    const idx = records.value.findIndex(r => r.id === editingId.value)
    if (idx !== -1) records.value[idx] = { ...records.value[idx], ...form.value }
    } else {
    // 同一天已有记录则覆盖，避免重复
    const existing = records.value.findIndex(r => r.date === form.value.date)
    if (existing !== -1) records.value[existing] = { ...records.value[existing], ...form.value }
    else records.value.push({ id: `sleep-${Date.now()}`, ...form.value })
    }
    save(); showModal.value = false
    }

    const deleteRecord = (id: string) => {
    if (window.confirm('删除这条睡眠记录吗？')) {
    records.value = records.value.filter(r => r.id !== id)
    save()
    }
    }
</script>

<style scoped>
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(0.95) translateY(20px); }
</style>
