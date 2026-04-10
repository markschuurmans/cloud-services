<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '@/services/api'

type Target = {
  id?: string
  _id?: string
  competitionId: string
  title: string
  imageUrl: string
  locationName?: string
  tags?: string[]
  createdAt?: string
}

const loading = ref(false)
const error = ref('')
const targets = ref<Target[]>([])

function normalizeImageUrl(url: string | undefined) {
  if (!url) {
    return ''
  }

  const marker = '/uploads/'
  const markerIndex = url.indexOf(marker)
  if (markerIndex === -1) {
    return url
  }

  const fileName = url.slice(markerIndex + marker.length)
  return `/media/uploads/${fileName}`
}

const sortedTargets = computed(() => {
  return [...targets.value].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
  })
})

async function fetchTargets() {
  loading.value = true
  error.value = ''

  try {
    targets.value = await apiRequest<Target[]>('/api/target/targets')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Targets ophalen mislukt'
  } finally {
    loading.value = false
  }
}

onMounted(fetchTargets)
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8">
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Alle targets</h1>
          <p class="text-sm text-muted-foreground">Data uit `target-service` via `/api/target/targets`.</p>
        </div>
        <button
          type="button"
          :disabled="loading"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          @click="fetchTargets"
        >
          {{ loading ? 'Verversen...' : 'Ververs' }}
        </button>
      </div>

      <p v-if="error" class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        {{ error }}
      </p>

      <ul v-if="sortedTargets.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="target in sortedTargets"
          :key="target.id || target._id"
          class="overflow-hidden rounded-xl border bg-card shadow-sm"
        >
          <img
            v-if="normalizeImageUrl(target.imageUrl)"
            :src="normalizeImageUrl(target.imageUrl)"
            :alt="target.title"
            class="aspect-4/3 w-full object-cover"
            loading="lazy"
          >

          <div class="space-y-2 p-4">
            <h2 class="font-semibold">{{ target.title }}</h2>
            <p class="text-sm text-muted-foreground"><strong>Competitie:</strong> {{ target.competitionId }}</p>
            <p class="text-sm text-muted-foreground"><strong>Locatie:</strong> {{ target.locationName || '-' }}</p>
            <p class="text-sm text-muted-foreground"><strong>Tags:</strong> {{ (target.tags || []).join(', ') || '-' }}</p>
          </div>
        </li>
      </ul>

      <p v-else-if="!loading" class="text-sm text-muted-foreground">Nog geen targets gevonden.</p>
    </section>
  </main>
</template>


