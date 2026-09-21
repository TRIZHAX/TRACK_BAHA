import type { Metadata } from "next";
import { ConfigNotice } from "@/components/config-notice";
import { PageHeader } from "@/components/page-header";
import { ReportForm } from "@/components/report-form";
export const metadata: Metadata={title:"Report flooding"};
export default function ReportPage(){return <main className="page-shell py-7"><PageHeader eyebrow="Field observation" title="Report flooding" description="Share what you can safely observe. Never enter floodwater or stop in a hazardous location to submit a report."/><ConfigNotice/><ReportForm/></main>}
