<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { apiRequest } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type CreatedTarget = {
  id?: string
  _id?: string
  title: string
}

const router = useRouter()

const form = reactive({
  title: '',
  description: '',
  deadline: '',
  locationName: '',
  tags: '',
})

const imageFile = ref<File | null>(null)
const loading = ref(false)
const error = ref('')

function onImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  imageFile.value = target.files?.[0] || null
}

async function submitCreate() {
  loading.value = true
  error.value = ''

  if (!imageFile.value) {
    error.value = 'Selecteer een afbeelding.'
    loading.value = false
    return
  }

  const payload = new FormData()
  payload.append('title', form.title)
  payload.append('image', imageFile.value)

  if (form.description.trim()) {
    payload.append('description', form.description.trim())
  }

  if (form.deadline) {
    payload.append('deadline', new Date(form.deadline).toISOString())
  }

  if (form.locationName.trim()) {
    payload.append('locationName', form.locationName.trim())
  }

  if (form.tags.trim()) {
    payload.append('tags', form.tags.trim())
  }

  try {
    await apiRequest<CreatedTarget>('/api/target/targets', {
      method: 'POST',
      body: payload,
    })

    await router.push({ name: 'targets' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Target aanmaken mislukt'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto w-full max-w-3xl px-4 py-8">
    <section class="space-y-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Target aanmaken</h1>
          <p class="text-sm text-muted-foreground">Upload een nieuwe target-afbeelding en metadata.</p>
        </div>
        <Button type="button" variant="outline" @click="router.push({ name: 'targets' })">
          <ArrowLeft class="mr-2 size-4" />
          Terug
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nieuwe target</CardTitle>
          <CardDescription>Alle verplichte velden invullen en een afbeelding uploaden (max 5MB).</CardDescription>
        </CardHeader>

        <CardContent>
          <form class="space-y-5" @submit.prevent="submitCreate">
            <FieldGroup>

              <Field>
                <FieldLabel for="title">Titel</FieldLabel>
                <Input id="title" v-model="form.title" type="text" required />
              </Field>

              <Field>
                <FieldLabel for="description">Beschrijving (optioneel)</FieldLabel>
                <Input id="description" v-model="form.description" type="text" />
              </Field>

              <Field>
                <FieldLabel for="deadline">Deadline (optioneel)</FieldLabel>
                <Input id="deadline" v-model="form.deadline" type="datetime-local" />
              </Field>

              <Field>
                <FieldLabel for="locationName">Locatie (optioneel)</FieldLabel>
                <Input id="locationName" v-model="form.locationName" type="text" />
              </Field>

              <Field>
                <FieldLabel for="tags">Tags (optioneel)</FieldLabel>
                <Input id="tags" v-model="form.tags" type="text" placeholder="kerk, plein, avond" />
                <FieldDescription>Scheid meerdere tags met komma's.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel for="image">Afbeelding</FieldLabel>
                <Input id="image" type="file" accept="image/*" required @change="onImageChange" />
              </Field>
            </FieldGroup>

            <p v-if="error" class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {{ error }}
            </p>

            <CardFooter class="px-0 pb-0">
              <Button type="submit" :disabled="loading" class="w-full">
                {{ loading ? 'Target wordt aangemaakt...' : 'Target aanmaken' }}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </section>
  </main>
</template>

