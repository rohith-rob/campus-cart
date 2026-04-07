export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(process.cwd(), "public", "images", "upi-qr.png");

        await writeFile(filePath, buffer);

        return NextResponse.json({ success: true, message: "QR Code updated successfully" });
    } catch (error) {
        console.error("Error saving QR code:", error);
        return NextResponse.json({ error: "Failed to upload QR code" }, { status: 500 });
    }
}
