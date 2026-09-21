export type Role = "user" | "responder" | "admin";
export type FloodDepth = "none" | "ankle" | "calf" | "knee" | "waist" | "chest" | "unknown";
export type SosStatus = "pending" | "received" | "acknowledged" | "responding" | "resolved" | "cancelled";

export interface FloodReport {
  id: string; latitude: number; longitude: number; location_name: string;
  depth: FloodDepth; description: string | null; photo_path: string | null;
  observed_at: string; created_at: string; verification_status: "unverified" | "verified" | "disputed" | "flagged";
}

export interface SosAlert {
  id: string; user_id: string; latitude: number | null; longitude: number | null;
  emergency_type: string; immediate_needs: string[]; description: string | null;
  status: SosStatus; created_at: string; updated_at: string; assigned_responder_id: string | null;
}
