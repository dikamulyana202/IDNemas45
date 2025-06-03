// types/next-auth.d.ts
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            username: string
            role: string
        }
    }

    interface User {
        id: string
        email: string
        username: string
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        email: string
        username: string
        role: string
    }
}