import type { VercelRequest, VercelResponse } from "@vercel/node";
type AdminSessionPayload = {
    adminId: string;
    email: string;
    exp: number;
};
export declare function clearAdminCookie(response: VercelResponse): void;
export declare function getAdminStatus(request: VercelRequest): Promise<{
    hasAdmin: boolean;
    authenticated: boolean;
}>;
export declare function getAdminSession(request: VercelRequest): AdminSessionPayload;
export declare function requireAdmin(request: VercelRequest): Promise<{
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    passwordHash: string;
    passwordSalt: string;
    role: import("@prisma/client").$Enums.AdminRole;
    isActive: boolean;
    lastLoginAt: Date | null;
}>;
export declare function setupAdmin(email: string, password: string, response: VercelResponse): Promise<{
    email: string;
}>;
export declare function loginAdmin(email: string, password: string, response: VercelResponse): Promise<boolean>;
export {};
