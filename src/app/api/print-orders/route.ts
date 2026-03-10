import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
        }

        const body = await req.json();
        const {
            fileData,
            fileName,
            totalPages,
            copies,
            colorMode,
            address,
            customPageRange,
            paymentMethod,
            transactionId
        } = body;

        // Basic Validation
        if (!fileData || !fileName || !totalPages || !copies || !colorMode || !address) {
            return NextResponse.json({ error: 'Missing required configuration fields.' }, { status: 400 });
        }

        // Server-Side Pricing Calculation (Never trust client)
        const rateBW = 1.50;
        const rateColor = 10.00;

        const pricePerPage = colorMode === 'Color' ? rateColor : rateBW;
        const calculatedTotalPrice = totalPages * copies * pricePerPage;

        let initialPaymentStatus = "Pending";
        if (paymentMethod === "UPI") initialPaymentStatus = "Submitted";
        if (paymentMethod === "CARD") initialPaymentStatus = "Paid";

        // Attempt creation
        const printOrder = await prisma.printOrder.create({
            data: {
                userId: session.userId,
                fileData,
                fileName,
                totalPages: Number(totalPages),
                copies: Number(copies),
                colorMode,
                pricePerPage,
                totalPrice: calculatedTotalPrice,
                address,
                customPageRange: customPageRange || null,
                orderStatus: 'Uploaded',
                paymentMethod: paymentMethod || "COD",
                paymentStatus: initialPaymentStatus,
                transactionId: transactionId || null,
            }
        });

        return NextResponse.json({ success: true, orderId: printOrder.id }, { status: 201 });

    } catch (error) {
        console.error('Print Order Creation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Get user specific print orders
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prints = await prisma.printOrder.findMany({
            where: { userId: session.userId },
            select: {
                id: true,
                fileName: true,
                totalPages: true,
                copies: true,
                colorMode: true,
                totalPrice: true,
                orderStatus: true,
                paymentMethod: true,
                paymentStatus: true,
                createdAt: true,
                // WE OMIT fileData TO PREVENT MASSIVE PAYLOADS
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(prints);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
