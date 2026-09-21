"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  FileWarning,
  LoaderCircle,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "./page-header";
import { Card, CardContent } from "./ui/card";
import { Select } from "./ui/form";
import { labelize, timeAgo } from "@/lib/utils";

type AdminData = {
  counts: {
    reports: number;
    active: number;
    users: number;
  };

  profiles: Array<{
    id: string;
    full_name: string;
    role: string;
    created_at: string;
  }>;

  reports: Array<{
    id: string;
    location_name: string;
    depth: string;
    verification_status: string;
    created_at: string;
  }>;

  rules: Array<{
    id: string;
    caution_depth: string;
    max_depth: string;
    active: boolean;
    vehicle_types: {
      name: string;
      slug: string;
    };
  }>;

  logs: Array<{
    id: string;
    action: string;
    entity_type: string;
    created_at: string;
  }>;
};

type Statistic = {
  icon: LucideIcon;
  label: string;
  value: number;
};

export function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState("reports");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/admin/overview");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load dashboard");
      }

      setData(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard",
      );
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(body: object) {
    setError("");

    try {
      const response = await fetch("/api/admin/moderate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Update failed");
        return;
      }

      await load();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Update failed",
      );
    }
  }

  if (error && !data) {
    return (
      <div
        role="alert"
        className="rounded-2xl bg-red-50 p-5 text-red-900"
      >
        <strong>Access unavailable.</strong> {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid min-h-64 place-items-center">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  const statistics: Statistic[] = [
    {
      icon: FileWarning,
      label: "Flood reports",
      value: data.counts.reports,
    },
    {
      icon: Activity,
      label: "Active SOS",
      value: data.counts.active,
    },
    {
      icon: Users,
      label: "Registered users",
      value: data.counts.users,
    },
  ];

  const tabs = ["reports", "users", "rules", "audit"];

  const depthOptions = [
    "none",
    "ankle",
    "calf",
    "knee",
    "waist",
    "chest",
  ];

  return (
    <>
      <PageHeader
        eyebrow="System administration"
        title="Operations console"
        description="Moderate observations, authorize responders, manage passability rules, and review security-relevant activity."
      />

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statistics.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--secondary-soft)] text-[var(--secondary)]">
                <Icon size={20} />
              </span>

              <div>
                <p className="text-2xl font-black">{value}</p>

                <p className="text-xs font-bold text-[var(--muted-fg)]">
                  {label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-900"
        >
          {error}
        </p>
      )}

      {/* Main dashboard */}
      <Card className="mt-5">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] p-2">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                tab === item
                  ? "bg-[var(--primary)] text-white"
                  : "hover:bg-[var(--muted)]"
              }`}
            >
              {labelize(item)}
            </button>
          ))}
        </div>

        <CardContent className="p-3 sm:p-5">
          {/* Reports */}
          {tab === "reports" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="text-xs uppercase text-[var(--muted-fg)]">
                  <tr>
                    <th className="p-3">Location</th>
                    <th>Depth</th>
                    <th>Submitted</th>
                    <th>Moderation</th>
                  </tr>
                </thead>

                <tbody>
                  {data.reports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="p-3 font-bold">
                        {report.location_name}
                      </td>

                      <td>{labelize(report.depth)}</td>

                      <td>{timeAgo(report.created_at)}</td>

                      <td>
                        <Select
                          className="w-36"
                          value={report.verification_status}
                          onChange={(event) =>
                            patch({
                              type: "report",
                              id: report.id,
                              status: event.target.value,
                            })
                          }
                        >
                          {[
                            "unverified",
                            "verified",
                            "disputed",
                            "flagged",
                          ].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs uppercase text-[var(--muted-fg)]">
                  <tr>
                    <th className="p-3">User</th>
                    <th>Joined</th>
                    <th>Authorized role</th>
                  </tr>
                </thead>

                <tbody>
                  {data.profiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="p-3 font-bold">
                        {profile.full_name || "Unnamed user"}
                      </td>

                      <td>{timeAgo(profile.created_at)}</td>

                      <td>
                        <Select
                          className="w-36"
                          value={profile.role}
                          onChange={(event) =>
                            patch({
                              type: "role",
                              id: profile.id,
                              role: event.target.value,
                            })
                          }
                        >
                          {["user", "responder", "admin"].map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Rules */}
          {tab === "rules" && (
            <div className="space-y-3">
              {data.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid items-center gap-3 rounded-xl border border-[var(--border)] p-4 sm:grid-cols-[1fr_160px_160px]"
                >
                  <div>
                    <p className="font-bold">
                      {rule.vehicle_types.name}
                    </p>

                    <p className="text-xs text-[var(--muted-fg)]">
                      Active database rule
                    </p>
                  </div>

                  <label className="text-xs">
                    Caution from

                    <Select
                      className="mt-1"
                      value={rule.caution_depth}
                      onChange={(event) =>
                        patch({
                          type: "rule",
                          id: rule.id,
                          caution_depth: event.target.value,
                          max_depth: rule.max_depth,
                          active: rule.active,
                        })
                      }
                    >
                      {depthOptions.map((depth) => (
                        <option key={depth} value={depth}>
                          {depth}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <label className="text-xs">
                    Maximum depth

                    <Select
                      className="mt-1"
                      value={rule.max_depth}
                      onChange={(event) =>
                        patch({
                          type: "rule",
                          id: rule.id,
                          caution_depth: rule.caution_depth,
                          max_depth: event.target.value,
                          active: rule.active,
                        })
                      }
                    >
                      {depthOptions.map((depth) => (
                        <option key={depth} value={depth}>
                          {depth}
                        </option>
                      ))}
                    </Select>
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Audit logs */}
          {tab === "audit" && (
            <div className="space-y-2">
              {data.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={18}
                      className="text-[var(--secondary)]"
                    />

                    <div>
                      <p className="text-sm font-bold">
                        {labelize(log.action)}
                      </p>

                      <p className="text-xs text-[var(--muted-fg)]">
                        {labelize(log.entity_type)}
                      </p>
                    </div>
                  </div>

                  <time className="text-xs text-[var(--muted-fg)]">
                    {timeAgo(log.created_at)}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
