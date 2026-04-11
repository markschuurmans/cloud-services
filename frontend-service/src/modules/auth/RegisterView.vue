<script setup lang="ts">
import { HTMLAttributes, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/auth.store.ts";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const router = useRouter();
const authStore = useAuthStore();
const { loading, error, success } = storeToRefs(authStore);

const form = reactive({
  displayName: "",
  email: "",
  password: "",
});

async function submitRegister() {
  authStore.clearMessages();

  try {
    await authStore.register(form.displayName, form.email, form.password);
    await router.push({ name: "login", query: { registered: "1" } });
  } catch {
    // Store state already contains a user-facing error message.
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
