/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
 
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Admin Auth Check helper
async function checkAdmin() {
    const session = await getSession();
    if (!session?.userId) return false;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    return user?.role === 'ADMIN';
}

// GET all print jobs
export async function GET(req: Request) {
    try {
        if (!(await checkAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const printJobs = await prisma.printOrder.findMany({
            include: { user: { select: { name: true, email: true, phone: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(printJobs);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT to update print order status
export async function PUT(req: Request) {
    try {
        if (!(await checkAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, status, paymentStatus } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing print job id' }, { status: 400 });
        }

        const dataToUpdate: any = {};
        if (status) dataToUpdate.orderStatus = status;
        if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

        const updatedOrder = await prisma.printOrder.update({
            where: { id },
            data: dataToUpdate
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

