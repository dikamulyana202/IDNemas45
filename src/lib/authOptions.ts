import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/login"
    },
    session: {
        strategy: "jwt"
    },
    adapter: PrismaAdapter(db),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "mail@gmail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await db.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
                if (!user) {
                    return null;
                }

                const isCorrect = await compare(credentials.password, user.password);
                if (!isCorrect) {
                    return null;
                }

                return {
                    id: `${user.id}`,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.username = user.username
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.username = token.username as string
                session.user.role = token.role as string
            }
            return session
        },
        
    },
}