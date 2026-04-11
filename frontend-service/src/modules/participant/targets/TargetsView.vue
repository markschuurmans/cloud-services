<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { Plus, RefreshCw } from "lucide-vue-next";
import { useTargetsStore } from "@/modules/participant/targets/store/targets.store.ts";
import TargetCard from "@/modules/participant/targets/components/TargetCard.vue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const targetsStore = useTargetsStore();
const { loading, error, targets, registeringTargetId } = storeToRefs(targetsStore);

const sortedTargets = computed(() => {
  return [...targets.value].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
});

async function fetchTargets() {
  try {
    await targetsStore.fetchTargets();
  } catch {
    // Store state already contains a user-facing error message.
  }
}

async function registerForTarget(targetId: string) {
  try {
    await targetsStore.registerForTarget(targetId);
  } catch {
    // Store state already contains a user-facing error message.
  }
}

onMounted(fetchTargets);
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-8">
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
            {{ loading ? "Verversen..." : "Ververs" }}
          </Button>
        </div>
      </div>

      <Card v-if="error" class="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle>Targets laden mislukt</CardTitle>
          <CardDescription>{{ error }}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" variant="destructive" @click="fetchTargets"
            >Opnieuw proberen</Button
          >
        </CardFooter>
      </Card>

      <div v-else-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card v-for="item in 6" :key="item" class="overflow-hidden py-0">
          <div class="aspect-4/3 w-full animate-pulse bg-muted" />
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
          <TargetCard
            :target="target"
            :is-registering="registeringTargetId === String(target.id || target._id || '')"
            @register="registerForTarget"
          />
        </li>
      </ul>
    </section>
  </main>
</template>
