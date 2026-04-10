<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authToken, clearToken } from '@/services/auth.ts'

const router = useRouter()
const isAuthenticated = computed(() => Boolean(authToken.value))

async function logout() {
  clearToken()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="border-b bg-card/80 backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div>
          <h1 class="text-lg font-semibold">Photo Prestiges</h1>
          <p class="text-sm text-muted-foreground">Vue + shadcn frontend in microservices setup</p>
        </div>

        <nav class="flex items-center gap-2">
          <router-link
            to="/targets"
            class="rounded-md border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Targets
          </router-link>
          <router-link
            v-if="isAuthenticated"
            to="/targets/create"
            class="rounded-md border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Target aanmaken
          </router-link>
          <router-link
            v-if="!isAuthenticated"
            to="/login"
            class="rounded-md border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Login
          </router-link>
          <button
            v-else
            type="button"
            class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            @click="logout"
          >
            Uitloggen
          </button>
        </nav>
      </div>
    </header>

    <router-view />
  </div>
</template>
