<script setup lang="ts">
import { HTMLAttributes, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/auth.store.ts";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);

const form = reactive({
  email: "",
  password: "",
});

async function submitLogin() {
  authStore.clearMessages();

  try {
    await authStore.login(form.email, form.password);

    const redirectTarget =
      typeof route.query.redirect === "string" ? route.query.redirect : "/targets";
    await router.push(redirectTarget);
  } catch {
    // Store state already contains a user-facing error message.
  }
}
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)" @submit.prevent="submitLogin">
    <FieldGroup>
      <div class="flex flex-col items-start gap-1">
        <h1 class="text-2xl font-bold">Welkom terug</h1>
        <p class="text-muted-foreground text-sm text-balance">
          Log in met uw account om verder te gaan
        </p>
      </div>
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
      <Field>
        <Button type="submit" :disabled="loading">
          {{ loading ? "Bezig met inloggen..." : "Login" }}
        </Button>
        <FieldDescription class="text-center">
          Neg geen account?
          <router-link :to="{ name: 'register' }" class="underline underline-offset-2"
            >Aanmelden</router-link
          >
        </FieldDescription>
      </Field>
    </FieldGroup>
  </form>
</template>
