import { describe,expect,it } from "vitest";
import { canAccessAdmin,canAccessResponder,canAssignRole } from "@/lib/permissions";
describe("role permissions",()=>{it("does not grant responders admin access",()=>expect(canAccessAdmin("responder")).toBe(false));it("allows admins into responder operations",()=>expect(canAccessResponder("admin")).toBe(true));it("prevents self role changes",()=>expect(canAssignRole("admin","same","same")).toBe(false));});
