import type { Metadata } from "next";
import { UserDashboard } from "@/components/user-dashboard";
export const metadata:Metadata={title:"Dashboard"};
export default function DashboardPage(){return <main className="page-shell py-7"><UserDashboard/></main>}
