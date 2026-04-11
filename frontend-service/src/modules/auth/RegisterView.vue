<script setup lang="ts">
import { HTMLAttributes, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { apiRequest } from "@/services/api.ts";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

type RegisterResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
};

const router = useRouter();

const form = reactive({
  displayName: "",
  email: "",
  password: "",
});

const error = ref("");
const success = ref("");
const loading = ref(false);
const authServiceBaseUrl = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3001";

async function submitRegister() {
  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    const data = await apiRequest<RegisterResponse>("/api/auth/register", {
      method: "POST",
      baseUrl: authServiceBaseUrl,
      body: JSON.stringify({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
      }),
    });

    success.value = data.message || "Registratie gelukt. Je kunt nu inloggen.";
    await router.push({ name: "login", query: { registered: "1" } });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Registratie mislukt";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)" @submit.prevent="submitRegister">
    <FieldGroup>
      <div class="flex flex-col items-start gap-1">
        <h1 class="text-2xl font-bold">Registeren</h1>
        <p class="text-muted-foreground text-sm text-balance">
          Maak een nieuw account aan om verder te gaan
        </p>
      </div>
      <Field>
        <FieldLabel for="displayName"> Gebruikersnaam </FieldLabel>
        <Input id="displayName" v-model="form.displayName" type="text" required />
      </Field>
      <Field>
        <FieldLabel for="email"> E-mail </FieldLabel>
        <Input id="email" v-model="form.email" type="email" required />
      </Field>
      <Field>
        <FieldLabel for="password"> Wachtwoord </FieldLabel>
        <Input id="password" v-model="form.password" type="password" required />
      </Field>
      <p
        v-if="error"
        class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
      >
        {{ error }}
      </p>
      <p
        v-if="success"
        class="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700"
      >
        {{ success }}
      </p>
      <Field>
        <Button type="submit" :disabled="loading">
          {{ loading ? "Bezig met registreren..." : "Account aanmaken" }}
        </Button>
        <FieldDescription class="text-center">
          Heb je al een account?
          <router-link :to="{ name: 'login' }" class="underline underline-offset-2"
            >Inloggen</router-link
          >
        </FieldDescription>
      </Field>
    </FieldGroup>
  </form>
</template>
