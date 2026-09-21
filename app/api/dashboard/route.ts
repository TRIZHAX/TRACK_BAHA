import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();

    const queries = {
      reports: supabase
        .from("flood_reports")
        .select(
          "id,location_name,depth,observed_at,verification_status",
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),

      alerts: supabase
        .from("sos_alerts")
        .select(
          "id,emergency_type,status,created_at,updated_at",
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),

      notifications: supabase
        .from("notifications")
        .select("id,title,body,read_at,created_at", {
          count: "exact",
        })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8),

      profile: supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", user.id)
        .maybeSingle(),
    };

    const results = await Promise.all(
      Object.entries(queries).map(async ([name, query]) => {
        const result = await query;

        if (result.error) {
          console.error(`Dashboard query failed: ${name}`, result.error);

          throw new Error(
            `${name}: ${result.error.message} ` +
              `(code: ${result.error.code ?? "unknown"})`
          );
        }

        return [name, result] as const;
      })
    );

    const resultMap = Object.fromEntries(results);

    const reports = resultMap.reports;
    const alerts = resultMap.alerts;
    const notifications = resultMap.notifications;
    const profile = resultMap.profile;

    return NextResponse.json({
      reports: reports.data ?? [],
      reportCount: reports.count ?? 0,
      alerts: alerts.data ?? [],
      alertCount: alerts.count ?? 0,
      notifications: notifications.data ?? [],
      unread:
        notifications.data?.filter((item) => !item.read_at).length ?? 0,
      profile: profile.data ?? null,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load dashboard",
      },
      { status: 500 }
    );
  }
}
