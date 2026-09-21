import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
export const metadata:Metadata={title:"Admin dashboard"};
export default function AdminPage(){return <main className="page-shell py-7"><AdminDashboard/></main>}
