import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/errors";

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new ApiError("UNAUTHORIZED", "Sila log masuk dahulu.", 401);
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new ApiError("FORBIDDEN", "Akses ditolak.", 403);
  return user;
}
