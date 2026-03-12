import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await _req.json();
        const { name, price, stock, description, categoryName, imageUrl } = body;
        const { id } = await params;

        const updateData: Partial<{
            name: string;
            price: number;
            stock: number;
            description: string;
            imageUrl: string;
            categoryId: string;
        }> = {};
        if (name) updateData.name = name;
        if (price) updateData.price = parseFloat(price);
        if (stock !== undefined) updateData.stock = parseInt(stock, 10);
        if (description !== undefined) updateData.description = description;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

        if (categoryName) {
            const category = await prisma.category.upsert({
                where: { name: categoryName },
                update: {},
                create: { name: categoryName }
            });
            updateData.categoryId = category.id;
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedProduct);
    } catch {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        await prisma.product.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
