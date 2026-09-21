import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { floodReportSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const supabase=await createClient(); const p=request.nextUrl.searchParams;
    let q=supabase.from("flood_reports").select("id,latitude,longitude,location_name,depth,description,photo_path,observed_at,created_at,verification_status").eq("is_public",true).neq("verification_status","flagged").order("observed_at",{ascending:false}).limit(Math.min(Number(p.get("limit"))||250,500));
    if(p.get("depth")&&p.get("depth")!=="all")q=q.eq("depth",p.get("depth")!);
    const {data,error}=await q;if(error)throw error;
    return NextResponse.json({data},{headers:{"Cache-Control":"public, max-age=15, stale-while-revalidate=30"}});
  } catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load reports"},{status:500});}
}

export async function POST(request: NextRequest) {
  try {
    const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
    if(!checkRateLimit(`report:${user.id}`,5,60_000))return NextResponse.json({error:"Too many submissions. Please wait."},{status:429});
    const form=await request.formData();
    const parsed=floodReportSchema.safeParse({latitude:form.get("latitude"),longitude:form.get("longitude"),location_name:form.get("location_name"),depth:form.get("depth"),description:form.get("description"),observed_at:form.get("observed_at")});
    if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message},{status:400});
    const duplicate=await supabase.from("flood_reports").select("id").eq("user_id",user.id).gte("created_at",new Date(Date.now()-2*60_000).toISOString()).limit(1);
    if(duplicate.data?.length)return NextResponse.json({error:"A recent report was already received. Please wait before submitting again."},{status:409});
    let photo_path:string|null=null;const photo=form.get("photo");
    if(photo instanceof File&&photo.size>0){if(photo.size>5*1024*1024)return NextResponse.json({error:"Photo must be 5 MB or smaller."},{status:400});if(!["image/jpeg","image/png","image/webp"].includes(photo.type))return NextResponse.json({error:"Use a JPEG, PNG, or WebP image."},{status:400});const ext=photo.type.split("/")[1].replace("jpeg","jpg");photo_path=`${user.id}/${crypto.randomUUID()}.${ext}`;const upload=await supabase.storage.from("flood-photos").upload(photo_path,photo,{contentType:photo.type,upsert:false});if(upload.error)throw upload.error;}
    const {data,error}=await supabase.from("flood_reports").insert({...parsed.data,user_id:user.id,description:parsed.data.description||null,photo_path}).select("id").single();
    if(error){if(photo_path)await supabase.storage.from("flood-photos").remove([photo_path]);throw error;}
    return NextResponse.json({data},{status:201});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Submission failed"},{status:500});}
}
