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
import { useRouter } from "next/navigation"

const formSchema = z
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
    confirmPassword: z
      .string()
      .nonempty("Password is required.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })

const RegisterForm = () => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
    });

    if (response.ok) {
      router.push('/login');
      alert("Registrasi berhasil");
    }
  }

  return (
    <div className=" w-95 p-6 bg-white rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold mb-2">Create an account</h1>
      <p className="text-gray-500 mb-10">Enter your email below to create your account</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name"
                    type="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="mail@example.com"
                    type="email"
                    {...field}
                  />
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
                  <Input
                    placeholder="••••••••"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            Create account
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <span className="text-gray-500">have an account? </span>
        <Link
          href="/login"
          className="text-black font-medium hover:underline"
        >
          Login
        </Link>
      </div>
    </div>
  )
}

export default RegisterForm