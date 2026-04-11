<script setup lang="ts">
import { useRouter } from "vue-router";
import { clearToken } from "@/services/auth.ts";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-vue-next";

const router = useRouter();

async function logout() {
  clearToken();
  await router.push("/login");
}
</script>

<template>
  <div class="min-h-screen bg-muted text-foreground">
    <header class="border-b bg-card/80 backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div class="flex items-center gap-2 font-medium">
          <div
            class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
          >
            <MapPin class="size-4" />
          </div>
          MatchTheMark
        </div>

        <nav class="flex items-center gap-2">
          <Button variant="link" as-child>
            <router-link to="/targets">Targets</router-link>
          </Button>
          <Button variant="outline" @click="logout"> Uitloggen </Button>
        </nav>
      </div>
    </header>

    <router-view />
  </div>
</template>
