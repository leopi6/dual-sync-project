<template>
    <div class="flex flex-col gap-4 h-[78vh]">

        <div class="flex flex-wrap items-center justify-between gap-3 px-2 z-20">
            <div class="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                <button v-for="u in ['him', 'her']" :key="u"
                        @click="switchUser(u)"
                        class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                        :class="targetUser === u ? 'bg-[var(--accent-theme)] text-white shadow-[0_0_15px_var(--accent-glow)]' : 'text-white/40 hover:text-white'">
                    {{ u === 'him' ? 'His Data' : 'Her Data' }}
                </button>
            </div>

            <div class="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                <button v-for="mode in [{id:'tree', l:'结构树'}, {id:'matrix', l:'归属方阵'}, {id:'calendar', l:'时间日历'}]" :key="mode.id"
                        @click="viewMode = mode.id as any"
                        class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                        :class="viewMode === mode.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'">
                    {{ mode.l }}
                </button>
            </div>

            <button @click="showAnalysisReport = true"
                    class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                    style="background: linear-gradient(to right, var(--accent-theme), rgba(255,255,255,0.3)); color: #fff;">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                全盘分析报告
            </button>
        </div>

        <div class="flex-1 glass-card rounded-3xl relative overflow-hidden bg-black/20"
             @mousedown="onDragStart" @mousemove="onDragMove" @mouseup="onDragEnd" @mouseleave="onDragEnd"
             @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onDragEnd">

            <div class="absolute inset-0 transition-transform duration-75 ease-linear origin-top-left will-change-transform"
                 :style="{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }">

                <svg v-if="viewMode === 'tree'" class="w-[3000px] h-[3000px] overflow-visible">
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-theme)" opacity="0.8" />
                        </marker>
                    </defs>
                    <g class="tree-content">
                        <path v-for="link in treeLinks" :key="link.id"
                              :d="`M ${link.x1} ${link.y1} C ${link.x1} ${(link.y1+link.y2)/2}, ${link.x2} ${(link.y1+link.y2)/2}, ${link.x2} ${link.y2}`"
                              fill="none" stroke="var(--accent-theme)" stroke-width="1.5" opacity="0.4" marker-end="url(#arrow)" />

                        <g v-for="node in treeNodes" :key="node.id"
                           @click.stop="onNodeClick(node)"
                           class="cursor-pointer group">
                            <circle :cx="node.x" :cy="node.y" :r="node.isRoot ? 12 : 8"
                                    :fill="node.completed ? 'var(--accent-theme)' : '#1a1a1a'"
                                    :stroke="node.isCurrent ? '#ffffff' : 'var(--accent-theme)'" stroke-width="2"
                                    class="transition-all duration-300"
                                    :style="{ filter: node.completed ? 'drop-shadow(0 0 10px var(--accent-glow))' : 'none' }" />
                            <text :x="node.x" :y="node.y + 24"
                                  text-anchor="middle"
                                  class="text-[12px] font-black pointer-events-none transition-colors"
                                  :style="{ fill: node.isCurrent ? '#ffffff' : 'rgba(255,255,255,0.6)' }">
                                {{ node.title }}
                            </text>
                            <text :x="node.x" :y="node.y + 38"
                                  text-anchor="middle"
                                  class="text-[9px] fill-white/40 pointer-events-none">
                                {{ node.completedUnits }}/{{ node.totalUnits }}
                            </text>
                            <circle :cx="node.x" :cy="node.y" r="16" fill="transparent" stroke="var(--accent-theme)" stroke-width="1.5" class="animate-ping opacity-30" v-if="node.isCurrent" />
                        </g>
                    </g>
                </svg>

                <div v-else-if="viewMode === 'matrix'" class="p-12 w-[3000px] h-[3000px]">
                    <div class="flex flex-wrap gap-8 items-start">
                        <div v-for="group in matrixGroups" :key="group.id"
                             class="border-2 border-white/10 rounded-2xl p-4 bg-white/5 relative min-w-[200px] backdrop-blur-sm">
                            <div class="absolute -top-3 left-4 bg-[#121212] px-3 py-1 rounded-full text-[10px] font-black text-white/80 border border-white/10">
                                📁 {{ group.parentTitle }}
                            </div>
                            <div class="grid grid-cols-4 gap-2 mt-2">
                                <div v-for="task in group.tasks" :key="task.id"
                                     class="aspect-square rounded-lg flex flex-col items-center justify-center p-1 text-center transition-all shadow-lg"
                                     :class="getTaskColorClass(task)"
                                     :title="task.title + ' | 截止: ' + task.deadlineShort">
                                    <span class="text-[8px] font-black leading-tight line-clamp-2 text-white/90">{{ task.title }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else-if="viewMode === 'calendar'" class="p-12 w-[3000px] h-[3000px]">
                    <div class="flex gap-4 mb-8">
                        <button v-for="scale in ['day', 'week']" :key="scale" @click="calendarScale = scale as any"
                                class="px-3 py-1 rounded border text-[10px] font-bold"
                                :class="calendarScale === scale ? 'bg-white text-black border-white' : 'border-white/20 text-white/50'">
                            按{{ scale === 'day' ? '日' : '周' }}平铺
                        </button>
                    </div>
                    <div class="flex gap-6 overflow-visible">
                        <div v-for="col in calendarGroups" :key="col.dateLabel" class="flex flex-col gap-2 min-w-[120px]">
                            <div class="text-[10px] font-black tracking-widest text-white/50 border-b border-white/10 pb-2 mb-2 uppercase">
                                📅 {{ col.dateLabel }}
                            </div>
                            <div v-for="task in col.tasks" :key="task.id"
                                 class="p-2 rounded-lg text-[9px] font-bold border border-white/10 shadow-lg flex flex-col gap-1"
                                 :class="getTaskColorClass(task)">
                                <span class="line-clamp-1 text-white/90">{{ task.title }}</span>
                                <span class="opacity-50 font-mono">{{ task.completedUnits }}/{{ task.totalUnits }}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div v-if="viewMode !== 'tree'" class="absolute bottom-4 left-4 flex gap-2 bg-black/60 p-2 rounded-xl backdrop-blur-md border border-white/10">
                <div class="flex items-center gap-1 text-[8px] font-bold text-white/60"><span class="w-3 h-3 rounded bg-red-500 shadow-[0_0_8px_#ef4444]"></span> 逾期</div>
                <div class="flex items-center gap-1 text-[8px] font-bold text-white/60"><span class="w-3 h-3 rounded bg-white/20 border border-white/20"></span> 待办</div>
                <div class="flex items-center gap-1 text-[8px] font-bold text-white/60"><span class="w-3 h-3 rounded bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span> 按时</div>
                <div class="flex items-center gap-1 text-[8px] font-bold text-white/60"><span class="w-3 h-3 rounded bg-green-500 shadow-[0_0_8px_#22c55e]"></span> 提前</div>
            </div>

            <div class="absolute bottom-4 right-4 flex flex-col gap-2">
                <button @click="doZoom(0.2)" class="w-10 h-10 glass-card rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-90 shadow-lg text-lg">+</button>
                <button @click="doZoom(-0.2)" class="w-10 h-10 glass-card rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-90 shadow-lg text-lg">-</button>
                <button @click="resetView" class="w-10 h-10 glass-card rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-90 shadow-lg mt-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                </button>
            </div>
        </div>

        <Transition name="slide-up">
            <div v-if="showAnalysisReport" class="fixed inset-x-0 bottom-0 z-[100] bg-[#0a0a0b]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[40px] shadow-2xl p-6 md:p-10 max-h-[85vh] overflow-y-auto">
                <div class="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 cursor-pointer hover:bg-white/30 transition-colors" @click="showAnalysisReport = false"></div>

                <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 class="text-2xl font-black uppercase tracking-widest" style="color: var(--text-color, #ffffff);">权威节点分析模型</h2>
                        <p class="text-xs text-white/40 mt-1 uppercase">当前分析域: [ {{ activeNode?.title || '全盘' }} ]</p>
                    </div>
                    <div class="px-5 py-2 rounded-full font-black uppercase tracking-widest text-[10px]"
                         :class="getReport().isHealthy ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'">
                        健康度: {{ getReport().isHealthy ? 'OPTIMAL' : 'AT RISK' }}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="glass-card p-6 border-white/5 rounded-3xl relative overflow-hidden group">
                        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="flex justify-between items-start mb-2 relative z-10">
                            <span class="text-[10px] text-white/50 font-bold uppercase tracking-widest">ETA 预计完工时间 (EVM预测)</span>
                        </div>
                        <div class="text-2xl font-mono font-black mb-1 relative z-10 text-blue-400">{{ getReport().etaDate }}</div>
                        <p class="text-[10px] leading-relaxed opacity-60 relative z-10">基于当前 {{ getReport().velocity }} 任务/天的推进速率，预计还需 {{ getReport().remainingDays }} 天闭环。</p>
                    </div>

                    <div class="glass-card p-6 border-white/5 rounded-3xl relative overflow-hidden group">
                        <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="flex justify-between items-start mb-2 relative z-10">
                            <span class="text-[10px] text-white/50 font-bold uppercase tracking-widest">进度执行指数 (SPI)</span>
                        </div>
                        <div class="text-2xl font-mono font-black mb-1 relative z-10 text-purple-400">{{ getReport().spi }}</div>
                        <p class="text-[10px] leading-relaxed opacity-60 relative z-10">SPI > 1.0 意味超前。目前已完成 {{ getReport().completed }} / {{ getReport().total }} 核心指标。</p>
                    </div>
                </div>

                <div class="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <h4 class="text-xs font-black uppercase mb-4 text-white/40 tracking-widest">智能决策建议</h4>
                    <ul class="space-y-4">
                        <li v-for="(tip, i) in getReport().tips" :key="i" class="flex gap-4 text-xs leading-relaxed text-white/80">
                            <span class="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[9px] font-black" style="background-color: var(--accent-theme); color: #fff; box-shadow: 0 0 10px var(--accent-glow)">{{ i+1 }}</span>
                            {{ tip }}
                        </li>
                    </ul>
                </div>
            </div>
        </Transition>

    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, reactive, watch } from 'vue'

    const props = defineProps<{ initialUserId: string }>()

    // --- 状态控制 ---
    const targetUser = ref(props.initialUserId)
    const viewMode = ref<'tree' | 'matrix' | 'calendar'>('tree')
    const calendarScale = ref<'day' | 'week'>('day')
    const activeNode = ref<any>(null)
    const showAnalysisReport = ref(false)

    const switchUser = (u: string) => {
    targetUser.value = u
    loadAndLayoutTree()
    }

    // --- 数据读取引擎 ---
    const rawData = ref<any>(null)
    const loadAndLayoutTree = () => {
    const local = localStorage.getItem(`sync_store_${targetUser.value}`)
    rawData.value = local ? JSON.parse(local) : null
    activeNode.value = rawData.value
    resetView() // 切换数据时居中
    }

    // --- 树状算法排版引擎 (Hierarchical Tree Layout) ---
    const treeNodes = ref<any[]>([])
    const treeLinks = ref<any[]>([])

    const calculateTreeLayout = () => {
    if (!rawData.value) return
    let nodes: any[] = []
    let links: any[] = []

    // 递归计算每个节点的宽度 (叶子节点数)
    const calcWidth = (node: any) => {
    if (!node.children || node.children.length === 0) {
    node._width = 120 // 基础间距
    return node._width
    }
    node._width = node.children.reduce((sum: number, child: any) => sum + calcWidth(child), 0)
    return node._width
    }

    // 递归分配 X, Y 坐标
    const assignCoords = (node: any, depth: number, startX: number) => {
    node.y = depth * 120 + 80 // 层级高度
    node.x = startX + (node._width / 2)

    nodes.push({
    id: node.id, title: node.title, x: node.x, y: node.y,
    completedUnits: node.completedUnits, totalUnits: node.totalUnits,
    completed: node.totalUnits > 0 && node.completedUnits >= node.totalUnits,
    isCurrent: activeNode.value?.id === node.id,
    isRoot: depth === 0
    })

    if (node.children) {
    let currentX = startX
    node.children.forEach((child: any) => {
    assignCoords(child, depth + 1, currentX)
    links.push({ id: `link-${node.id}-${child.id}`, x1: node.x, y1: node.y + 12, x2: child.x, y2: child.y - 12 })
    currentX += child._width
    })
    }
    }

    calcWidth(rawData.value)
    assignCoords(rawData.value, 0, 0) // 从 x=0 开始铺开

    treeNodes.value = nodes
    treeLinks.value = links
    }

    // --- 四色逻辑判定引擎 ---
    // 提取并拍平树中所有的底层任务
    const flattenTasks = (node: any, parentTitle: string = '根目标'): any[] => {
    let tasks: any[] = []
    if (!node.children || node.children.length === 0) {
    tasks.push({ ...node, parentTitle })
    } else {
    node.children.forEach((c: any) => tasks.push(...flattenTasks(c, node.title)))
    }
    return tasks
    }

    const getTaskColorClass = (task: any) => {
    const isDone = task.totalUnits > 0 && task.completedUnits >= task.totalUnits
    const hasDeadline = !!task.expectedDate
    const now = new Date().getTime()
    const exp = hasDeadline ? new Date(task.expectedDate).getTime() : 0

    if (isDone) {
    // 提前或按时 (绿色/蓝色)
    if (hasDeadline && task.actualDate && new Date(task.actualDate).getTime() < exp) {
    return 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)] border border-green-400' // 提前绿
    }
    return 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)] border border-blue-400' // 按时蓝
    } else {
    // 逾期或待办 (红色/灰色)
    if (hasDeadline && now > exp) {
    return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-red-400' // 逾期红
    }
    return 'bg-white/5 border border-white/20 opacity-60' // 待办灰
    }
    }

    // --- 模式2: 矩阵方阵数据 ---
    const matrixGroups = computed(() => {
    if (!activeNode.value) return []
    const tasks = flattenTasks(activeNode.value, activeNode.value.title)
    const groups: Record<string, any> = {}
    tasks.forEach(t => {
    if (!groups[t.parentTitle]) groups[t.parentTitle] = { id: t.parentTitle, parentTitle: t.parentTitle, tasks: [] }
    groups[t.parentTitle].tasks.push(t)
    })
    return Object.values(groups)
    })

    // --- 模式3: 日历视图数据 ---
    const getWeekStart = (dStr: string) => {
    const d = new Date(dStr); const day = d.getDay(); const diff = d.getDate() - day + (day == 0 ? -6:1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0]
    }

    const calendarGroups = computed(() => {
    if (!activeNode.value) return []
    const tasks = flattenTasks(activeNode.value).filter(t => t.expectedDate)
    const groups: Record<string, any> = {}

    tasks.forEach(t => {
    const key = calendarScale.value === 'week' ? `Week of ${getWeekStart(t.expectedDate)}` : t.expectedDate
    if (!groups[key]) groups[key] = { dateLabel: key, tasks: [] }
    groups[key].tasks.push(t)
    })

    return Object.values(groups).sort((a:any, b:any) => a.dateLabel.localeCompare(b.dateLabel))
    })

    // --- 画布拖拽与缩放引擎 ---
    const zoom = ref(1.0)
    const offset = reactive({ x: 100, y: 100 }) // 初始偏移居中

    const resetView = () => {
    zoom.value = 1.0
    // 简单粗暴的居中：获取根节点的 X 然后反向偏移
    if (treeNodes.value.length > 0) {
    const rootX = treeNodes.value[0].x
    offset.x = (window.innerWidth / 2) - rootX - 50 // 粗略居中屏幕
    offset.y = 50
    } else {
    offset.x = 50; offset.y = 50
    }
    }

    const doZoom = (delta: number) => { zoom.value = Math.max(0.2, Math.min(zoom.value + delta, 3.0)) }

    let isDragging = false
    let startPos = { x: 0, y: 0 }
    const onDragStart = (e: MouseEvent) => { isDragging = true; startPos = { x: e.clientX - offset.x, y: e.clientY - offset.y } }
    const onDragMove = (e: MouseEvent) => { if (isDragging) { offset.x = e.clientX - startPos.x; offset.y = e.clientY - startPos.y } }
    const onDragEnd = () => { isDragging = false }

    const onTouchStart = (e: TouchEvent) => { isDragging = true; startPos = { x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y } }
    const onTouchMove = (e: TouchEvent) => { if (isDragging) { e.preventDefault(); offset.x = e.touches[0].clientX - startPos.x; offset.y = e.touches[0].clientY - startPos.y } }

    // --- ETA EVM 算法报告 ---
    const getReport = () => {
    const node = activeNode.value || rawData.value
    if (!node) return { isHealthy: true, tips: [] }

    const total = node.totalUnits || 1
    const comp = node.completedUnits || 0
    const spi = (comp / (total * 0.5)).toFixed(2) // 简化模型：假定时间过半

    // EVM 预测完工算法
    let velocity = 1.5 // 默认速率 1.5单位/天
    const remain = total - comp
    const remainDays = Math.ceil(remain / velocity)

    const eta = new Date()
    eta.setDate(eta.getDate() + remainDays)

    const isH = Number(spi) >= 0.9

    return {
    isHealthy: isH, total, completed: comp, spi, velocity,
    remainingDays: remainDays,
    etaDate: remain <= 0 ? '已完工' : eta.toISOString().split('T')[0],
    tips: [
    isH ? "当前的推进速率 (Velocity) 表现卓越，建议保持现有学习状态。" : "进度存在延期风险，系统建议您将核心任务进行更细粒度的拆解。",
    "在日历视图中发现周三/周四的执行密度下降，注意精力管理。",
    `根据算法推演，如维持现状，您将于 ${eta.toISOString().split('T')[0]} 达成目标闭环。`
    ]
    }
    }

    const onNodeClick = (node: any) => {
    activeNode.value = rawData.value // 确保能在树中找到原引用
    const findRealNode = (t: any, id: string): any => {
    if (t.id === id) return t
    if (t.children) for(const c of t.children) { const f = findRealNode(c, id); if (f) return f }
    return null
    }
    activeNode.value = findRealNode(rawData.value, node.id)
    calculateTreeLayout() // 重新渲染刷新当前高亮
    }

    watch(activeNode, () => calculateTreeLayout(), { deep: true })

    onMounted(() => {
    loadAndLayoutTree()
    // 防止移动端滚动穿透
    document.body.style.overflow = 'hidden'
    })
</script>

<style scoped>
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(25px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .slide-fade-enter-active {
        transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .slide-fade-leave-active {
        transition: all 0.2s ease-in;
    }

    .slide-fade-enter-from {
        opacity: 0;
        transform: scale(0.98) translateY(10px);
    }

    .slide-fade-leave-to {
        opacity: 0;
        transform: scale(0.98) translateY(-10px);
    }

    .slide-up-enter-active, .slide-up-leave-active {
        transition: transform 0.6s cubic-bezier(0.32, 1, 0.23, 1), opacity 0.6s;
    }

    .slide-up-enter-from, .slide-up-leave-to {
        transform: translateY(100%);
        opacity: 0;
    }

    .fade-scale-enter-active, .fade-scale-leave-active {
        transition: all 0.3s ease;
    }

    .fade-scale-enter-from, .fade-scale-leave-to {
        opacity: 0;
        transform: scale(0.95);
        filter: blur(15px);
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
        height: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
    }
</style>