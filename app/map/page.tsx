import type { Metadata } from "next";
import { ConfigNotice } from "@/components/config-notice";
import { PageHeader } from "@/components/page-header";
import { LiveMap } from "@/components/live-map";
export const metadata: Metadata = { title: "Live flood map" };
export default function MapPage(){return <main className="page-shell py-7"><PageHeader eyebrow="Situational awareness" title="Live flood map" description="Explore recent community observations. Filters and vehicle indicators are decision support—not guarantees of safe passage."/><ConfigNotice/><LiveMap/></main>}
