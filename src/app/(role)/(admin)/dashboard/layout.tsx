// src/app/(role)/(admin)/layout.tsx

import { ReactNode } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-50">
			<AdminNavbar />

			<div className="flex">
				<AdminSidebar />

				{/* Main content */}
				<main className="flex-1 ml-64 p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
					<div className="max-w-7xl mx-auto">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}