import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(){try{const s=await createClient();const {data,error}=await s.from("passability_rules").select("vehicle_type_id,caution_depth,max_depth,vehicle_types!inner(slug,name)").eq("active",true);if(error)throw error;return NextResponse.json({data});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load rules"},{status:500});}}
