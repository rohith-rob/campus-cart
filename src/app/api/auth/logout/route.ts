import { clearSession } from "@/lib/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
    await clearSession();
    return NextResponse.json({ message: "Logged out" }, { status: 200 });
}
