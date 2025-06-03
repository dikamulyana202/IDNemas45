'use client'

import { buttonVariants } from "./ui/button"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

const Navbar = () => {
	const { data: session } = useSession()

	return (
		<div className="bg-zinc-100/90 py-2 border-b shadow-sm w-full fixed z-10 top-0">
			<nav className="flex justify-between px-5 text-xl">
				<ul>
					<li className="text-2xl">
						<Link href="/">Article</Link>
					</li>
				</ul>

				<ul className="flex items-center gap-5">
					{session?.user ? (
						<>
							<li className="text-base text-zinc-800">
								Hello, <span className="font-semibold">{session.user.username}</span>
							</li>
							<li>
								<button
									onClick={() => signOut()}
									className={buttonVariants({ variant: "destructive" })}
								>
									Logout
								</button>
							</li>
						</>
					) : (
						<>
							<li>
								<Link
									className={buttonVariants({ variant: "outline" })}
									href="/login"
								>
									Login
								</Link>
							</li>
							<li>
								<Link
									className={buttonVariants()}
									href="/register"
								>
									Register
								</Link>
							</li>
						</>
					)}
				</ul>
			</nav>
		</div>
	)
}

export default Navbar
