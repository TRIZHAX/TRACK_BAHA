import { z } from "zod";

export const coordinatesSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180)
});

export const floodReportSchema = coordinatesSchema.extend({
  location_name: z.string().trim().min(2).max(160),
  depth: z.enum(["none", "ankle", "calf", "knee", "waist", "chest", "unknown"]),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  observed_at: z.string().datetime({ offset: true }).or(z.string().datetime())
});

export const sosSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).nullable(),
  longitude: z.coerce.number().min(-180).max(180).nullable(),
  emergency_type: z.enum(["medical", "stranded", "flood_rescue", "evacuation", "vehicle_breakdown", "other"]),
  immediate_needs: z.array(z.string().trim().min(1).max(80)).max(8),
  description: z.string().trim().max(1000).optional().or(z.literal(""))
}).refine(v => (v.latitude === null) === (v.longitude === null), "Both coordinates are required together");

export const statusSchema = z.object({
  status: z.enum(["received", "acknowledged", "responding", "resolved", "cancelled"]),
  note: z.string().trim().max(500).optional()
});

export const profileSchema = z.object({ full_name: z.string().trim().min(2).max(100), phone: z.string().trim().max(30).optional() });

export const authSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(72) });
