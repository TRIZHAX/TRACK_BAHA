import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(){try{const s=await createClient();await s.auth.signOut();return NextResponse.json({ok:true});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Sign out failed"},{status:500});}}
