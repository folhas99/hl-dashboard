import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = bodySchema.parse(json);
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email: normalizedEmail, password: hash }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
