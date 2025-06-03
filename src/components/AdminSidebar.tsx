'use client'

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
   LayoutDashboard,
   FolderOpen,
   FileText,
   Settings
} from "lucide-react";

const SidebarMenuItem = ({
   href,
   icon: Icon,
   children,
   isActive
}: {
   href: string;
   icon: any;
   children: ReactNode;
   isActive?: boolean;
}) => (
   <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
         ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm'
         : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
         }`}
   >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{children}</span>
   </Link>
);

export default function AdminSidebar() {
   const pathname = usePathname();

   const menuItems = [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/category', icon: FolderOpen, label: 'Categories' },
      { href: '/dashboard/articles', icon: FileText, label: 'Articles' },
   ];

   return (
      <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] fixed left-0 top-16 overflow-y-auto shadow-sm">
         <div className="p-6">
            <div className="mb-6">
               <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navigation
               </h2>
            </div>

            <div className="space-y-1">
               {menuItems.map((item) => (
                  <SidebarMenuItem
                     key={item.href}
                     href={item.href}
                     icon={item.icon}
                     isActive={pathname === item.href}
                  >
                     {item.label}
                  </SidebarMenuItem>
               ))}
            </div>
         </div>
      </aside>
   );
}