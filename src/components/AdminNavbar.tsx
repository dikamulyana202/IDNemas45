// src/components/AdminNavbar.tsx
'use client'

import { buttonVariants } from "./ui/button"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

const AdminNavbar = () => {
   const { data: session } = useSession()

   return (
      <>
         {/* Fixed Admin Navbar */}
         <div className="bg-white border-b shadow-sm w-full fixed z-10 top-0 h-16">
            <nav className="flex justify-between px-6 h-full items-center">
               <div className="flex items-center gap-6">
                  <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                     Admin Dashboard
                  </Link>
               </div>

               <div className="flex items-center gap-4">
                  {session?.user && (
                     <>
                        <span className="text-sm text-gray-600">
                           Hello, <span className="font-medium text-gray-800">{session.user.username}</span>
                        </span>
                        <button
                           onClick={() => signOut()}
                           className={buttonVariants({ variant: "destructive", size: "sm" })}
                        >
                           Logout
                        </button>
                     </>
                  )}
               </div>
            </nav>
         </div>

         {/* Spacer untuk memberikan ruang */}
         <div className="h-16"></div>
      </>
   )
}

export default AdminNavbar