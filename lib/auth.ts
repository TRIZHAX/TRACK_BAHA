import { createClient } from "./supabase/server";
import type { Role } from "./types";
export async function requireUser(){const s=await createClient();const {data:{user},error}=await s.auth.getUser();if(error||!user)throw new Error("UNAUTHORIZED");return {supabase:s,user};}
export async function requireRole(roles:Role[]){const {supabase,user}=await requireUser();const {data}=await supabase.from("profiles").select("role").eq("id",user.id).single();if(!data||!roles.includes(data.role as Role))throw new Error("FORBIDDEN");return {supabase,user,role:data.role as Role};}
