'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
   Save,
   Eye,
   CalendarIcon,
   ImageIcon,
   UserIcon,
   FileTextIcon,
   CheckCircle,
   AlertCircle,
   Loader2,
   Clock,
   ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

// Interface sama seperti create article
interface FormData {
   title: string;
   content: string;
   imageUrl: string;
   sourceUrl: string;
   author: string;
   publishedAt?: Date;
   categoryId: string;
}

interface ValidationErrors {
   title?: string;
   content?: string;
   imageUrl?: string;
   sourceUrl?: string;
   author?: string;
   categoryId?: string;
   general?: string;
}

interface Category {
   id: string;
   name: string;
}

interface Article extends FormData {
   id: string;
   description: string;
}

export default function EditArticlePage() {
   const { id } = useParams();
   const router = useRouter();

   // Form state
   const [formData, setFormData] = useState<FormData>({
      title: '',
      content: '',
      imageUrl: '',
      sourceUrl: '',
      author: '',
      publishedAt: undefined,
      categoryId: ''
   });

   // UI state
   const [categories, setCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(false);
   const [loadingData, setLoadingData] = useState(true);
   const [errors, setErrors] = useState<ValidationErrors>({});
   const [success, setSuccess] = useState(false);
   const [useCustomDate, setUseCustomDate] = useState(false);
   const [originalArticle, setOriginalArticle] = useState<Article | null>(null);

   // Function untuk generate description dari 100 kata pertama
   const generateDescription = (content: string): string => {
      if (!content.trim()) return '';
      const words = content.trim().split(/\s+/);
      const first100Words = words.slice(0, 100).join(' ');
      return first100Words + (words.length > 100 ? '...' : '');
   };

   // Validation function sama seperti create article
   const validateForm = (data: FormData): ValidationErrors => {
      const errors: ValidationErrors = {};

      if (!data.title.trim()) {
         errors.title = 'Judul artikel wajib diisi';
      } else if (data.title.length < 5) {
         errors.title = 'Judul minimal 5 karakter';
      } else if (data.title.length > 200) {
         errors.title = 'Judul maksimal 200 karakter';
      }

      if (!data.content.trim()) {
         errors.content = 'Konten artikel wajib diisi';
      } else if (data.content.length < 50) {
         errors.content = 'Konten minimal 50 karakter';
      }

      if (!data.sourceUrl.trim()) {
         errors.sourceUrl = 'URL sumber wajib diisi';
      } else {
         try {
            new URL(data.sourceUrl);
         } catch {
            errors.sourceUrl = 'Format URL tidak valid';
         }
      }

      if (data.imageUrl.trim()) {
         try {
            new URL(data.imageUrl);
         } catch {
            errors.imageUrl = 'Format URL gambar tidak valid';
         }
      }

      if (!data.author.trim()) {
         errors.author = 'Nama penulis wajib diisi';
      } else if (data.author.length < 2) {
         errors.author = 'Nama penulis minimal 2 karakter';
      }

      if (!data.categoryId) {
         errors.categoryId = 'Kategori wajib dipilih';
      }

      return errors;
   };

   // Fetch article data
   const fetchArticle = async () => {
      try {
         const response = await fetch(`/api/articles/${id}`);
         const result = await response.json();
         let article = null;

         if (result.success && result.data) {
            article = result.data;
         } else if (result.id) {
            article = result;
         } else if (result.success === false) {
            setErrors({ general: result.error || 'Artikel tidak ditemukan' });
            return;
         } else {
            console.error('❌ Unknown API response structure:', result);
            setErrors({ general: 'Format response API tidak dikenali' });
            return;
         }

         if (article && article.id) {
            setOriginalArticle(article);

            // Set form data dari article yang ada
            setFormData({
               title: article.title || '',
               content: article.content || '',
               imageUrl: article.imageUrl || '',
               sourceUrl: article.sourceUrl || '',
               author: article.author || '',
               publishedAt: article.publishedAt ? new Date(article.publishedAt) : undefined,
               categoryId: article.categoryId || article.category?.id || ''
            });

            // Set custom date checkbox jika ada publishedAt
            if (article.publishedAt) {
               setUseCustomDate(true);
            }
         } else {
            console.error('❌ Article data incomplete:', article);
            setErrors({ general: 'Data artikel tidak lengkap' });
         }
      } catch (error) {
         console.error('❌ Error fetching article:', error);
      }
   };

   // Fetch categories
   const fetchCategories = async () => {
      try {
         const response = await fetch('/api/categories');
         const result = await response.json();

         if (result.success) {
            setCategories(result.data);
         } else {
            console.error('Failed to fetch categories:', result.error);
         }
      } catch (error) {
         console.error('Error fetching categories:', error);
      }
   };

   // Load data on component mount
   useEffect(() => {
      const loadData = async () => {
         setLoadingData(true);
         await Promise.all([fetchArticle(), fetchCategories()]);
         setLoadingData(false);
      };

      if (id) {
         loadData();
      }
   }, [id]);

   // Handle input changes
   const handleInputChange = (field: keyof FormData, value: string | Date | undefined) => {
      setFormData(prev => ({
         ...prev,
         [field]: value
      }));

      // Clear error for this field when user starts typing
      if (errors[field as keyof typeof errors]) {
         setErrors(prev => ({
            ...prev,
            [field]: undefined
         }));
      }
   };

   // Handle form submission
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const validationErrors = validateForm(formData);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
         return;
      }

      // Prepare data dengan auto-generated description
      const submitData = {
         ...formData,
         description: generateDescription(formData.content),
         publishedAt: formData.publishedAt || new Date()
      };

      setLoading(true);
      setSuccess(false);
      setErrors({});

      try {
         const endpoints = [
            { url: `/api/articles/${id}`, method: 'PUT' },
            { url: `/api/articles/${id}`, method: 'PATCH' },
            { url: `/api/article/${id}`, method: 'PUT' },
            { url: `/api/articles/update/${id}`, method: 'POST' }
         ];

         let response = null;
         let result = null;

         for (const endpoint of endpoints) {
            try {
               response = await fetch(endpoint.url, {
                  method: endpoint.method,
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                     ...submitData,
                     publishedAt: submitData.publishedAt.toISOString()
                  }),
               });

               if (response.ok) {
                  result = await response.json();
                  break;
               } else {
                  const errorResult = await response.json();
               }
            } catch (endpointError) {
               continue;
            }
         }

         if (!response || !response.ok) {
            const errorMessage = result?.error || `HTTP error! status: ${response?.status || 'unknown'}`;
            console.error('❌ All endpoints failed');
            setErrors({ general: errorMessage });
            return;
         }

         // Handle different success response structures
         if (result && (result.success === true || result.id || result.message)) {
            setSuccess(true);
            toast.success('Artikel berhasil diperbarui! 🎉');

            // Redirect ke halaman articles setelah 2 detik
            setTimeout(() => {
               router.push('/dashboard/articles');
            }, 2000);
         } else {
            console.error('❌ Unexpected response structure:', result);
            setErrors({ general: result?.error || 'Response tidak dikenali dari server' });
         }

      } catch (error) {
         console.error('❌ Error updating article:', error);
      } finally {
         setLoading(false);
      }
   };

   // Handle preview - redirect to article detail page
   const handlePreview = () => {
      if (originalArticle) {
         // Open in new tab untuk preview
         window.open(`/dashboard/articles/${originalArticle.id}/detail`, '_blank');
      }
   };

   if (loadingData) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
               <Loader2 className="h-8 w-8 animate-spin" />
               <span className="ml-2">Memuat data artikel...</span>
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header */}
         <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
               <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex items-center gap-2"
               >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
               </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Artikel</h1>
            <p className="text-gray-600">Perbarui informasi artikel yang sudah ada</p>
         </div>

         {/* Success Alert */}
         {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
               <CheckCircle className="h-4 w-4 text-green-600" />
               <AlertDescription className="text-green-800">
                  Artikel berhasil diperbarui! Mengalihkan ke halaman daftar artikel...
               </AlertDescription>
            </Alert>
         )}

         {/* Error Alert */}
         {errors.general && (
            <Alert className="mb-6 border-red-200 bg-red-50">
               <AlertCircle className="h-4 w-4 text-red-600" />
               <AlertDescription className="text-red-800">
                  {errors.general}
               </AlertDescription>
            </Alert>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Left Column */}
               <div className="space-y-6">
                  {/* Title & Content */}
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <FileTextIcon className="h-5 w-5" />
                           Informasi Utama
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div>
                           <Label htmlFor="title">Judul Artikel *</Label>
                           <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => handleInputChange('title', e.target.value)}
                              placeholder="Masukkan judul artikel yang menarik..."
                              className={errors.title ? 'border-red-500' : ''}
                           />
                           {errors.title && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                 <AlertCircle className="h-3 w-3" />
                                 {errors.title}
                              </p>
                           )}
                        </div>

                        <div>
                           <Label htmlFor="content">Konten Artikel *</Label>
                           <Textarea
                              id="content"
                              value={formData.content}
                              onChange={(e) => handleInputChange('content', e.target.value)}
                              placeholder="Tulis konten lengkap artikel di sini..."
                              rows={8}
                              className={errors.content ? 'border-red-500' : ''}
                           />
                           {errors.content && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                 <AlertCircle className="h-3 w-3" />
                                 {errors.content}
                              </p>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               </div>

               {/* Right Column */}
               <div className="space-y-6">
                  {/* Media & Links */}
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <ImageIcon className="h-5 w-5" />
                           Media & Link
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div>
                           <Label htmlFor="imageUrl">URL Gambar</Label>
                           <Input
                              id="imageUrl"
                              value={formData.imageUrl}
                              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className={errors.imageUrl ? 'border-red-500' : ''}
                           />
                           {errors.imageUrl && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                 <AlertCircle className="h-3 w-3" />
                                 {errors.imageUrl}
                              </p>
                           )}
                        </div>

                        <div>
                           <Label htmlFor="sourceUrl">URL Sumber *</Label>
                           <Input
                              id="sourceUrl"
                              value={formData.sourceUrl}
                              onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                              placeholder="https://example.com/source-article"
                              className={errors.sourceUrl ? 'border-red-500' : ''}
                           />
                           {errors.sourceUrl && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                 <AlertCircle className="h-3 w-3" />
                                 {errors.sourceUrl}
                              </p>
                           )}
                        </div>
                     </CardContent>
                  </Card>

                  {/* Author & Categories */}
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <UserIcon className="h-5 w-5" />
                           Penulis & Kategori
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div>
                           <Label htmlFor="author">Nama Penulis *</Label>
                           <Input
                              id="author"
                              value={formData.author}
                              onChange={(e) => handleInputChange('author', e.target.value)}
                              placeholder="Nama penulis artikel"
                              className={errors.author ? 'border-red-500' : ''}
                           />
                           {errors.author && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                 <AlertCircle className="h-3 w-3" />
                                 {errors.author}
                              </p>
                           )}
                        </div>

                        <div>
                           <Label>Kategori *</Label>
                           <Select
                              value={formData.categoryId}
                              onValueChange={(value) => handleInputChange('categoryId', value)}
                              disabled={loading}
                           >
                              <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                                 <SelectValue placeholder={loading ? "Loading..." : "Pilih kategori"} />
                              </SelectTrigger>
                              <SelectContent>
                                 {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                       {category.name}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           {errors.categoryId && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                 <AlertCircle className="h-3 w-3" />
                                 {errors.categoryId}
                              </p>
                           )}
                        </div>
                     </CardContent>
                  </Card>


                  {/* Publication Date */}
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <CalendarIcon className="h-5 w-5" />
                           Tanggal Publikasi
                        </CardTitle>
                        <CardDescription>
                           Kosongkan untuk menggunakan waktu sekarang secara otomatis
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-3">
                           <div className="flex items-center space-x-2 -mt-4">
                              <input
                                 type="checkbox"
                                 id="useCustomDate"
                                 checked={useCustomDate}
                                 onChange={(e) => {
                                    setUseCustomDate(e.target.checked);
                                    if (!e.target.checked) {
                                       handleInputChange('publishedAt', undefined);
                                    }
                                 }}
                                 className="rounded"
                              />
                              <label htmlFor="useCustomDate" className="text-sm">
                                 Atur tanggal publikasi manual
                              </label>
                           </div>

                           {useCustomDate && (
                              <div>
                                 <Label htmlFor="publishedAt">Tanggal & Waktu Publikasi</Label>
                                 <input
                                    id="publishedAt"
                                    type="datetime-local"
                                    className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none border-gray-300"
                                    value={
                                       formData.publishedAt
                                          ? new Date(formData.publishedAt.getTime() - formData.publishedAt.getTimezoneOffset() * 60000)
                                             .toISOString().slice(0, 16)
                                          : ""
                                    }
                                    onChange={(e) => {
                                       const date = new Date(e.target.value);
                                       handleInputChange("publishedAt", date);
                                    }}
                                    max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                 />
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
               <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!originalArticle}
               >
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Artikel
               </Button>
               <Button type="submit" disabled={loading}>
                  {loading ? (
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                     <Save className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
               </Button>
            </div>
         </form>
      </div>
   );
}