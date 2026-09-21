import type { Metadata } from "next";
import { ResponderDashboard } from "@/components/responder-dashboard";
export const metadata:Metadata={title:"Responder dashboard"};
export default function ResponderPage(){return <main className="page-shell py-7"><ResponderDashboard/></main>}
