export const dynamic = "force-dynamic";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
 
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } }, user: true }
    });
    return NextResponse.json(orders);
}

export async function PUT(req: Request) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { orderId, status, paymentStatus } = await req.json();

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
        where: { id: orderId },
        data: dataToUpdate
    });
    return NextResponse.json(order);
}

