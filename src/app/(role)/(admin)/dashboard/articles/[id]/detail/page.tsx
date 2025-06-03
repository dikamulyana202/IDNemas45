"use client"

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
   CalendarIcon,
   UserIcon,
   Clock,
   ArrowLeft,
   Loader2,
   AlertCircle,
   ExternalLink
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Article {
   id: string;
   title: string;
   content: string;
   description: string;
   imageUrl: string;
   sourceUrl: string;
   author: string;
   publishedAt: string;
   category: {
      id: string;
      name: string;
   };
   user?: {
      username: string;
   };
}

export default function ArticleDetailPage() {
   const router = useRouter();
   const params = useParams();
   const articleId = params?.id as string;

   const [article, setArticle] = useState<Article | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Fetch article data
   const fetchArticle = async () => {
      if (!articleId) {
         setError('ID artikel tidak ditemukan dalam URL');
         setLoading(false);
         return;
      }


      setLoading(true);
      setError(null);

      try {
         const response = await fetch(`/api/articles/${articleId}`);


         if (!response.ok) {
            if (response.status === 404) {
               throw new Error('Artikel tidak ditemukan');
            } else if (response.status === 500) {
               throw new Error('Terjadi kesalahan server');
            } else {
               throw new Error(`Error: ${response.status}`);
            }
         }

         const data = await response.json();

         if (!data || !data.id) {
            throw new Error('Data artikel tidak valid');
         }

         setArticle(data);
      } catch (error) {
         console.error('Error fetching article:', error);
         const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat artikel';
         setError(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (articleId) {
         fetchArticle();
      } else {
         setError('ID artikel tidak ditemukan');
         setLoading(false);
      }
   }, [articleId]);

   // Format content helper
   const formatContent = (content: string) => {
      if (!content || typeof content !== 'string') return [];

      const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      let paragraphs = normalizedContent.split('\n\n');

      if (paragraphs.length === 1 && paragraphs[0].includes('\n')) {
         paragraphs = normalizedContent.split('\n');
      }

      return paragraphs
         .map(p => p.trim())
         .filter(p => p.length > 0)
         .filter(p => p !== '\n' && p !== '\r');
   };

   // Format date helper
   const formatDate = (dateString: string) => {
      if (!dateString) return 'Tanggal tidak tersedia';

      try {
         const date = new Date(dateString);
         if (isNaN(date.getTime())) {
            return 'Tanggal tidak valid';
         }

         return date.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
         });
      } catch {
         return 'Tanggal tidak valid';
      }
   };

   // Format time helper
   const formatTime = (dateString: string) => {
      if (!dateString) return '--:--';

      try {
         const date = new Date(dateString);
         if (isNaN(date.getTime())) {
            return '--:--';
         }

         return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
         });
      } catch {
         return '--:--';
      }
   };

   // Handle back navigation
   const handleBack = () => {
      router.push('/dashboard/articles');
   };

   // Handle retry
   const handleRetry = () => {
      fetchArticle();
   };

   // Loading state
   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 pt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-center h-64">
                     <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                     <span className="ml-2 text-gray-600">Memuat artikel...</span>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // Error state
   if (error) {
      return (
         <div className="min-h-screen bg-gray-50 pt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="max-w-4xl mx-auto">
                  <Alert className="border-red-200 bg-red-50">
                     <AlertCircle className="h-4 w-4 text-red-600" />
                     <AlertDescription className="text-red-800">
                        {error}
                        {articleId && (
                           <div className="mt-2 text-sm">
                              Article ID: {articleId}
                           </div>
                        )}
                     </AlertDescription>
                  </Alert>
                  <div className="mt-6 flex gap-4 justify-center">
                     <Button onClick={handleBack} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Daftar
                     </Button>
                     <Button onClick={handleRetry} variant="default">
                        <Loader2 className="h-4 w-4 mr-2" />
                        Coba Lagi
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // Article not found
   if (!article) {
      return (
         <div className="min-h-screen bg-gray-50 pt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="max-w-4xl mx-auto">
                  <div className="text-center py-16">
                     <h2 className="text-2xl font-bold text-gray-900 mb-4">Artikel Tidak Ditemukan</h2>
                     <p className="text-gray-600 mb-6">Artikel yang Anda cari tidak dapat ditemukan.</p>
                     <div className="flex gap-4 justify-center">
                        <Button onClick={handleBack} variant="outline">
                           <ArrowLeft className="h-4 w-4 mr-2" />
                           Kembali ke Daftar
                        </Button>
                        <Button onClick={handleRetry} variant="default">
                           <Loader2 className="h-4 w-4 mr-2" />
                           Coba Lagi
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   const contentParagraphs = formatContent(article.content);

   return (
      <div className="min-h-screen bg-gray-50 pt-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <div className="max-w-4xl mx-auto mb-6">
               <Button onClick={handleBack} variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Daftar
               </Button>
            </div>

            <div className="max-w-4xl mx-auto">
               <article className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                  {/* Cover Image */}
                  <div className="relative">
                     {article.imageUrl ? (
                        <div className="aspect-video w-full overflow-hidden">
                           <img
                              src={article.imageUrl}
                              alt={article.title || 'Gambar artikel'}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = 'none';
                                 const fallback = target.nextElementSibling as HTMLElement;
                                 if (fallback) fallback.style.display = 'flex';
                              }}
                           />
                           {/* Fallback div */}
                           <div className="aspect-video w-full bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center" style={{ display: 'none' }}>
                              <div className="text-gray-400 text-center">
                                 <div className="text-6xl mb-4">📰</div>
                                 <p className="text-lg font-medium">Gambar Tidak Dapat Dimuat</p>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="aspect-video w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                           <div className="text-gray-400 text-center">
                              <div className="text-6xl mb-4">📰</div>
                              <p className="text-lg font-medium">Tidak Ada Gambar</p>
                           </div>
                        </div>
                     )}

                     {/* Category Badge Overlay */}
                     <div className="absolute top-4 left-4">
                        <Badge className="bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                           {article.category?.name || 'Tidak berkategori'}
                        </Badge>
                     </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-8 lg:p-12">
                     {/* Meta Information */}
                     <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-100">
                        <div className="flex items-center">
                           <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                           <span className="font-medium text-gray-700">
                              {article.author || article.user?.username || 'Tidak diketahui'}
                           </span>
                        </div>
                        <div className="flex items-center">
                           <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                           <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        <div className="flex items-center">
                           <Clock className="h-4 w-4 mr-2 text-gray-400" />
                           <span>{formatTime(article.publishedAt)}</span>
                        </div>
                        {/* Source Link */}
                        {article.sourceUrl && (
                           <div className="flex items-center">
                              <a
                                 href={article.sourceUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                 <ExternalLink className="h-4 w-4 mr-1" />
                                 <span className="text-sm font-medium">Sumber</span>
                              </a>
                           </div>
                        )}
                     </div>

                     {/* Title */}
                     <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
                        {article.title || 'Judul tidak tersedia'}
                     </h1>

                     {/* Description */}
                     {article.description && (
                        <div className="text-xl text-gray-700 leading-relaxed mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                           <p className="font-medium italic">{article.description}</p>
                        </div>
                     )}

                     {/* Content */}
                     <div className="prose prose-lg prose-gray max-w-none">
                        {contentParagraphs.length > 0 ? (
                           contentParagraphs.map((paragraph: string, idx: number) => (
                              <p key={idx} className="text-gray-800 leading-relaxed mb-6 text-lg">
                                 {paragraph}
                              </p>
                           ))
                        ) : (
                           <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                              {article.content || 'Konten artikel tidak tersedia'}
                           </div>
                        )}
                     </div>

                     {/* Actions */}
                     <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                           <Button onClick={handleBack} variant="outline">
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Kembali ke Daftar
                           </Button>

                           {article.sourceUrl && (
                              <a
                                 href={article.sourceUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="inline-flex"
                              >
                                 <Button variant="default">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Baca Sumber Asli
                                 </Button>
                              </a>
                           )}
                        </div>
                     </div>
                  </div>
               </article>
            </div>
         </div>
      </div>
   );
}