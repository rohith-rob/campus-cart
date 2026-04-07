import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

const isValidEmail = (value: unknown): value is string =>
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!isValidEmail(email) || typeof password !== "string" || !password.trim()) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access: Administrative privileges required." }, { status: 403 });
        }

        await setSessionCookie(user.id, user.role);

        return NextResponse.json({ message: "Admin Login successful" }, { status: 200 });
    } catch (error) {
        console.error("Admin Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
