import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { name, price, stock, description, categoryName, imageUrl } = body;

        if (!name || !price || !categoryName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Upsert or find category
        const category = await prisma.category.upsert({
            where: { name: categoryName },
            update: {},
            create: { name: categoryName }
        });

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                stock: stock !== undefined ? parseInt(stock, 10) : 0,
                description: description || '',
                imageUrl: imageUrl || `https://source.unsplash.com/400x400/?${encodeURIComponent(name.split(' ')[0])}`,
                categoryId: category.id
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
