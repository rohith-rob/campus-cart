import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? undefined : "nextjs_dev_session_secret_1234");
if (!secretKey) {
    throw new Error("SESSION_SECRET environment variable is required.");
}

const key = new TextEncoder().encode(secretKey);

type SessionPayload = {
    userId: string;
    role: string;
    expires?: string | number | Date;
};

export async function encrypt(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload as SessionPayload;
}

export async function setSessionCookie(userId: string, role: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId, role, expires });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function getSession() {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;

    try {
        return await decrypt(session);
    } catch {
        return null;
    }
}

export async function clearSession() {
    (await cookies()).set("session", "", {
        expires: new Date(0),
        path: "/",
    });
}

