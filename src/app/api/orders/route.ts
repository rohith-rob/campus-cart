/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable prefer-const */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
        }

        const body = await req.json();
        const { items, totalAmount, customAddress, paymentMethod, transactionId } = body;

        if (!items || !items.length) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        if (customAddress) {
            await prisma.user.update({
                where: { id: session.userId },
                data: { addressDetails: customAddress }
            });
        }

        let initialPaymentStatus = "Pending";
        if (paymentMethod === "UPI") initialPaymentStatus = "Submitted";
        if (paymentMethod === "CARD") initialPaymentStatus = "Paid"; // Defaulting to paid for mockup card

        const order = await prisma.order.create({
            data: {
                userId: session.userId,
                totalAmount,
                status: "ORDERED",
                deliveryLocation: customAddress || null,
                paymentMethod: paymentMethod || "COD",
                paymentStatus: initialPaymentStatus,
                transactionId: transactionId || null,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: { items: true }
        });

        return NextResponse.json({ message: "Order placed successfully", orderId: order.id }, { status: 201 });
    } catch (error) {
        console.error("Order Creation Error:", error);
        return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // If admin, they could fetch all. But typically we have an admin route. 
        // This fetches current user's orders
        const orders = await prisma.order.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

