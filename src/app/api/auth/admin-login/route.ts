import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Hardened check to ensure ONLY Admin accounts proceed
        if (user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access: You do not possess Administrative privileges." }, { status: 403 });
        }

        await setSessionCookie(user.id, user.role);

        return NextResponse.json({ message: "Admin Login successful" }, { status: 200 });
    } catch (error) {
        console.error("Admin Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
