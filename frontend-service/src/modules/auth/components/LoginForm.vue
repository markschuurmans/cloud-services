<script setup lang="ts">
import {HTMLAttributes, reactive, ref} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest } from '@/services/api.ts'
import { setToken } from '@/services/auth.ts'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import {cn} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

type LoginResponse = {
  message: string
  token: string
}

const router = useRouter()
const route = useRoute()

const form = reactive({
  email: '',
  password: '',
})

const error = ref('')
const loading = ref(false)

async function submitLogin() {
  loading.value = true
  error.value = ''

  try {
    const data = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    })

    setToken(data.token || '')

    const redirectTarget = typeof route.query.redirect === 'string' ? route.query.redirect : '/targets'
    await router.push(redirectTarget)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login mislukt'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)">
    <FieldGroup>
      <div class="flex flex-col items-start gap-1">
        <h1 class="text-2xl font-bold">
          Welkom terug
        </h1>
        <p class="text-muted-foreground text-sm text-balance">
          Log in met uw account om verder te gaan
        </p>
      </div>
      <Field>
        <FieldLabel for="email">
          E-mail
        </FieldLabel>
        <Input id="email" type="email" required />
      </Field>
      <Field>
        <FieldLabel for="password">
          Wachtwoord
        </FieldLabel>
        <Input id="password" type="password" required />
      </Field>
      <Field>
        <Button type="submit">
          Login
        </Button>
        <FieldDescription class="text-center">
          Neg geen account?
          <a href="#">Aanmelden</a>
        </FieldDescription>
      </Field>
    </FieldGroup>
  </form>
</template>

