import { invalidateSetupCache } from "@/lib/setup-cache";

export async function POST() {
  invalidateSetupCache();
  return Response.json({ ok: true });
}
