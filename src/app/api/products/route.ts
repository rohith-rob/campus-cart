import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    try {
        const products = await prisma.product.findMany({
            where: category ? { category: { name: category } } : undefined,
            include: { category: true },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
