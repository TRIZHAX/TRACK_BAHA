import { createClient } from "./supabase/server";
import type { Role } from "./types";

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Supabase getUser error:", error);
    throw new Error(`AUTH_ERROR: ${error.message}`);
  }

  if (!user) {
    console.error("No authenticated user found");
    throw new Error("UNAUTHORIZED");
  }

  return { supabase, user };
}

export async function requireRole(roles: Role[]) {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile lookup error:", error);
    throw new Error(`PROFILE_ERROR: ${error.message}`);
  }

  if (!data || !roles.includes(data.role as Role)) {
    throw new Error("FORBIDDEN");
  }

  return {
    supabase,
    user,
    role: data.role as Role,
  };
}
