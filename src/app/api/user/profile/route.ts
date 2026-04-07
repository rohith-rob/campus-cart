export const dynamic = "force-dynamic";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
 
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    const session = await getSession();
    if (!session || !session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                name: true,
                email: true,
                avatar: true,
                phone: true,
                accommodationType: true,
                addressDetails: true,
                collegeName: true,
                course: true,
                year: true
            }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json(user);

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getSession();
    if (!session || !session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            name, phone, accommodationType, addressDetails,
            collegeName, course, year, avatar,
            currentPassword, newPassword
        } = body;

        const updateData: any = {
            name, phone, accommodationType, addressDetails,
            collegeName, course, year
        };

        if (avatar) updateData.avatar = avatar;

        // Password Update Logic
        if (newPassword) {
            const userSettings = await prisma.user.findUnique({ where: { id: session.userId } });
            if (!userSettings) return NextResponse.json({ error: "User not found" }, { status: 404 });

            const isMatch = await bcrypt.compare(currentPassword, userSettings.passwordHash);
            if (!isMatch) {
                return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
            }

            updateData.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.userId },
            data: updateData,
            select: { name: true, phone: true } // Don't return hash
        });

        return NextResponse.json({ success: true, updatedUser });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}

