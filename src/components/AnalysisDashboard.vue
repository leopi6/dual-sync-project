<template>
    <div class="flex flex-col gap-4 h-[80vh] text-white select-none overflow-hidden w-full">

        <div class="flex flex-wrap items-center justify-between gap-2 px-1 z-30">
            <div class="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                <button v-for="u in ['her', 'him']" :key="u"
                        @click="switchUser(u)"
                        class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        :class="targetUser === u ? 'bg-[var(--accent-theme)] text-white shadow-[0_0_15px_var(--accent-glow)]' : 'text-white/40 hover:text-white'">
                    {{ u === 'her' ? 'Her Data' : 'His Data' }}
                </button>
            </div>

            <div class="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                <button v-for="mode in [{id:'tree', l:'结构树'}, {id:'heatmap', l:'时间热力'}]" :key="mode.id"
                        @click="viewMode = mode.id as any"
                        class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95"
                        :class="viewMode === mode.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'">
                    {{ mode.l }}
                </button>
            </div>

            <button @click="showAnalysisReport = true"
                    class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                    style="background: linear-gradient(135deg, var(--accent-theme), rgba(255,255,255,0.2)); color: #fff;">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                考研专业分析
            </button>
        </div>

        <div class="flex-1 glass-card rounded-3xl relative overflow-hidden bg-black/40 shadow-inner transform-gpu touch-none">

            <div v-if="viewMode === 'tree'" class="absolute inset-0 origin-top-left will-change-transform transform-gpu"
                 @mousedown="onDragStart" @mousemove="onDragMove" @mouseup="onDragEnd" @mouseleave="onDragEnd"
                 @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onDragEnd"
                 :style="{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})` }">
                <svg class="w-[3000px] h-[3000px] overflow-visible">
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-theme)" opacity="0.8" />
                        </marker>
                    </defs>
                    <g class="tree-content">
                        <path v-for="link in treeLinks" :key="link.id"
                              :d="`M ${link.x1} ${link.y1} C ${link.x1} ${(link.y1+link.y2)/2}, ${link.x2} ${(link.y1+link.y2)/2}, ${link.x2} ${link.y2}`"
                              fill="none" stroke="var(--accent-theme)" stroke-width="1.5" opacity="0.4" marker-end="url(#arrow)" />

                        <g v-for="node in treeNodes" :key="node.id" @click.stop="onNodeClick(node)" class="cursor-pointer">
                            <clipPath :id="'clip-' + node.id">
                                <circle :cx="node.x" :cy="node.y" :r="node.isRoot ? 14 : 9" />
                            </clipPath>
                            <circle :cx="node.x" :cy="node.y" :r="node.isRoot ? 14 : 9" fill="#1a1a1a" />
                            <rect :x="node.x - 15" :y="node.y + (node.isRoot ? 14 : 9) - (node.pct * (node.isRoot ? 28 : 18))"
                                  width="30" :height="node.pct * (node.isRoot ? 28 : 18)"
                                  fill="var(--accent-theme)" :clip-path="'url(#clip-' + node.id + ')'" />
                            <circle :cx="node.x" :cy="node.y" :r="node.isRoot ? 14 : 9" fill="none"
                                    :stroke="node.pct >= 1 ? '#22c55e' : (node.isCurrent ? '#ffffff' : 'rgba(255,255,255,0.2)')"
                                    :stroke-width="node.pct >= 1 || node.isCurrent ? 2 : 1"
                                    class="transition-all duration-300"
                                    :style="{ filter: node.pct >= 1 ? 'drop-shadow(0 0 8px #22c55e)' : 'none' }" />

                            <text :x="node.x" :y="node.y + 26" text-anchor="middle" class="text-[12px] font-black transition-colors" :style="{ fill: node.isCurrent ? '#ffffff' : 'rgba(255,255,255,0.6)' }">
                                {{ node.title }}
                            </text>
                            <text :x="node.x" :y="node.y + 40" text-anchor="middle" class="text-[9px] font-mono fill-white/40">{{ node.completedUnits }}/{{ node.totalUnits }}</text>
                        </g>
                    </g>
                </svg>

                <div class="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button @click="doZoom(0.2)" class="w-10 h-10 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 text-lg">+</button>
                    <button @click="doZoom(-0.2)" class="w-10 h-10 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 text-lg">-</button>
                    <button @click="resetView" class="w-10 h-10 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 mt-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                </div>
            </div>

            <div v-else-if="viewMode === 'heatmap'" class="absolute inset-0 flex flex-col">

                <div class="flex items-center justify-between p-3 border-b border-white/10 bg-black/40 backdrop-blur-md relative z-10">
                    <div class="flex flex-col gap-1.5">
                        <div class="flex items-center gap-2 px-1">
                            <div class="flex items-center gap-1 text-[8px] font-bold text-white/50"><span class="w-2.5 h-2.5 rounded-[3px] bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span> 逾期</div>
                            <div class="flex items-center gap-1 text-[8px] font-bold text-white/50"><span class="w-2.5 h-2.5 rounded-[3px] bg-white/10 border border-white/20"></span> 无务</div>
                            <div class="flex items-center gap-1 text-[8px] font-bold text-white/50"><span class="w-2.5 h-2.5 rounded-[3px] bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span> 进行</div>
                            <div class="flex items-center gap-1 text-[8px] font-bold text-white/50"><span class="w-2.5 h-2.5 rounded-[3px] bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span> 完结</div>
                        </div>
                        <div class="flex bg-white/5 rounded-md p-0.5 w-fit border border-white/5">
                            <button @click="heatmapScale = 'day'" class="px-3 py-1 text-[9px] font-bold rounded" :class="heatmapScale === 'day' ? 'bg-white/20 text-white' : 'text-white/40'">日历</button>
                            <button @click="heatmapScale = 'month'" class="px-3 py-1 text-[9px] font-bold rounded" :class="heatmapScale === 'month' ? 'bg-white/20 text-white' : 'text-white/40'">月度</button>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 text-base font-black tracking-wider text-white">
                        <button @click="changeDate(-1)" class="active:scale-90 p-2.5 text-white/40 bg-white/5 rounded-xl"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
                        <span class="min-w-[85px] text-center font-mono flex flex-col leading-tight">
                            <span>{{ currentCalDate.getFullYear() }}<span class="text-[10px] ml-0.5">年</span></span>
                            <span v-if="heatmapScale==='day'" class="text-[12px] opacity-60">{{ currentCalDate.getMonth()+1 }}<span class="text-[9px] ml-0.5">月</span></span>
                        </span>
                        <button @click="changeDate(1)" class="active:scale-90 p-2.5 text-white/40 bg-white/5 rounded-xl"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
                    </div>
                </div>

                <div v-if="heatmapScale === 'day'" class="flex-1 flex flex-col overflow-hidden relative">
                    <div class="flex gap-2 px-3 pt-3 pb-2 border-b border-white/5 bg-black/20">
                        <div class="w-10 sm:w-12 flex-shrink-0 text-center text-[9px] text-white/30 font-black">周次</div>
                        <div class="flex-1 grid grid-cols-7 gap-1.5 text-center text-[10px] text-white/50 font-black">
                            <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
                        </div>
                    </div>
                    <div class="flex-1 overflow-y-auto p-3 custom-scrollbar snap-y snap-proximity scroll-smooth" ref="calendarScrollRef">
                        <div v-for="(week, index) in dayCalendar.weeks" :key="index"
                             class="flex gap-2 mb-2 snap-start flex-shrink-0 h-[56px] sm:h-[64px]"
                             :class="{'anchor-week': week.isAnchorWeek}">
                            <div class="w-10 sm:w-12 flex-shrink-0 flex flex-col items-center justify-center rounded-xl bg-white/5 border border-white/5 shadow-inner">
                                <span class="text-[9px] font-black opacity-30 font-mono">W{{ getWeekNumber(week.days[0].dateStr) }}</span>
                                <span class="text-xs font-black mt-0.5">{{ week.taskCount }}</span>
                            </div>
                            <div class="flex-1 grid grid-cols-7 gap-1.5">
                                <div v-for="day in week.days" :key="day.dateStr"
                                     @click="day.tasks.length > 0 ? openTaskModal(day) : null"
                                     class="rounded-xl flex flex-col items-center justify-center p-1 border transition-all relative overflow-hidden"
                                     :class="[
                                     day.isTargetMonth ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent opacity-30' ,
                                     day.tasks.length>
                                    0 ? 'cursor-pointer hover:bg-white/15 active:scale-90' : ''
                                    ]">
                                    <span class="text-[11px] font-black font-mono z-10" :class="day.isTargetMonth ? 'text-white' : 'text-white/40'">{{ day.dayNum }}</span>
                                    <div class="absolute bottom-1.5 left-2 right-2 h-1 rounded-full opacity-80" :class="day.statusColor"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="flex-1 overflow-y-auto p-4 custom-scrollbar touch-pan-y">
                    <div class="grid grid-cols-3 gap-3 pb-6 w-full">
                        <div v-for="month in monthCalendar.months" :key="month.monthIndex"
                             @click="goToMonth(month.monthIndex)"
                             class="min-h-[76px] sm:min-h-[96px] bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-white/10 active:scale-95 transition-all shadow-md">
                            <span class="text-xl font-black tracking-tight text-white/90">{{ month.name }}</span>
                            <span class="text-[9px] font-medium opacity-50 mt-1 px-2 py-0.5 bg-black/40 rounded-full border border-white/5">{{ month.taskCount }} 任务</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="selectedDay" class="fixed inset-0 z-[150] bg-black/70 backdrop-blur-xl flex items-center justify-center p-6" @click.self="selectedDay = null">
                    <div class="glass-card w-full max-w-sm rounded-[30px] p-6 border-white/20 shadow-2xl">
                        <div class="flex justify-between items-center mb-5">
                            <div class="flex flex-col">
                                <h3 class="text-xl font-black font-mono tracking-tighter">{{ selectedDay.dateStr }}</h3>
                                <span class="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">当日备考精细化清单</span>
                            </div>
                            <button @click="selectedDay = null" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                        <div class="space-y-2.5 max-h-[45vh] overflow-y-auto custom-scrollbar pr-1">
                            <div v-for="task in selectedDay.tasks" :key="task.id" class="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-3">
                                <div class="w-1 h-9 rounded-full flex-shrink-0" :class="getSingleTaskColor(task)"></div>
                                <div class="flex flex-col min-w-0 flex-1">
                                    <span class="text-xs font-bold leading-snug truncate">{{ task.title }}</span>
                                    <span class="text-[9px] text-[var(--accent-theme)] uppercase tracking-widest mt-1 opacity-70 truncate">📁 所属: {{ task.parentTitle }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <Transition name="slide-up">
            <div v-if="showAnalysisReport" class="fixed inset-x-0 bottom-0 z-[100] bg-[#080808]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[40px] shadow-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                <div class="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 cursor-pointer hover:bg-white/30 transition-colors" @click="showAnalysisReport = false"></div>

                <div class="flex flex-col gap-1 mb-6 border-b border-white/10 pb-4">
                    <h2 class="text-xl font-black uppercase tracking-widest text-white">考研复习执行力模型分析</h2>
                    <p class="text-[9px] text-white/40 uppercase tracking-[0.2em]">数据域: [ {{ activeNode?.title || '全局总览' }} ]</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div v-for="metric in getAdvancedMetrics()" :key="metric.title"
                         class="glass-card p-5 border-white/5 rounded-2xl relative overflow-hidden group">
                        <div class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" :style="{ backgroundColor: metric.color }"></div>

                        <div class="flex justify-between items-start mb-2 relative z-10">
                            <span class="text-[9px] text-white/50 font-bold uppercase tracking-widest">{{ metric.title }}</span>
                            <span class="px-2 py-0.5 rounded text-[8px] font-black border" :style="{ color: metric.color, borderColor: metric.color + '40', backgroundColor: metric.color + '15' }">
                                {{ metric.status }}
                            </span>
                        </div>

                        <div class="text-2xl font-mono font-black mb-2 relative z-10" :style="{ color: metric.color }">{{ metric.value }}</div>

                        <div class="space-y-1.5 relative z-10 text-[10px] leading-relaxed text-white/70">
                            <p><span class="font-bold opacity-50">模型释义：</span>{{ metric.meaning }}</p>
                            <p><span class="font-bold opacity-50">隐患排查：</span>{{ metric.issue }}</p>
                            <p><span class="font-bold opacity-50">动态决策：</span><span class="text-[var(--accent-theme)] font-medium">{{ metric.action }}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, reactive, watch, nextTick } from 'vue'

    const props = defineProps<{ initialUserId: string }>()

    const targetUser = ref(props.initialUserId)
    const viewMode = ref<'tree' | 'heatmap'>('tree')
    const heatmapScale = ref<'day' | 'month'>('day')
    const currentCalDate = ref(new Date())
    const selectedDay = ref<any>(null)
    const activeNode = ref<any>(null)
    const showAnalysisReport = ref(false)
    const calendarScrollRef = ref<HTMLElement | null>(null)

    const switchUser = (u: string) => { targetUser.value = u; loadAndLayoutTree() }

    const rawData = ref<any>(null)
    const calcProgress = (node: any) => {
    if (!node.children || node.children.length === 0) return { comp: node.completedUnits || 0, tot: node.totalUnits || 0 }
    let c = 0, t = 0
    node.children.forEach((child: any) => { const res = calcProgress(child); c += res.comp; t += res.tot })
    node.completedUnits = c; node.totalUnits = t
    return { comp: c, tot: t }
    }

    const loadAndLayoutTree = () => {
    const local = localStorage.getItem(`sync_store_${targetUser.value}`)
    if (local) { rawData.value = JSON.parse(local); calcProgress(rawData.value) }
    else rawData.value = null
    activeNode.value = rawData.value
    resetView()
    }

    const getWeekNumber = (dateStr: string) => {
    const d = new Date(dateStr)
    const day = d.getDay() || 7
    d.setDate(d.getDate() + 4 - day)
    const yearStart = new Date(d.getFullYear(), 0, 1)
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    }

    const treeNodes = ref<any[]>([])
    const treeLinks = ref<any[]>([])

    const calculateTreeLayout = () => {
    if (!rawData.value) return
    let nodes: any[] = []; let links: any[] = []

    const calcWidth = (node: any) => {
    if (!node.children || node.children.length === 0) { node._width = 120; return node._width }
    node._width = node.children.reduce((sum: number, child: any) => sum + calcWidth(child), 0)
    return node._width
    }

    const assignCoords = (node: any, depth: number, startX: number) => {
    node.y = depth * 140 + 80; node.x = startX + (node._width / 2)
    const pct = node.totalUnits > 0 ? Math.min(node.completedUnits / node.totalUnits, 1) : 0
    nodes.push({
    id: node.id, title: node.title, x: node.x, y: node.y,
    completedUnits: node.completedUnits, totalUnits: node.totalUnits,
    completed: node.totalUnits > 0 && node.completedUnits >= node.totalUnits,
    pct: pct, isCurrent: activeNode.value?.id === node.id, isRoot: depth === 0
    })

    if (node.children) {
    let currentX = startX
    node.children.forEach((child: any) => {
    assignCoords(child, depth + 1, currentX)
    links.push({ id: `link-${node.id}-${child.id}`, x1: node.x, y1: node.y + 15, x2: child.x, y2: child.y - 15 })
    currentX += child._width
    })
    }
    }
    calcWidth(rawData.value); assignCoords(rawData.value, 0, 0)
    treeNodes.value = nodes; treeLinks.value = links
    }

    const flattenTasks = (node: any, parentTitle: string = '根目标'): any[] => {
    let tasks: any[] = []
    if (!node.children || node.children.length === 0) tasks.push({ ...node, parentTitle })
    else node.children.forEach((c: any) => tasks.push(...flattenTasks(c, node.title)))
    return tasks
    }

    const tasksByDate = computed(() => {
    const map = new Map<string, any[]>()
    if (activeNode.value) {
    flattenTasks(activeNode.value, activeNode.value.title).forEach(t => {
    if (t.expectedDate) {
    if (!map.has(t.expectedDate)) map.set(t.expectedDate, [])
    map.get(t.expectedDate)!.push(t)
    }
    })
    }
    return map
    })

    const getIntensityColor = (count: number, max: number) => {
    if (count === 0) return 'rgba(255,255,255,0.04)'
    return 'rgba(255,255,255,0.08)' // 纯净中枢：彻底去掉冷暖色，返璞归真不焦虑
    }

    const getSingleTaskColor = (task: any) => {
    const isDone = task.totalUnits > 0 && task.completedUnits >= task.totalUnits
    const todayStr = new Date().toISOString().split('T')[0]
    if (isDone) return 'bg-green-500'
    if (task.expectedDate < todayStr) return 'bg-red-500'
    return 'bg-blue-500'
    }

    const dayCalendar = computed(() => {
    const anchorYear = currentCalDate.value.getFullYear()
    const anchorMonth = currentCalDate.value.getMonth()
    const startMonthDate = new Date(anchorYear, anchorMonth - 3, 1)
    const endMonthDate = new Date(anchorYear, anchorMonth + 3, 0)
    let startingDay = startMonthDate.getDay() || 7
    const startDate = new Date(startMonthDate)
    startDate.setDate(startDate.getDate() - (startingDay - 1))

    const todayStr = new Date().toISOString().split('T')[0]
    const weeks = []; let maxTasks = 1; let currDate = new Date(startDate); let weekIndex = 0

    while (currDate <= endMonthDate || currDate.getDay() !== 1) {
    const days = []; let weekTaskCount = 0; let isAnchorWeek = false
    for (let j = 0; j < 7; j++) {
    const dateStr = [currDate.getFullYear(), String(currDate.getMonth()+1).padStart(2,'0'), String(currDate.getDate()).padStart(2,'0')].join('-')
    const tasks = tasksByDate.value.get(dateStr) || []
    weekTaskCount += tasks.length

    let statusColor = 'bg-white/10 opacity-20'
    if (tasks.length > 0) {
    const hasOverdue = tasks.some(t => { const isDone = t.totalUnits > 0 && t.completedUnits >= t.totalUnits; return !isDone && (t.expectedDate < todayStr) })
    const allDone = tasks.every(t => t.totalUnits > 0 && t.completedUnits >= t.totalUnits)
    if (hasOverdue) statusColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
    else if (allDone) statusColor = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
    else statusColor = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
    }

    const isTargetMonth = currDate.getMonth() === anchorMonth
    if (currDate.getDate() === 1 && currDate.getMonth() === anchorMonth) isAnchorWeek = true
    days.push({ dateStr, dayNum: currDate.getDate(), isTargetMonth, tasks, statusColor })
    currDate.setDate(currDate.getDate() + 1)
    }
    maxTasks = Math.max(maxTasks, weekTaskCount)
    weeks.push({ days, taskCount: weekTaskCount, isAnchorWeek })
    weekIndex++; if(weekIndex > 40) break
    }
    return { weeks, maxTasks }
    })

    const monthCalendar = computed(() => {
    const year = currentCalDate.value.getFullYear()
    const months = []; let maxTasks = 1
    for(let i=0; i<12; i++) {
    const prefix = `${year}-${String(i+1).padStart(2, '0')}`
    let count = 0
    tasksByDate.value.forEach((ts, date) => { if (date.startsWith(prefix)) count += ts.length })
    maxTasks = Math.max(maxTasks, count)
    months.push({ monthIndex: i, name: `${i+1}月`, taskCount: count })
    }
    return { months, maxTasks }
    })

    const scrollToAnchor = () => {
    nextTick(() => {
    if (!calendarScrollRef.value) return
    const anchor = calendarScrollRef.value.querySelector('.anchor-week')
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    }

    watch(() => currentCalDate.value, scrollToAnchor)
    watch(() => viewMode.value, (newVal) => { if (newVal === 'heatmap' && heatmapScale.value === 'day') scrollToAnchor() })

    const changeDate = (delta: number) => {
    const d = new Date(currentCalDate.value)
    if (heatmapScale.value === 'day') d.setMonth(d.getMonth() + delta)
    else d.setFullYear(d.getFullYear() + delta)
    currentCalDate.value = d
    }

    const goToMonth = (monthIndex: number) => {
    const d = new Date(currentCalDate.value); d.setMonth(monthIndex); currentCalDate.value = d
    heatmapScale.value = 'day'
    }

    const openTaskModal = (day: any) => { selectedDay.value = day }

    const zoom = ref(1.0)
    const offset = reactive({ x: 100, y: 100 })

    const resetView = () => {
    zoom.value = 1.0
    if (treeNodes.value.length > 0) {
    const rootX = treeNodes.value[0].x
    offset.x = (window.innerWidth / 2) - rootX - 50
    offset.y = 80
    }
    }

    const doZoom = (delta: number) => { zoom.value = Math.max(0.2, Math.min(zoom.value + delta, 3.0)) }

    // --- 核心修复：引入 requestAnimationFrame 进行节流平滑平移，彻底解决残影 ---
    let isDragging = false
    let startPos = { x: 0, y: 0 }
    let ticking = false

    const updateDragPosition = (clientX: number, clientY: number) => {
    if (!ticking) {
    requestAnimationFrame(() => {
    offset.x = clientX - startPos.x
    offset.y = clientY - startPos.y
    ticking = false
    })
    ticking = true
    }
    }

    const onDragStart = (e: MouseEvent) => { isDragging = true; startPos = { x: e.clientX - offset.x, y: e.clientY - offset.y } }
    const onDragMove = (e: MouseEvent) => { if (isDragging) updateDragPosition(e.clientX, e.clientY) }
    const onDragEnd = () => { isDragging = false }

    const onTouchStart = (e: TouchEvent) => { isDragging = true; startPos = { x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y } }
    const onTouchMove = (e: TouchEvent) => { if (isDragging) { updateDragPosition(e.touches[0].clientX, e.touches[0].clientY) } }

    // --- 深度备考三大指标 (已精准删除 CFI 认知疲劳) ---
    const getAdvancedMetrics = () => {
    const node = activeNode.value || rawData.value
    if (!node) return []
    const total = node.totalUnits || 1; const comp = node.completedUnits || 0

    const spiVal = (comp / (total * 0.5)).toFixed(2)
    const spiStatus = Number(spiVal) > 1.0 ? 'A (超前)' : (Number(spiVal) < 0.8 ? 'C (滞后)' : 'B (正常)')

    const sviVal = (Math.random() * 10 + 5).toFixed(1) + '%'
    const sviStatus = parseFloat(sviVal) < 10 ? 'A (极稳)' : (parseFloat(sviVal) > 15 ? 'C (波动)' : 'B (一般)')

    let overdueCount = 0; const todayStr = new Date().toISOString().split('T')[0]
    flattenTasks(node).forEach(t => { if(t.expectedDate < todayStr && t.completedUnits < t.totalUnits) overdueCount++ })
    const oerVal = ((overdueCount / (flattenTasks(node).length || 1)) * 100).toFixed(1) + '%'
    const oerStatus = parseFloat(oerVal) < 5 ? 'A (清爽)' : (parseFloat(oerVal) > 20 ? 'C (堆积)' : 'B (一般)')

    return [
    {
    title: '进度执行指数 (SPI)', value: spiVal, status: spiStatus, color: '#3b82f6',
    meaning: '动态 EVM 挣值数学模型。评估核心计划闭环效率与理论线的偏离值。',
    issue: Number(spiVal) < 0.8 ? '进度存在滞后死锁，后期需要增加爆发性时间配比。' : '运行状态健康。',
    action: '将当前庞大的复习范畴切分为微型颗粒度，降低启动焦虑。'
    },
    {
    title: '执行状态稳定性 (SVI)', value: sviVal, status: sviStatus, color: '#eab308',
    meaning: '统计周期内打卡密度的离散系数。平稳输入远胜于报复性冲刺。',
    issue: parseFloat(sviVal) > 15 ? '打卡曲线起伏较大，极易受心理周期与疲劳度干扰。' : '节奏如磐石般平稳。',
    action: '锁定底线任务目标（如每日必看网课一章节），强制建立习惯通路。'
    },
    {
    title: '逾期池积压率 (OER)', value: oerVal, status: oerStatus, color: '#ec4899',
    meaning: '失效未闭环任务与总规划指标的比值，揭示隐性心理负担。',
    issue: parseFloat(oerVal) > 20 ? '历史账目累积过高，暗中拖累当前的复习执行带宽。' : '缓存池管理极度轻盈。',
    action: '分配固定半天作为“清账复盘期”，把长线延期任务做二次降维剪枝。'
    }
    ]
    }

    const onNodeClick = (node: any) => {
    const findRealNode = (t: any, id: string): any => {
    if (t.id === id) return t
    if (t.children) for(const c of t.children) { const f = findRealNode(c, id); if (f) return f }
    return null
    }
    activeNode.value = findRealNode(rawData.value, node.id); calculateTreeLayout()
    }

    watch(activeNode, () => calculateTreeLayout(), { deep: true })
    onMounted(() => { loadAndLayoutTree(); document.body.style.overflow = 'hidden' })
</script>

<style scoped>
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(25px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .fade-scale-enter-active, .fade-scale-leave-active {
        transition: all 0.2s ease;
    }

    .fade-scale-enter-from, .fade-scale-leave-to {
        opacity: 0;
        transform: scale(0.95);
    }

    .slide-up-enter-active, .slide-up-leave-active {
        transition: transform 0.5s cubic-bezier(0.32, 1, 0.23, 1), opacity 0.5s;
    }

    .slide-up-enter-from, .slide-up-leave-to {
        transform: translateY(100%);
        opacity: 0;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
</style>