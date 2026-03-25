import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";
import type { DbProfile, UserProfile } from "@/types";
import { mapDbProfile } from "@/types";
import { toast } from "sonner";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return mapDbProfile(data as DbProfile);
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<UserProfile>) => {
      if (!user) throw new Error("Not authenticated");

      const dbUpdate: Partial<DbProfile> = {};
      if (profile.name !== undefined) dbUpdate.name = profile.name;
      if (profile.email !== undefined) dbUpdate.email = profile.email;
      if (profile.phone !== undefined) dbUpdate.phone = profile.phone;
      if (profile.cdlClass !== undefined) dbUpdate.cdl_class = profile.cdlClass;
      if (profile.homeBase !== undefined) dbUpdate.home_base = profile.homeBase;
      if (profile.preferredLanes !== undefined) dbUpdate.preferred_lanes = profile.preferredLanes;
      if (profile.role !== undefined) dbUpdate.role = profile.role;
      dbUpdate.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdate)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    },
  });
}
