import type { Role } from "./types";
export const canAccessResponder = (role: Role) => role === "responder" || role === "admin";
export const canAccessAdmin = (role: Role) => role === "admin";
export const canAssignRole = (actor: Role, targetId: string, actorId: string) => actor === "admin" && targetId !== actorId;
