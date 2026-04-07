import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

const parsePositiveNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : NaN;
    }
    return NaN;
};

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
        }

        const body = await req.json();
        const { items, totalAmount, customAddress, paymentMethod, transactionId, isUrgent } = body;

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        const parsedItems = items.map((item: unknown) => {
            const inputItem = item as Record<string, unknown>;
            return {
                productId: String(inputItem?.id),
                quantity: Number(inputItem?.quantity),
                price: parsePositiveNumber(inputItem?.price)
            };
        });

        if (
            parsedItems.some(
                (item) => !item.productId || item.quantity <= 0 || !Number.isFinite(item.price) || item.price < 0
            )
        ) {
            return NextResponse.json({ error: "Invalid order item data" }, { status: 400 });
        }

        const parsedTotal = parsePositiveNumber(totalAmount);
        if (!Number.isFinite(parsedTotal) || parsedTotal < 0) {
            return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
        }

        if (customAddress && typeof customAddress !== "string") {
            return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
        }

        if (customAddress) {
            await prisma.user.update({
                where: { id: session.userId },
                data: { addressDetails: customAddress }
            });
        }

        const urgentFee = isUrgent ? 30 : 0;
        const finalTotalAmount = parsedTotal + urgentFee;

        const order = await prisma.order.create({
            data: {
                userId: session.userId,
                totalAmount: finalTotalAmount,
                status: "ORDERED",
                deliveryLocation: customAddress || null,
                paymentMethod: typeof paymentMethod === "string" ? paymentMethod : "COD",
                paymentStatus: "Pending",
                transactionId: typeof transactionId === "string" ? transactionId : null,
                isUrgent: Boolean(isUrgent),
                urgentFee,
                items: {
                    create: parsedItems.map((item) => ({
                        productId: item.productId,
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

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
        console.error("Order Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
