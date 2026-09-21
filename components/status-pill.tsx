import { cn, labelize } from "@/lib/utils";
export function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = { passable: "bg-emerald-100 text-emerald-800", verified: "bg-emerald-100 text-emerald-800", resolved: "bg-emerald-100 text-emerald-800", caution: "bg-amber-100 text-amber-900", responding: "bg-amber-100 text-amber-900", hazardous: "bg-red-100 text-red-800", flagged: "bg-red-100 text-red-800", pending: "bg-blue-100 text-blue-800", acknowledged: "bg-blue-100 text-blue-800", received: "bg-cyan-100 text-cyan-800" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold", colors[status] || "bg-slate-100 text-slate-700")}>{labelize(status)}</span>;
}
