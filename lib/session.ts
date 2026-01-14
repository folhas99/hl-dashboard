import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUserId() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as any)?.id as string | undefined;
  return uid;
}
