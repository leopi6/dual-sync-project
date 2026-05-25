<template>
    <div class="glass-card p-4 sm:p-6 flex flex-col gap-5 sm:gap-6 relative overflow-hidden w-full select-none"
         :style="`--accent-theme: ${currentThemeColor}; --accent-glow: ${currentThemeGlow};`">

        <div class="flex flex-col sm:flex-row justify-between items-start z-10 gap-3 w-full border-b border-white/5 pb-4">
            <div class="flex-1 flex flex-col gap-2 min-w-0 w-full">
                <div class="flex items-center gap-2.5 w-full">
                    <span class="w-1.5 h-6 rounded-full shadow-[0_0_15px_var(--accent-glow)] flex-shrink-0" style="background-color: var(--accent-theme);"></span>
                    <h2 class="text-xl sm:text-2xl font-black tracking-wider truncate flex-1 text-white" style="color: var(--text-color, #ffffff);">{{ planData.title }}</h2>
                    <div class="flex items-center gap-1 flex-shrink-0">
                        <button @click="openEditModal(planData, true)" class="p-2 opacity-50 hover:opacity-100 active:scale-90 transition-all"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                        <button @click="resetEntirePlan" class="p-2 opacity-30 hover:text-red-500 active:scale-90 transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                </div>

                <div class="flex items-center gap-1.5 text-xs opacity-60 overflow-x-auto whitespace-nowrap custom-scrollbar py-0.5">
                    <button v-if="activeModule.id !== planData.id" @click="goHome" class="px-2 py-1 bg-white/5 hover:bg-white/20 rounded-md transition-colors flex items-center gap-1 border border-white/10 flex-shrink-0 text-white">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>大盘
                    </button>
                    <span v-for="(node, index) in breadcrumbs" :key="node.id" class="flex items-center gap-1 text-white">
                        <span v-if="index > 0" class="opacity-40">/</span>
                        <button @click="jumpToLevel(node)" class="hover:opacity-100 transition-colors truncate max-w-[90px]" :class="{'font-bold opacity-100 underline decoration-wavy': node.id === activeModule.id}">{{ node.title }}</button>
                    </span>
                </div>
            </div>

            <div class="w-full sm:w-auto text-left sm:text-right bg-white/5 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-white/5 sm:border-0 flex-shrink-0">
                <div class="text-[10px] sm:text-xs opacity-50 uppercase tracking-widest">{{ activeModule.id === planData.id ? '全局大目标截止' : '阶段细分节点截止' }}</div>
                <div class="text-base sm:text-lg font-mono font-black mt-0.5 tracking-tight" :class="getTimeStatus(activeModule).color">{{ getTimeStatus(activeModule).text }}</div>
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-6 md:gap-8 items-center mt-1 w-full">
            <div class="relative w-48 h-48 sm:w-64 sm:h-64 flex-shrink-0 flex items-center justify-center">
                <div class="absolute inset-1 rounded-full border-[3px] border-white/10 z-20 pointer-events-none transition-all duration-500"
                     :style="`border-color: var(--accent-theme); box-shadow: 0 0 25px var(--accent-glow), inset 0 0 20px var(--accent-glow);`">
                </div>

                <div class="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-black/50 overflow-hidden z-10 border border-white/10 relative">
                    <div class="liquid-wave transition-all duration-1000 ease-out"
                         style="background: linear-gradient(to top, var(--accent-theme), rgba(255,255,255,0.15));"></div>

                    <div class="absolute inset-0 flex flex-col items-center justify-center z-30 drop-shadow-md" style="color: var(--text-color, #ffffff);">
                        <span class="text-4xl sm:text-5xl font-black font-mono tracking-tighter">{{ safePercentage.toFixed(1) }}<span class="text-lg sm:text-xl ml-0.5">%</span></span>
                        <span class="text-[10px] sm:text-xs opacity-70 mt-1.5 uppercase tracking-widest text-center px-3 line-clamp-1">
                            {{ activeModule.completedUnits }} / {{ activeModule.totalUnits }} {{ activeModule.unitLabel }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="flex-1 w-full flex flex-col max-h-[340px] z-10">
                <div class="overflow-y-auto pr-1 custom-scrollbar flex-1 space-y-2.5 touch-pan-y">
                    <div v-for="child in activeModule.children || []" :key="child.id"
                         class="bg-white/5 border border-white/5 rounded-xl p-3 cursor-pointer group flex flex-col gap-2 relative active:bg-white/10 transition-colors"
                         @click="handleNodeClick(child)">

                        <div class="absolute top-2.5 right-3 text-[9px] px-2 py-0.5 rounded-full border bg-black/60 font-medium" :class="[getTimeStatus(child).color, 'border-'+getTimeStatus(child).color.split('-')[1]+'-500/20']">
                            {{ getTimeStatus(child).text }}
                        </div>

                        <div class="flex flex-col mb-0.5 pr-20" style="color: var(--text-color, #ffffff);">
                            <span class="font-bold text-sm truncate opacity-90">{{ child.title }}</span>
                            <span v-if="child.note" class="text-[10px] opacity-40 truncate mt-1">📝 {{ child.note }}</span>
                        </div>

                        <div class="flex justify-between items-center h-7" style="color: var(--text-color, #ffffff);">
                            <span class="font-mono text-xs opacity-50 whitespace-nowrap">进度: {{ child.completedUnits }}/{{ child.totalUnits }} {{ child.unitLabel }}</span>
                            <div class="flex gap-1">
                                <button @click.stop="openEditModal(child, false)" class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center sm:opacity-0 group-hover:opacity-100 active:bg-white/20 transition-all"><svg class="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                <button @click.stop="deleteNode(child.id)" class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center sm:opacity-0 group-hover:opacity-100 active:bg-red-500/20 transition-all"><svg class="w-3.5 h-3.5 text-red-400 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>

                                <button v-if="(!child.children || child.children.length === 0) && child.completedUnits > 0"
                                        @click.stop="openCheckIn(child, 'undo')"
                                        class="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center active:scale-90 transition-all" title="回撤进度">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                                </button>
                                <button v-if="!child.children || child.children.length === 0"
                                        @click.stop="openCheckIn(child, 'add')"
                                        class="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/20 text-green-400 flex items-center justify-center active:scale-90 transition-all" title="打卡增加">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                </button>
                            </div>
                        </div>

                        <div class="w-full h-1 bg-black/40 rounded-full overflow-hidden mt-0.5">
                            <div class="h-full rounded-full transition-all duration-700"
                                 :style="{ background: `linear-gradient(90deg, var(--accent-theme), rgba(255,255,255,0.5))`, boxShadow: `0 0 10px var(--accent-glow)`, width: `${child.totalUnits === 0 ? 0 : Number((Math.min((child.completedUnits / child.totalUnits) * 100, 100)).toFixed(1))}%` }"></div>
                        </div>
                    </div>

                    <div v-if="!activeModule.children || activeModule.children.length === 0" class="text-center py-8 opacity-30 text-xs tracking-widest uppercase">
                        本节点下暂无更深细分
                    </div>
                </div>

                <button @click="showAddModal = true" class="mt-3 py-3.5 w-full border border-dashed border-white/20 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/5 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    在当下层级建立细分子任务
                </button>
            </div>
        </div>

        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div class="glass-card w-full max-w-md p-6 relative border-white/20 shadow-2xl" style="color: var(--text-color, #ffffff);">
                        <button @click="closeEditAddModal" class="absolute top-4 right-4 opacity-50 p-1"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        <h3 class="text-lg font-black mb-5 tracking-wider">{{ showEditModal ? '修正目标参数' : '向下追加子任务' }}</h3>
                        <div class="space-y-4">
                            <div><label class="block text-xs opacity-50 mb-1">模块名称</label><input v-model="editorForm.title" type="text" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 font-bold"></div>
                            <div class="flex gap-4">
                                <div class="flex-1"><label class="block text-xs opacity-50 mb-1">指标总量 (无子项时生效)</label><input v-model.number="editorForm.totalUnits" type="number" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none font-mono disabled:opacity-30" :disabled="nodeFormTotalValueIsLocked"></div>
                                <div class="flex-1"><label class="block text-xs opacity-50 mb-1">计量单位</label><input v-model="editorForm.unitLabel" type="text" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none disabled:opacity-30" :disabled="nodeFormTotalValueIsLocked"></div>
                            </div>
                            <div><label class="block text-xs opacity-50 mb-1">时间节点 (倒计时截止)</label><input v-model="editorForm.expectedDate" type="date" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none [color-scheme:dark]"></div>
                            <div class="flex gap-3 mt-6">
                                <button @click="closeEditAddModal" class="flex-1 py-3 rounded-xl bg-white/5 font-bold active:bg-white/10">取消</button>
                                <button @click="submitEditorForm" class="flex-1 py-3 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 to-purple-600 active:brightness-90">确认保存</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showCheckInModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div class="glass-card w-full max-w-md p-6 relative border-white/20 shadow-2xl" style="color: var(--text-color, #ffffff);">
                        <h3 class="text-lg font-black mb-2">{{ checkInMode === 'add' ? '学习指标打卡' : '逆向撤销进度' }}</h3>
                        <p class="opacity-50 text-xs mb-4">实时水位: {{ targetModule?.completedUnits }} / {{ targetModule?.totalUnits }} {{ targetModule?.unitLabel }}</p>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs opacity-50 mb-1 uppercase font-bold">{{ checkInMode === 'add' ? '本次录入数量' : '需要扣减的数量' }}</label>
                                <input v-model.number="checkInForm.completedUnits" type="number" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none font-mono" :class="checkInMode === 'add' ? 'focus:border-green-500' : 'focus:border-red-500'">
                            </div>
                            <div v-if="checkInMode === 'add'">
                                <label class="block text-xs opacity-50 mb-1 uppercase font-bold">闭环完成日期</label>
                                <input v-model="checkInForm.actualDate" type="date" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none [color-scheme:dark]">
                            </div>
                            <div v-if="checkInMode === 'add'">
                                <label class="block text-xs opacity-50 mb-1 uppercase font-bold">复盘与避坑备注</label>
                                <textarea v-model="checkInForm.note" rows="2" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none resize-none" placeholder="写点复盘笔记..."></textarea>
                            </div>
                            <div class="flex gap-3 mt-6">
                                <button @click="showCheckInModal = false" class="flex-1 py-2.5 rounded-xl bg-white/5 active:bg-white/10">取消</button>
                                <button @click="submitCheckIn" class="flex-1 py-2.5 rounded-xl text-white font-bold transition-all" :class="checkInMode === 'add' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'">
                                    {{ checkInMode === 'add' ? '确认同步' : '确认扣减' }}
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
    import { ref, computed, watch } from 'vue'

    const props = defineProps<{ userId: string }>()
    const currentThemeColor = computed(() => getComputedStyle(document.documentElement).getPropertyValue('--accent-theme').trim() || '#3b82f6')
    const currentThemeGlow = computed(() => getComputedStyle(document.documentElement).getPropertyValue('--accent-glow').trim() || 'rgba(59, 130, 246, 0.5)')

    const modifyNodeInTree = (tree: PlanNode, targetId: string, payload: Partial<PlanNode>): boolean => {
    if (tree.id === targetId) { Object.assign(tree, payload); return true }
    if (tree.children) { for (const child of tree.children) { if (modifyNodeInTree(child, targetId, payload)) return true } }
    return false
    }
    const deleteNodeFromTree = (tree: PlanNode, targetId: string): boolean => {
    if (tree.children) {
    const index = tree.children.findIndex(child => child.id === targetId)
    if (index !== -1) { tree.children.splice(index, 1); return true }
    for (const child of tree.children) { if (deleteNodeFromTree(child, targetId)) return true }
    }
    return false
    }

    interface PlanNode {
    id: string; parentId: string | null; title: string; totalUnits: number; completedUnits: number;
    unitLabel: string; expectedDate?: string; actualDate?: string; note?: string; children?: PlanNode[];
    }
    const initData = (userId: string): PlanNode => ({
    id: `root-${userId}`, parentId: null, title: '请填写全局大目标', totalUnits: 0, completedUnits: 0, unitLabel: '进度', expectedDate: undefined, children: []
    })
    const loadLocalData = (userId: string): PlanNode => {
    const local = localStorage.getItem(`sync_store_${userId}`)
    return local ? JSON.parse(local) : initData(userId)
    }

    const globalStore = ref<Record<string, PlanNode>>({
    him: loadLocalData('him'),
    her: loadLocalData('her')
    })

    const planData = ref<PlanNode>(globalStore.value[props.userId])
    const activeModule = ref<PlanNode>(planData.value)
    const historyStack = ref<PlanNode[]>([])
    const breadcrumbs = computed(() => [planData.value, ...historyStack.value])

    const focusModule = (module: PlanNode) => {
    if (!module.children) module.children = []
    historyStack.value.push(module); activeModule.value = module
    }
    const handleNodeClick = (node: PlanNode) => { focusModule(node) }
    const jumpToLevel = (targetNode: PlanNode) => {
    if (targetNode.id === planData.value.id) { goHome(); return; }
    const index = historyStack.value.findIndex(n => n.id === targetNode.id)
    if (index !== -1) { historyStack.value = historyStack.value.slice(0, index + 1); activeModule.value = targetNode; }
    }
    const goHome = () => { historyStack.value = []; activeModule.value = planData.value; }

    const getTimeStatus = (node: PlanNode) => {
    if (!node.expectedDate) return { text: '未设截止时间', color: 'text-white/40' }
    const expected = new Date(node.expectedDate).getTime()
    const diffTime = expected - new Date().getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isCompleted = node.totalUnits > 0 && node.completedUnits >= node.totalUnits

    if (isCompleted) return { text: `核心目标已全面达标`, color: 'text-green-400' }
    if (diffDays < 0) return { text: `已逾期避险 ${Math.abs(diffDays)} 天`, color: 'text-red-400 font-black' }
    if (diffDays === 0) return { text: `今日决战截止`, color: 'text-yellow-400 animate-pulse' }
    return { text: `距计划线剩余 ${diffDays} 天`, color: 'text-blue-400 font-bold' }
    }

    const calculateProgressInTree = (node: PlanNode): { comp: number, total: number } => {
    if (!node.children || node.children.length === 0) { return { comp: node.completedUnits, total: node.totalUnits } }
    let totalComp = 0, totalTarget = 0
    node.children.forEach(child => {
    const childStats = calculateProgressInTree(child)
    totalComp += childStats.comp; totalTarget += childStats.total
    })
    node.completedUnits = totalComp; node.totalUnits = totalTarget
    return { comp: totalComp, total: totalTarget }
    }

    const safePercentage = computed(() => {
    calculateProgressInTree(planData.value)
    if (activeModule.value.totalUnits === 0) return 0
    const pct = (activeModule.value.completedUnits / activeModule.value.totalUnits) * 100
    return isNaN(pct) ? 0 : Math.min(Math.max(pct, 0), 100)
    })

    const persistData = () => {
    calculateProgressInTree(planData.value)
    localStorage.setItem(`sync_store_${props.userId}`, JSON.stringify(planData.value))
    }

    const showAddModal = ref(false); const showEditModal = ref(false);
    const isEditingRoot = ref(false); const editingNodeId = ref<string | null>(null);
    const editorForm = ref({ title: '', totalUnits: 0, unitLabel: '', expectedDate: '' })

    const nodeFormTotalValueIsLocked = computed(() => {
    if (!showEditModal.value || isEditingRoot.value || !editingNodeId.value) return false
    const target = findNode(planData.value, editingNodeId.value)
    return !!(target && target.children && target.children.length > 0)
    })

    const findNode = (t: PlanNode, id: string): PlanNode | null => {
    if (t.id === id) return t
    if (t.children) { for (const c of t.children) { const found = findNode(c, id); if (found) return found } }
    return null
    }

    const openEditModal = (node: PlanNode, isRoot: boolean) => {
    isEditingRoot.value = isRoot; editingNodeId.value = node.id
    editorForm.value = { title: node.title, totalUnits: node.totalUnits, unitLabel: node.unitLabel || '', expectedDate: node.expectedDate || '' }
    showEditModal.value = true
    }
    const closeEditAddModal = () => {
    showAddModal.value = false; showEditModal.value = false; isEditingRoot.value = false; editingNodeId.value = null;
    editorForm.value = { title: '', totalUnits: 0, unitLabel: '', expectedDate: '' }
    }

    const submitEditorForm = () => {
    if (!editorForm.value.title) return
    if (showEditModal.value) {
    modifyNodeInTree(planData.value, editingNodeId.value!, {
    title: editorForm.value.title, totalUnits: nodeFormTotalValueIsLocked.value ? undefined : editorForm.value.totalUnits,
    unitLabel: nodeFormTotalValueIsLocked.value ? undefined : editorForm.value.unitLabel, expectedDate: editorForm.value.expectedDate || undefined,
    })
    } else if (showAddModal.value) {
    const newNode: PlanNode = {
    id: `node-${Date.now()}`, parentId: activeModule.value.id, title: editorForm.value.title,
    totalUnits: editorForm.value.totalUnits || 0, completedUnits: 0, unitLabel: editorForm.value.unitLabel || '项', expectedDate: editorForm.value.expectedDate || undefined, children: []
    }
    if (!activeModule.value.children) activeModule.value.children = []
    activeModule.value.children.push(newNode)
    }
    closeEditAddModal(); persistData()
    }

    const resetEntirePlan = () => {
    if (window.confirm('确定要清除当前视角的所有计划吗？')) {
    planData.value = initData(props.userId); globalStore.value[props.userId] = planData.value; persistData(); goHome()
    }
    }
    const deleteNode = (nodeId: string) => {
    if (window.confirm('彻底丢弃该子节点及其连带层级吗？')) { deleteNodeFromTree(planData.value, nodeId); persistData() }
    }

    const showCheckInModal = ref(false); const checkInMode = ref<'add'|'undo'>('add'); const targetModule = ref<PlanNode | null>(null)
    const getToday = () => new Date().toISOString().split('T')[0]
    const checkInForm = ref({ completedUnits: 0, actualDate: getToday(), note: '' })

    const openCheckIn = (module: PlanNode, mode: 'add'|'undo') => {
    targetModule.value = module; checkInMode.value = mode
    checkInForm.value = { completedUnits: mode === 'add' ? (module.totalUnits - module.completedUnits) : module.completedUnits, actualDate: getToday(), note: module.note || '' }
    showCheckInModal.value = true
    }
    const submitCheckIn = () => {
    if (targetModule.value && checkInForm.value.completedUnits > 0) {
    if (checkInMode.value === 'add') {
    targetModule.value.completedUnits += checkInForm.value.completedUnits
    if (targetModule.value.completedUnits >= targetModule.value.totalUnits) {
    targetModule.value.completedUnits = targetModule.value.totalUnits; targetModule.value.actualDate = checkInForm.value.actualDate
    }
    targetModule.value.note = checkInForm.value.note
    } else {
    targetModule.value.completedUnits -= checkInForm.value.completedUnits
    if (targetModule.value.completedUnits <= 0) { targetModule.value.completedUnits = 0; targetModule.value.actualDate = undefined }
    }
    }
    showCheckInModal.value = false; persistData()
    }

    watch(() => props.userId, (newId) => { planData.value = globalStore.value[newId]; goHome() })
    defineExpose({ goHome })
</script>

<style scoped>
    .custom-scrollbar::-webkit-scrollbar {
        width: 0px;
        height: 0px;
    }
    /* 移动端完全隐藏侧边滚动条 */
    .liquid-wave {
        width: 200%;
        height: 200%;
        position: absolute;
        left: -50%;
        top: calc(100% - v-bind('safePercentage') * 1%);
        border-radius: 42%;
        animation: spin 7s linear infinite;
        transform-origin: 50% 50%;
        will-change: transform;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    .fade-scale-enter-active, .fade-scale-leave-active {
        transition: all 0.25s ease;
    }

    .fade-scale-enter-from, .fade-scale-leave-to {
        opacity: 0;
        transform: scale(0.96);
    }
</style>