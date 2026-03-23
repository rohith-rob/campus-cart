import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: "Unauthorized. Please log in to leave a review." }, { status: 401 });
        }

        const { productId, rating, comment } = await req.json();

        if (!productId || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Invalid review data. Product ID and a rating between 1 and 5 are required." }, { status: 400 });
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found." }, { status: 404 });
        }

        // Create the review
        const review = await prisma.review.create({
            data: {
                productId,
                userId: session.userId,
                rating: Math.floor(rating),
                comment: comment || null,
            }
        });

        return NextResponse.json({ message: "Review submitted successfully!", review }, { status: 201 });
    } catch (error: any) {
        console.error("Review Submission Error:", error);
        return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
    }
}
