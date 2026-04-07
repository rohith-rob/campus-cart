import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

function isValidProductPayload(body: unknown) {
    const payload = body as Record<string, unknown>;
    return (
        typeof payload?.name === "string" && payload.name.trim() !== "" &&
        typeof payload?.price !== "undefined" && !Number.isNaN(Number(payload.price)) && Number(payload.price) >= 0 &&
        typeof payload?.categoryName === "string" && payload.categoryName.trim() !== ""
    );
}

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Admin Products Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, price, stock, description, categoryName, imageUrl } = body;

        if (!isValidProductPayload(body)) {
            return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
        }

        const parsedPrice = Number(price);
        const parsedStock = Number.isFinite(Number(stock)) ? Number(stock) : 0;

        const category = await prisma.category.upsert({
            where: { name: categoryName },
            update: {},
            create: { name: categoryName }
        });

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                price: parsedPrice,
                stock: Math.max(0, Math.trunc(parsedStock)),
                description: typeof description === "string" ? description : "",
                imageUrl:
                    typeof imageUrl === "string" && imageUrl.trim()
                        ? imageUrl.trim()
                        : `https://source.unsplash.com/400x400/?${encodeURIComponent(name.split(" ")[0])}`,
                categoryId: category.id
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Admin Product Creation Error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
