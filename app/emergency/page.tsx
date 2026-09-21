import type { Metadata } from "next";
import { ConfigNotice } from "@/components/config-notice";
import { EmergencyPanel } from "@/components/emergency-panel";
export const metadata:Metadata={title:"Emergency SOS"};
export default function EmergencyPage(){return <main className="page-shell py-7"><ConfigNotice/><EmergencyPanel/></main>}
