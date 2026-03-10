import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash, role: "USER" },
        });

        await setSessionCookie(user.id, user.role);

        return NextResponse.json({ message: "Registration successful" }, { status: 201 });
    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
