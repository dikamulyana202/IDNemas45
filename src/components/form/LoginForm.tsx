'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

const formSchema = z.object({
	email: z
		.string()
		.nonempty("Email wajib diisi.")
		.email("Format email tidak valid."),
	password: z
		.string()
		.nonempty("Password wajib diisi.")
		.min(3, "Password minimal 3 karakter."),
})

const LoginForm = () => {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		setLoading(true)

		const res = await signIn("credentials", {
			email: data.email,
			password: data.password,
			redirect: false,
		})

		if (res?.error) {
			toast.error("Login gagal", {
				description: "Email atau password salah.",
				position: "top-center",
			})
			setLoading(false)
			return
		}

		// Ambil session dari API internal
		const sessionRes = await fetch("/api/auth/session")
		const session = await sessionRes.json()
		const role = session?.user?.role

		toast.success("Berhasil login", {
			description: `Selamat datang kembali!`,
			position: "top-center",
		})

		router.push(role === "admin" ? "/dashboard" : "/")
	}

	return (
		<div className="w-95 p-6 bg-white rounded-lg shadow-sm border">
			<h1 className="text-2xl font-bold mb-2">Selamat datang kembali</h1>
			<p className="text-gray-500 mb-10">Silakan login untuk melanjutkan.</p>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder="mail@example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input placeholder="••••••••" type="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						className="w-full bg-black hover:bg-gray-800 text-white"
						disabled={loading}
					>
						{loading ? "Memproses..." : "Login"}
					</Button>
				</form>
			</Form>

			<div className="mt-4 text-center">
				<span className="text-gray-500">Belum punya akun? </span>
				<Link href="/register" className="text-black font-medium hover:underline">
					Daftar
				</Link>
			</div>
		</div>
	)
}

export default LoginForm
