<script setup lang="ts">
import { computed } from "vue";
import type { Target } from "@/modules/participant/targets/store/targets.store.ts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const props = defineProps<{
  target: Target;
  isRegistering: boolean;
}>();

const emit = defineEmits<{
  register: [targetId: string];
}>();

const targetId = computed(() => String(props.target.id || props.target._id || ""));

function normalizeImageUrl(url: string | undefined) {
  if (!url) {
    return "";
  }

  const marker = "/uploads/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) {
    return url;
  }

  const fileName = url.slice(markerIndex + marker.length);
  return `/media/uploads/${fileName}`;
}

function formatDate(dateValue: string | undefined) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("nl-NL", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}
</script>

<template>
  <Card class="h-full overflow-hidden pt-0">
    <img
      v-if="normalizeImageUrl(target.imageUrl)"
      :src="normalizeImageUrl(target.imageUrl)"
      :alt="target.title"
      class="aspect-4/3 w-full object-contain bg-secondary border-b"
      loading="lazy"
    />

    <CardHeader>
      <CardTitle>{{ target.title }}</CardTitle>
      <CardDescription>
        {{ target.description }}
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-3">
      <!--      <CardDescription>-->
      <!--        {{ target.locationName || "Geen locatie opgegeven" }}-->
      <!--      </CardDescription>-->
      <div class="flex flex-wrap gap-2">
        <Badge v-for="tag in target.tags || []" :key="`${targetId}-${tag}`" variant="secondary">
          {{ tag }}
        </Badge>
        <Badge v-if="!(target.tags || []).length" variant="outline">Geen tags</Badge>
      </div>
    </CardContent>
    <CardFooter class="justify-between text-xs text-muted-foreground">
      <span>Toegevoegd {{ formatDate(target.createdAt) }}</span>
      <Button type="button" size="sm" :disabled="isRegistering" @click="emit('register', targetId)">
        {{ isRegistering ? "Inschrijven..." : "Schrijf in" }}
      </Button>
    </CardFooter>
  </Card>
</template>
