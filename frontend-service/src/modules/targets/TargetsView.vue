<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus, RefreshCw } from 'lucide-vue-next'
import { apiRequest } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type Target = {
  id?: string
  _id?: string
  title: string
  imageUrl: string
  locationName?: string
  tags?: string[]
  createdAt?: string
}

const loading = ref(false)
const error = ref('')
const targets = ref<Target[]>([])
const registeringTargetId = ref('')

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

function formatDate(dateValue: string | undefined) {
  if (!dateValue) {
	return '-'
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
	return '-'
  }

  return new Intl.DateTimeFormat('nl-NL', {
	year: 'numeric',
	month: 'short',
	day: '2-digit',
  }).format(date)
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

async function registerForTarget(targetId: string) {
  registeringTargetId.value = targetId
  error.value = ''

  try {
	await apiRequest(`/api/register/targets/${targetId}/register`, {
	  method: 'POST',
	})
  } catch (err) {
	error.value = err instanceof Error ? err.message : 'Inschrijven voor target mislukt'
  } finally {
	registeringTargetId.value = ''
  }
}

onMounted(fetchTargets)
</script>

<template>
  <main class="mx-auto w-full max-w-7xl px-4 py-8">
	<section class="space-y-5">
	  <div class="flex flex-wrap items-center justify-between gap-3">
		<div>
		  <h1 class="text-2xl font-semibold tracking-tight">Targets</h1>
		  <p class="text-sm text-muted-foreground">Overzicht van alle beschikbare targets.</p>
		</div>
		<div class="flex items-center gap-2">
		  <Button as-child>
			<router-link to="/targets/create">
			  <Plus class="mr-2 size-4" />
			  Target aanmaken
			</router-link>
		  </Button>
		  <Button type="button" variant="outline" :disabled="loading" @click="fetchTargets">
			<RefreshCw class="mr-2 size-4" :class="{ 'animate-spin': loading }" />
			{{ loading ? 'Verversen...' : 'Ververs' }}
		  </Button>
		</div>
	  </div>

	  <Card v-if="error" class="border-destructive/40 bg-destructive/5">
		<CardHeader>
		  <CardTitle>Targets laden mislukt</CardTitle>
		  <CardDescription>{{ error }}</CardDescription>
		</CardHeader>
		<CardFooter>
		  <Button type="button" variant="destructive" @click="fetchTargets">Opnieuw proberen</Button>
		</CardFooter>
	  </Card>

	  <div v-else-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		<Card v-for="item in 6" :key="item" class="overflow-hidden py-0">
		  <div class="aspect-[4/3] w-full animate-pulse bg-muted" />
		  <CardHeader>
			<div class="h-5 w-3/4 animate-pulse rounded bg-muted" />
			<div class="h-4 w-1/2 animate-pulse rounded bg-muted" />
		  </CardHeader>
		  <CardContent class="space-y-2">
			<div class="h-4 w-full animate-pulse rounded bg-muted" />
			<div class="h-4 w-5/6 animate-pulse rounded bg-muted" />
		  </CardContent>
		</Card>
	  </div>

	  <Card v-else-if="!sortedTargets.length">
		<CardHeader>
		  <CardTitle>Nog geen targets</CardTitle>
		  <CardDescription>Er zijn nog geen targets beschikbaar in het systeem.</CardDescription>
		</CardHeader>
	  </Card>

	  <ul v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		<li v-for="target in sortedTargets" :key="target.id || target._id">
		  <Card class="h-full overflow-hidden py-0">
			<img
			  v-if="normalizeImageUrl(target.imageUrl)"
			  :src="normalizeImageUrl(target.imageUrl)"
			  :alt="target.title"
			  class="aspect-[4/3] w-full object-cover"
			  loading="lazy"
			>
			<CardHeader>
			  <CardTitle>{{ target.title }}</CardTitle>
			  <CardDescription>
				{{ target.locationName || 'Geen locatie opgegeven' }}
			  </CardDescription>
			</CardHeader>
			<CardContent class="space-y-3">
			  <div class="flex flex-wrap gap-2">
				<Badge v-for="tag in target.tags || []" :key="`${target.id || target._id}-${tag}`" variant="secondary">
				  {{ tag }}
				</Badge>
				<Badge v-if="!(target.tags || []).length" variant="outline">Geen tags</Badge>
			  </div>
			</CardContent>
			<CardFooter class="justify-between text-xs text-muted-foreground">
			  <span>Toegevoegd {{ formatDate(target.createdAt) }}</span>
			  <Button
				type="button"
				size="sm"
				:disabled="registeringTargetId === (target.id || target._id)"
				@click="registerForTarget(String(target.id || target._id))"
			  >
				{{ registeringTargetId === (target.id || target._id) ? 'Inschrijven...' : 'Schrijf in' }}
			  </Button>
			</CardFooter>
		  </Card>
		</li>
	  </ul>
	</section>
  </main>
</template>


