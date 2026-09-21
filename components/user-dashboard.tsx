"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  LoaderCircle,
  MapPinned,
  RadioTower,
  Waves,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "./page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { StatusPill } from "./status-pill";
import { buttonVariants } from "./ui/button";
import { labelize, timeAgo } from "@/lib/utils";

type Data = {
  reportCount: number;
  alertCount: number;
  unread: number;

  profile: {
    full_name: string;
    role: string;
  };

  reports: Array<{
    id: string;
    location_name: string;
    depth: string;
    observed_at: string;
    verification_status: string;
  }>;

  alerts: Array<{
    id: string;
    emergency_type: string;
    status: string;
    created_at: string;
  }>;

  notifications: Array<{
    id: string;
    title: string;
    body: string;
    read_at: string | null;
    created_at: string;
  }>;
};

type Statistic = {
  icon: LucideIcon;
  label: string;
  value: number;
};

export function UserDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load dashboard",
          );
        }

        setData(result);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard",
        );
      }
    }

    loadDashboard();
  }, []);

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl bg-red-50 p-5 text-red-900"
      >
        {error}
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
      icon: Waves,
      label: "Flood reports",
      value: data.reportCount,
    },
    {
      icon: RadioTower,
      label: "SOS alerts",
      value: data.alertCount,
    },
    {
      icon: Bell,
      label: "Unread updates",
      value: data.unread,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={`${labelize(data.profile.role)} workspace`}
        title={`Good to see you, ${
          data.profile.full_name?.split(" ")[0] || "neighbor"
        }`}
        description="Review your latest observations, emergency alerts, and account notifications."
        actions={
          <Link
            href="/report"
            className={buttonVariants()}
          >
            <Waves size={17} />
            New report
          </Link>
        }
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

      {/* Main content */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Recent observations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent observations</CardTitle>

              <Link
                href="/map"
                className="text-sm font-bold text-[var(--primary)]"
              >
                View map
              </Link>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {data.reports.length > 0 ? (
              data.reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3"
                >
                  <div>
                    <p className="text-sm font-bold">
                      {report.location_name}
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted-fg)]">
                      {labelize(report.depth)} ·{" "}
                      {timeAgo(report.observed_at)}
                    </p>
                  </div>

                  <StatusPill
                    status={report.verification_status}
                  />
                </div>
              ))
            ) : (
              <Empty
                icon={MapPinned}
                text="No flood reports submitted."
              />
            )}
          </CardContent>
        </Card>

        {/* Emergency and notifications */}
        <Card>
          <CardHeader>
            <CardTitle>
              Emergency & notifications
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3"
              >
                <div>
                  <p className="text-sm font-bold">
                    {labelize(alert.emergency_type)}
                  </p>

                  <p className="text-xs text-[var(--muted-fg)]">
                    {timeAgo(alert.created_at)}
                  </p>
                </div>

                <StatusPill status={alert.status} />
              </div>
            ))}

            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-xl bg-[var(--muted)] p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">
                    {notification.title}
                  </p>

                  <ChevronRight size={15} />
                </div>

                <p className="mt-1 text-xs text-[var(--muted-fg)]">
                  {notification.body}
                </p>
              </div>
            ))}

            {!data.alerts.length &&
              !data.notifications.length && (
                <Empty
                  icon={Bell}
                  text="No alerts or notifications."
                />
              )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Empty({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="py-10 text-center text-sm text-[var(--muted-fg)]">
      <Icon className="mx-auto mb-2" />
      {text}
    </div>
  );
}
