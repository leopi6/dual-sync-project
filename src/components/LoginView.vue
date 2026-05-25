<template>
    <div class="fixed inset-0 z-[500] flex items-center justify-center bg-[#060818] text-white p-6 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse" style="animation-delay: 2s;"></div>

        <div class="glass-card w-full max-w-sm p-8 relative z-10 border border-white/10 shadow-2xl flex flex-col items-center">
            <h1 class="text-3xl font-black tracking-widest font-mono mb-2">DUAL <span class="opacity-50">SYNC</span></h1>
            <p class="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-8">Spatial Identity Authentication</p>

            <Transition name="slide-fade" mode="out-in">
                <div v-if="!isAdminMode" class="w-full space-y-5" key="login">
                    <div class="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        <button v-for="u in ['HIS', 'HER']" :key="u" @click="loginForm.username = u"
                                class="flex-1 py-3 text-xs font-black tracking-widest rounded-lg transition-all"
                                :class="loginForm.username === u ? 'bg-white/15 text-white shadow-md' : 'text-white/40'">
                            {{ u }}
                        </button>
                    </div>

                    <div class="relative">
                        <input v-model="loginForm.password" type="password" placeholder="Access Code"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-center font-mono tracking-widest focus:outline-none focus:border-[var(--accent-theme)] transition-colors">
                    </div>

                    <button @click="handleLogin" class="w-full py-3.5 rounded-xl font-black tracking-widest text-sm bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/5 mt-2">
                        INITIATE SYNC
                    </button>

                    <button @click="isAdminMode = true" class="w-full text-center text-[10px] opacity-30 hover:opacity-100 transition-opacity mt-4 underline decoration-dashed">
                        Admin Override
                    </button>
                </div>

                <div v-else class="w-full space-y-4" key="admin">
                    <h3 class="text-xs font-bold text-red-400 text-center mb-4 uppercase tracking-widest">Security Override</h3>
                    <input v-model="adminCode" type="password" placeholder="Admin Code (88888)" class="w-full bg-black/40 border border-red-500/30 rounded-xl px-4 py-3 text-center focus:outline-none">
                    <button v-if="adminCode === '88888'" @click="resetPasswords" class="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-bold active:scale-95 text-xs">
                        Reset All Passwords to Default
                    </button>
                    <button @click="isAdminMode = false; adminCode = ''" class="w-full py-2 text-[10px] opacity-50">Cancel</button>
                </div>
            </Transition>

            <p v-if="errorMsg" class="absolute bottom-3 text-[10px] text-red-400 animate-pulse">{{ errorMsg }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'

    const emit = defineEmits(['auth-success'])

    const loginForm = ref({ username: 'HIS', password: '' })
    const isAdminMode = ref(false)
    const adminCode = ref('')
    const errorMsg = ref('')

    // 初始化默认密码库 (Base64混淆模拟加密)
    const initAuth = () => {
    if (!localStorage.getItem('sync_auth')) {
    localStorage.setItem('sync_auth', JSON.stringify({
    'HIS': btoa('123888'),
    'HER': btoa('123888')
    }))
    }
    }

    onMounted(initAuth)

    const handleLogin = () => {
    const db = JSON.parse(localStorage.getItem('sync_auth') || '{}')
    if (btoa(loginForm.value.password) === db[loginForm.value.username]) {
    localStorage.setItem('sync_current_user', loginForm.value.username.toLowerCase())
    emit('auth-success', loginForm.value.username.toLowerCase())
    } else {
    errorMsg.value = 'ACCESS DENIED: Invalid Code'
    setTimeout(() => errorMsg.value = '', 2000)
    }
    }

    const resetPasswords = () => {
    localStorage.removeItem('sync_auth')
    initAuth()
    errorMsg.value = 'SYS: Credentials Reset'
    setTimeout(() => { errorMsg.value = ''; isAdminMode.value = false }, 2000)
    }
</script>

<style scoped>
    .glass-card {
        backdrop-filter: blur(20px);
        border-radius: 2rem;
        background: rgba(255,255,255,0.03);
    }

    .slide-fade-enter-active {
        transition: all 0.3s ease-out;
    }

    .slide-fade-leave-active {
        transition: all 0.2s ease-in;
    }

    .slide-fade-enter-from {
        opacity: 0;
        transform: translateY(10px);
    }

    .slide-fade-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }
</style>