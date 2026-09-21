import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const { supabase } = await requireRole(["admin"]);

    const [reports, active, profiles, queue, rules, logs] =
      await Promise.all([
        supabase
          .from("flood_reports")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("sos_alerts")
          .select("*", { count: "exact", head: true })
          .not("status", "in", '("resolved","cancelled")'),

        supabase
          .from("profiles")
          .select("id,full_name,role,created_at", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(20),

        supabase
          .from("flood_reports")
          .select(
            "id,location_name,depth,verification_status,created_at"
          )
          .order("created_at", { ascending: false })
          .limit(20),

        supabase
          .from("passability_rules")
          .select(
            "id,caution_depth,max_depth,active,vehicle_types(name,slug)"
          )
          .order("created_at"),

        supabase
          .from("audit_logs")
          .select("id,action,entity_type,created_at,metadata")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

    const queries = {
      reports,
      active,
      profiles,
      queue,
      rules,
      logs,
    };

    for (const [name, result] of Object.entries(queries)) {
      if (result.error) {
        console.error(`Admin query failed: ${name}`, result.error);

        return NextResponse.json(
          {
            error: `${name}: ${result.error.message}`,
            code: result.error.code,
            details: result.error.details,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      counts: {
        reports: reports.count ?? 0,
        active: active.count ?? 0,
        users: profiles.count ?? 0,
      },
      profiles: profiles.data ?? [],
      reports: queue.data ?? [],
      rules: rules.data ?? [],
      logs: logs.data ?? [],
    });
  } catch (error) {
    console.error("Admin overview error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to load admin data";

    return NextResponse.json(
      { error: message },
      { status: message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}
