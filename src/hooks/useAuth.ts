"use client";

import { useAuth } from "@/components/AuthProvider";

export function useAuthSession() {
  return useAuth();
}
