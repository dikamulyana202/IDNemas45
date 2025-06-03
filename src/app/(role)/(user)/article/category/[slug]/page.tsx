// app/(user)/article/category/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Tag, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";

interface Category {
   name: string;
}

interface Article {
   id: string;
   title: string;
   description: string | null;
   content: string;
   imageUrl: string | null;
   sourceUrl: string;
   author: string;
   publishedAt: string;
   category: Category;
}

interface ApiResponse {
   data: Article[];
   totalPages: number;
   totalItems: number;
   currentPage: number;
   hasNextPage: boolean;
   hasPrevPage: boolean;
}

export default function CategoryPage() {
   const { slug } = useParams();
   const [articles, setArticles] = useState<Article[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [categoryName, setCategoryName] = useState<string>('');
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(0);
   const [totalItems, setTotalItems] = useState(0);

   useEffect(() => {
      const fetchArticles = async () => {
         try {
            setLoading(true);
            setError(null);

            // Decode slug dan format untuk API
            const decodedSlug = decodeURIComponent(slug as string);
            const categoryForApi = decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1).toLowerCase();

            setCategoryName(categoryForApi);

            const response = await fetch(
               `/api/articles?category=${encodeURIComponent(categoryForApi)}&page=${currentPage}&limit=12&sortBy=publishedAt&sortOrder=desc`
            );

            if (!response.ok) {
               throw new Error('Failed to fetch articles');
            }

            const data: ApiResponse = await response.json();

            setArticles(data.data || []);
            setTotalPages(data.totalPages || 0);
            setTotalItems(data.totalItems || 0);

         } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            setArticles([]);
         } finally {
            setLoading(false);
         }
      };

      if (slug) {
         fetchArticles();
      }
   }, [slug, currentPage]);

   const handlePageChange = (page: number) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                     <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                     <p className="text-gray-600">Memuat artikel...</p>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                     Terjadi Kesalahan
                  </h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Link href="/">
                     <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Beranda
                     </Button>
                  </Link>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
               {/* Back Button */}
               <Link
                  href="/"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
               >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
               </Link>

               {/* Category Info */}
               <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center mb-4">
                     <div className="p-2 bg-blue-100 rounded-lg mr-4">
                        <Tag className="h-6 w-6 text-blue-600" />
                     </div>
                     <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                           Kategori: {categoryName}
                        </h1>
                        <p className="text-gray-600 mt-1">
                           Semua artikel dalam kategori {categoryName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                           {totalItems} artikel ditemukan
                        </p>
                     </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                     {categoryName}
                  </Badge>
               </div>
            </div>

            {/* Articles Grid */}
            {articles.length === 0 ? (
               <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                     Belum ada artikel
                  </h3>
                  <p className="text-gray-500">
                     Artikel untuk kategori {categoryName} belum tersedia.
                  </p>
               </div>
            ) : (
               <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                     {articles.map((article) => (
                        <ArticleCard
                           key={article.id}
                           article={article}
                        />
                     ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                     <div className="flex justify-center items-center space-x-2">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handlePageChange(currentPage - 1)}
                           disabled={currentPage === 1}
                        >
                           Sebelumnya
                        </Button>

                        <div className="flex space-x-1">
                           {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const pageNum = i + 1;
                              return (
                                 <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                 >
                                    {pageNum}
                                 </Button>
                              );
                           })}
                        </div>

                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handlePageChange(currentPage + 1)}
                           disabled={currentPage === totalPages}
                        >
                           Selanjutnya
                        </Button>
                     </div>
                  )}
               </>
            )}
         </div>
      </div>
   );
}