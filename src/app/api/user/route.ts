import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

const userSchema = z
    .object({
        username: z
            .string()
            .nonempty("Name is required.")
            .min(3, "Name must be at least 3 characters."),
        email: z
            .string()
            .nonempty("Email is required.")
            .email("Invalid email address."),
        password: z
            .string()
            .nonempty("Password is required.")
            .min(3, "Password must be at least 3 characters."),
    })

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, email, password } = userSchema.parse(body);

        const cekEmail = await db.user.findUnique({
            where: { email },
        });

        if (cekEmail) {
            return NextResponse.json({ message: "Email Sudah Terdaftar" }, {
                status: 400,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        const { password: newUserPassword, ...rest } = newUser;
        return NextResponse.json({ message: "Registrasi berhasil", user: rest }, {
            status: 201,
        });
    } catch (error) {
        console.error("Error saat registrasi:", error);
        return NextResponse.json({ message: "Terjadi kesalahan server" }, {
            status: 500,
        });
    }
}