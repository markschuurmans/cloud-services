import { defineStore } from "pinia";
import { apiRequest } from "@/services/api.ts";

export type Target = {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  locationName?: string;
  tags?: string[];
  createdAt?: string;
};

type CreatedTarget = {
  id?: string;
  _id?: string;
  title: string;
};

type CreateTargetInput = {
  title: string;
  description?: string;
  deadline?: string;
  locationName?: string;
  tags?: string;
  imageFile: File;
};

export const useTargetsStore = defineStore("targets", {
  state: () => ({
    targets: [] as Target[],
    loading: false,
    createLoading: false,
    error: "",
    registeringTargetId: "",
  }),
  actions: {
    clearError() {
      this.error = "";
    },
    async fetchTargets() {
      this.loading = true;
      this.error = "";

      try {
        this.targets = await apiRequest<Target[]>("/api/target/targets");
      } catch (err) {
        this.error = err instanceof Error ? err.message : "Targets ophalen mislukt";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async registerForTarget(targetId: string) {
      this.registeringTargetId = targetId;
      this.error = "";

      try {
        await apiRequest(`/api/register/targets/${targetId}/register`, {
          method: "POST",
        });
      } catch (err) {
        this.error = err instanceof Error ? err.message : "Inschrijven voor target mislukt";
        throw err;
      } finally {
        this.registeringTargetId = "";
      }
    },
    async createTarget(input: CreateTargetInput) {
      this.createLoading = true;
      this.error = "";

      const payload = new FormData();
      payload.append("title", input.title);
      payload.append("image", input.imageFile);

      if (input.description?.trim()) {
        payload.append("description", input.description.trim());
      }

      if (input.deadline) {
        payload.append("deadline", new Date(input.deadline).toISOString());
      }

      if (input.locationName?.trim()) {
        payload.append("locationName", input.locationName.trim());
      }

      if (input.tags?.trim()) {
        payload.append("tags", input.tags.trim());
      }

      try {
        await apiRequest<CreatedTarget>("/api/target/targets", {
          method: "POST",
          body: payload,
        });
      } catch (err) {
        this.error = err instanceof Error ? err.message : "Target aanmaken mislukt";
        throw err;
      } finally {
        this.createLoading = false;
      }
    },
  },
});
