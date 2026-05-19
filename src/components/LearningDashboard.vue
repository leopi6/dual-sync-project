<template>
    <div class="glass-card p-6 flex flex-col gap-6 relative overflow-hidden"
         :style="`--accent-theme: ${currentThemeColor}; --accent-glow: ${currentThemeGlow};`">
        <div class="flex justify-between items-start z-10 gap-4">
            <div class="flex-1 flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <span class="w-2 h-7 rounded-full shadow-[0_0_15px_var(--accent-glow)]" style="background-color: var(--accent-theme);"></span>
                    <h2 class="text-2xl font-black tracking-wider truncate flex-1" style="color: var(--text-color, #ffffff);">{{ planData.title }}</h2>
                    <button @click="openEditModal(planData, true)" class="opacity-50 hover:opacity-100 group"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                    <button @click="resetEntirePlan" class="opacity-30 hover:text-red-500"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>

                <div class="flex items-center gap-2 text-xs opacity-60">
                    <button v-if="activeModule.id !== planData.id" @click="goHome" class="px-2 py-1 bg-white/5 hover:bg-white/20 rounded-md transition-colors flex items-center gap-1 border border-white/10">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>主页
                    </button>
                    <span v-for="(node, index) in breadcrumbs" :key="node.id" class="flex items-center gap-1">
                        <span v-if="index > 0">/</span>
                        <button @click="jumpToLevel(node)" class="hover:opacity-100 transition-colors line-clamp-1 max-w-[80px]" :class="{'font-bold opacity-100': node.id === activeModule.id}">{{ node.title }}</button>
                    </span>
                </div>
            </div>

            <div class="text-right glass-card px-4 py-2 border-white/5 flex-shrink-0">
                <div class="text-xs opacity-50">{{ activeModule.id === planData.id ? '全局截止' : '阶段截止' }}</div>
                <div class="text-lg font-mono font-black mt-1" :class="getTimeStatus(activeModule).color">{{ getTimeStatus(activeModule).text }}</div>
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-8 items-center mt-2">

            <div class="relative w-64 h-64 flex-shrink-0 flex items-center justify-center">
                <div class="absolute inset-2 rounded-full border-[3px] border-white/10 z-20 pointer-events-none transition-all duration-500"
                     style="border-color: var(--accent-theme); box-shadow: 0 0 25px var(--accent-glow), inset 0 0 20px var(--accent-glow);">
                </div>

                <div class="absolute w-52 h-52 rounded-full bg-black/40 overflow-hidden z-10 transition-transform duration-300 hover:scale-105 border border-white/10 relative">
                    <div class="liquid-wave transition-all duration-1000 ease-out"
                         style="background: linear-gradient(to top, var(--accent-theme), rgba(255,255,255,0.2));"></div>

                    <div class="absolute inset-0 flex flex-col items-center justify-center z-30 drop-shadow-lg" style="color: var(--text-color, #ffffff);">
                        <span class="text-5xl font-black font-mono tracking-tighter">{{ safePercentage.toFixed(1) }}<span class="text-xl">%</span></span>
                        <span class="text-xs opacity-70 mt-2 uppercase tracking-widest text-center px-2 line-clamp-1">
                            {{ activeModule.completedUnits }} / {{ activeModule.totalUnits }} {{ activeModule.unitLabel }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="flex-1 w-full flex flex-col max-h-[320px] z-10">
                <div class="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-3">
                    <div v-for="child in activeModule.children || []" :key="child.id"
                         class="bg-white/5 hover:bg-white/10 transition-colors border border-white/5 rounded-xl p-3 cursor-pointer group flex flex-col gap-2 relative"
                         @click="handleNodeClick(child)">

                        <div class="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full border bg-black/50" :class="[getTimeStatus(child).color, 'border-'+getTimeStatus(child).color.split('-')[1]+'-500/30']">
                            {{ getTimeStatus(child).text }}
                        </div>

                        <div class="flex flex-col mb-1 pr-20" style="color: var(--text-color, #ffffff);">
                            <span class="font-medium text-sm truncate">{{ child.title }}</span>
                            <span v-if="child.note" class="text-[10px] opacity-40 truncate mt-0.5">复盘: {{ child.note }}</span>
                        </div>

                        <div class="flex justify-between items-center" style="color: var(--text-color, #ffffff);">
                            <span class="font-mono text-xs opacity-60 whitespace-nowrap">进度: {{ child.completedUnits }} / {{ child.totalUnits }} {{ child.unitLabel }}</span>
                            <div class="flex gap-1">
                                <button @click.stop="openEditModal(child, false)" class="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                <button @click.stop="deleteNode(child.id)" class="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>

                                <button v-if="(!child.children || child.children.length === 0) && child.completedUnits > 0"
                                        @click.stop="openCheckIn(child, 'undo')"
                                        class="ml-1 w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg" title="撤销进度">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                                </button>
                                <button v-if="!child.children || child.children.length === 0"
                                        @click.stop="openCheckIn(child, 'add')"
                                        class="ml-1 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg" title="完成打卡">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                </button>
                            </div>
                        </div>

                        <div class="w-full h-1.5 bg-black/50 rounded-full overflow-hidden mt-1 relative">
                            <div class="h-full rounded-full transition-all duration-1000 relative"
                                 :style="{ background: `linear-gradient(90deg, var(--accent-theme), rgba(255,255,255,0.6))`, boxShadow: `0 0 10px var(--accent-glow)`, width: `${child.totalUnits === 0 ? 0 : Number((Math.min((child.completedUnits / child.totalUnits) * 100, 100)).toFixed(1))}%` }"></div>
                        </div>
                    </div>

                    <div v-if="!activeModule.children || activeModule.children.length === 0" class="text-center py-6 opacity-30 text-sm">
                        本层级暂无细分，点击下方创建，或者直接打卡
                    </div>
                </div>

                <button @click="showAddModal = true" class="mt-4 py-3 w-full border border-dashed border-white/20 rounded-xl opacity-50 hover:opacity-100 hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    在 [{{ activeModule.title }}] 下新建细分计划
                </button>
            </div>
        </div>

        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div class="glass-card w-full max-w-md p-6 relative border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <button @click="closeEditAddModal" class="absolute top-4 right-4 text-white/40 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        <h3 class="text-xl font-black mb-6 text-white tracking-wider">{{ showEditModal ? '修改计划' : '新建计划子节点' }}</h3>
                        <div class="space-y-4">
                            <div><label class="block text-xs text-white/50 mb-1">名称</label><input v-model="editorForm.title" type="text" class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 font-bold"></div>
                            <div class="flex gap-4">
                                <div class="flex-1"><label class="block text-xs text-white/50 mb-1">总量设定 (子项为0)</label><input v-model.number="editorForm.totalUnits" type="number" class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 font-mono disabled:opacity-50" :disabled="nodeFormTotalValueIsLocked"></div>
                                <div class="flex-1"><label class="block text-xs text-white/50 mb-1">单位</label><input v-model="editorForm.unitLabel" type="text" class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" :disabled="nodeFormTotalValueIsLocked"></div>
                            </div>
                            <div><label class="block text-xs text-white/50 mb-1">截止日期</label><input v-model="editorForm.expectedDate" type="date" class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"></div>
                            <div class="flex gap-4 mt-8">
                                <button @click="closeEditAddModal" class="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all">取消</button>
                                <button @click="submitEditorForm" class="flex-1 py-3 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-black tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">{{ showEditModal ? '保存修改' : '确认创建' }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <Teleport to="body">
            <Transition name="fade-scale">
                <div v-if="showCheckInModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div class="glass-card w-full max-w-md p-6 relative border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <h3 class="text-xl font-bold mb-1 text-white">{{ checkInMode === 'add' ? '完成打卡记录' : '撤销打卡进度' }}</h3>
                        <p class="text-white/50 text-sm mb-4 line-clamp-1">当前进度: {{ targetModule?.completedUnits }} / {{ targetModule?.totalUnits }} {{ targetModule?.unitLabel }}</p>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs text-white/50 mb-1 uppercase tracking-widest">{{ checkInMode === 'add' ? '本次完成数量' : '需要撤回的数量' }}</label>
                                <input v-model.number="checkInForm.completedUnits" type="number" class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 font-mono" :class="checkInMode === 'add' ? 'focus:border-green-500 focus:ring-green-500' : 'focus:border-red-500 focus:ring-red-500'">
                            </div>
                            <div v-if="checkInMode === 'add'">
                                <label class="block text-xs text-white/50 mb-1 uppercase tracking-widest">实际完成日期</label>
                                <input v-model="checkInForm.actualDate" type="date" class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 [color-scheme:dark]">
                            </div>
                            <div v-if="checkInMode === 'add'">
                                <label class="block text-xs text-white/50 mb-1 uppercase tracking-widest">备注与复盘</label>
                                <textarea v-model="checkInForm.note" rows="2" class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none resize-none" placeholder="记录一些心得..."></textarea>
                            </div>
                            <div class="flex gap-4 mt-6">
                                <button @click="showCheckInModal = false" class="flex-1 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">取消</button>
                                <button @click="submitCheckIn" class="flex-1 py-2 rounded-xl text-white font-bold transition-all shadow-lg" :class="checkInMode === 'add' ? 'bg-green-600 hover:bg-green-500 shadow-green-500/30' : 'bg-red-600 hover:bg-red-500 shadow-red-500/30'">
                                    {{ checkInMode === 'add' ? '保存记录' : '确认扣减' }}
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

    // --- 树操作核心算法 ---
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

    // 为解决热刷新或路由切换导致的数据丢失，我们在此作用域外使用一个简单的缓存。
    // 正式部署后，这里会走 API fetch 数据。
    const globalStore = ref<Record<string, PlanNode>>({ him: initData('him'), her: initData('her') })

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
    if (!node.expectedDate) return { text: '未设截止', color: 'text-white/40' }
    const expected = new Date(node.expectedDate).getTime()
    const diffTime = expected - new Date().getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isCompleted = node.totalUnits > 0 && node.completedUnits >= node.totalUnits

    if (isCompleted) return { text: `目标已达成`, color: 'text-green-400' }
    if (diffDays < 0) return { text: `已逾期 ${Math.abs(diffDays)} 天`, color: 'text-red-400 font-bold' }
    if (diffDays === 0) return { text: `今天决战`, color: 'text-yellow-400' }
    return { text: `倒计时 ${diffDays} 天`, color: 'text-blue-400' }
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
    closeEditAddModal()
    }

    const resetEntirePlan = () => {
    if (window.confirm('警告！确定清除吗？')) {
    planData.value = initData(props.userId)
    globalStore.value[props.userId] = planData.value
    goHome()
    }
    }

    const deleteNode = (nodeId: string) => { if (window.confirm('确定删除该节点及下属层级吗？')) deleteNodeFromTree(planData.value, nodeId) }

    // --- 打卡与撤销核心逻辑 ---
    const showCheckInModal = ref(false);
    const checkInMode = ref<'add'|'undo'>('add'); // 标识当前操作类型
    const targetModule = ref<PlanNode | null>(null)
    const getToday = () => new Date().toISOString().split('T')[0]
    const checkInForm = ref({ completedUnits: 0, actualDate: getToday(), note: '' })

    const openCheckIn = (module: PlanNode, mode: 'add'|'undo') => {
    targetModule.value = module
    checkInMode.value = mode
    checkInForm.value = {
    completedUnits: mode === 'add' ? (module.totalUnits - module.completedUnits) : module.completedUnits, // 智能填充预期值
    actualDate: getToday(),
    note: module.note || ''
    }
    showCheckInModal.value = true
    }

    const submitCheckIn = () => {
    if (targetModule.value && checkInForm.value.completedUnits > 0) {
    if (checkInMode.value === 'add') {
    targetModule.value.completedUnits += checkInForm.value.completedUnits
    if (targetModule.value.completedUnits >= targetModule.value.totalUnits) {
    targetModule.value.completedUnits = targetModule.value.totalUnits
    targetModule.value.actualDate = checkInForm.value.actualDate
    }
    targetModule.value.note = checkInForm.value.note
    } else {
    // 撤销逻辑
    targetModule.value.completedUnits -= checkInForm.value.completedUnits
    if (targetModule.value.completedUnits <= 0) {
    targetModule.value.completedUnits = 0
    targetModule.value.actualDate = undefined // 进度清零则撤销日期
    }
    }
    }
    showCheckInModal.value = false
    }

    // 解决问题四：监听属性变化，强制从本地全局池拉取
    watch(() => props.userId, (newId) => {
    planData.value = globalStore.value[newId]
    goHome()
    })

    defineExpose({ goHome })
</script>

<style scoped>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
    }

    /* 问题三修复：绝对定位的水位算法 */
    .liquid-wave {
        width: 200%;
        height: 200%;
        position: absolute;
        left: -50%;
        /* 核心：根据进度百分比动态计算 top 绝对高度 */
        top: calc(100% - v-bind('safePercentage') * 1%);
        border-radius: 40%;
        animation: spin 6s linear infinite;
        transform-origin: 50% 50%;
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
        transition: all 0.2s ease;
    }

    .fade-scale-enter-from, .fade-scale-leave-to {
        opacity: 0;
        transform: scale(0.95);
    }
</style>