"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
   Clock
} from 'lucide-react';

// Interface tanpa description, publishedAt opsional
interface FormData {
   title: string;
   content: string;
   imageUrl: string;
   sourceUrl: string;
   author: string;
   publishedAt?: Date;
   categoryId: string;
}

// ValidationErrors tanpa description
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

const CreateArticle = () => {
   // Form state tanpa description, publishedAt undefined
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
   const [previewMode, setPreviewMode] = useState(false);
   const [useCustomDate, setUseCustomDate] = useState(false);

   // Function untuk generate description dari 100 kata pertama
   const generateDescription = (content: string): string => {
      if (!content.trim()) return '';

      const words = content.trim().split(/\s+/);
      const first100Words = words.slice(0, 100).join(' ');

      return first100Words + (words.length > 100 ? '...' : '');
   };

   // Validation function tanpa description validation
   const validateForm = (data: FormData): ValidationErrors => {
      const errors: ValidationErrors = {};

      // Title validation
      if (!data.title.trim()) {
         errors.title = 'Judul artikel wajib diisi';
      } else if (data.title.length < 5) {
         errors.title = 'Judul minimal 5 karakter';
      } else if (data.title.length > 200) {
         errors.title = 'Judul maksimal 200 karakter';
      }

      // Content validation
      if (!data.content.trim()) {
         errors.content = 'Konten artikel wajib diisi';
      } else if (data.content.length < 50) {
         errors.content = 'Konten minimal 50 karakter';
      }

      // Source URL validation
      if (!data.sourceUrl.trim()) {
         errors.sourceUrl = 'URL sumber wajib diisi';
      } else {
         try {
            new URL(data.sourceUrl);
         } catch {
            errors.sourceUrl = 'Format URL tidak valid';
         }
      }

      // Image URL validation (optional but if filled must be valid)
      if (data.imageUrl.trim()) {
         try {
            new URL(data.imageUrl);
         } catch {
            errors.imageUrl = 'Format URL gambar tidak valid';
         }
      }

      // Author validation
      if (!data.author.trim()) {
         errors.author = 'Nama penulis wajib diisi';
      } else if (data.author.length < 2) {
         errors.author = 'Nama penulis minimal 2 karakter';
      }

      // Category validation
      if (!data.categoryId) {
         errors.categoryId = 'Kategori wajib dipilih';
      }

      return errors;
   };

   // Fetch categories dari API
   const fetchCategory = async () => {
      setLoadingData(true);
      try {
         const response = await fetch('/api/categories')
         const result = await response.json()

         if (result.success) {
            setCategories(result.data)
         } else {
            console.error('Failed to fetch categories:', result.error)
         }
      } catch (error) {
         console.error('Error fetching categories:', error)
      } finally {
         setLoadingData(false)
      }
   };

   useEffect(() => {
      fetchCategory();
   }, []);

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

   // Handle form submission dengan auto-generate description dan publishedAt
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const validationErrors = validateForm(formData);
      setErrors(validationErrors);

      // If there are errors, don't submit
      if (Object.keys(validationErrors).length > 0) {
         return;
      }

      // Prepare data dengan auto-generated values
      const submitData = {
         ...formData,
         description: generateDescription(formData.content), // Auto-generate description
         publishedAt: formData.publishedAt || new Date() // Use current time if not set
      };

      setLoading(true);
      setSuccess(false);
      setErrors({});

      try {

         const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               ...submitData,
               publishedAt: submitData.publishedAt.toISOString()
            }),
         });

         const result = await response.json();

         if (!response.ok) {
            if (result.error) {
               setErrors({ general: result.error });
            } else {
               setErrors({ general: `HTTP error! status: ${response.status}` });
            }
            return;
         }

         if (result.success) {
            setSuccess(true);

            // Reset form after successful submission
            setTimeout(() => {
               setFormData({
                  title: '',
                  content: '',
                  imageUrl: '',
                  sourceUrl: '',
                  author: '',
                  publishedAt: undefined,
                  categoryId: ''
               });
               setUseCustomDate(false);
               setSuccess(false);
            }, 3000);
         } else {
            setErrors({ general: result.error || 'Gagal membuat artikel' });
         }

      } catch (error) {
         console.error('❌ Error creating article:', error);
         setErrors({ general: 'Terjadi kesalahan jaringan. Silakan coba lagi.' });
      } finally {
         setLoading(false);
      }
   };

   // Preview component dengan format yang sama seperti halaman detail
   const ArticlePreview = () => {
      const generateDescription = (content: string): string => {
         if (!content.trim()) return '';
         const words = content.trim().split(/\s+/);
         const first100Words = words.slice(0, 100).join(' ');
         return first100Words + (words.length > 100 ? '...' : '');
      };

      const formatContent = (content: string) => {
         if (!content) return [];

         // Split by double line breaks first, then single line breaks for better formatting
         let paragraphs = content.split('\n\n');

         // If no double line breaks, try single line breaks
         if (paragraphs.length === 1) {
            paragraphs = content.split('\n');
         }

         // Filter out empty paragraphs and trim whitespace
         return paragraphs
            .map(p => p.trim())
            .filter(p => p.length > 0);
      };

      const formatDate = (dateString: Date) => {
         const date = new Date(dateString);
         return date.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
         });
      };

      const formatTime = (dateString: Date) => {
         const date = new Date(dateString);
         return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
         });
      };

      const currentDate = formData.publishedAt || new Date();
      const description = generateDescription(formData.content);
      const contentParagraphs = formatContent(formData.content);
      const selectedCategory = categories.find(c => c.id === formData.categoryId);

      return (
         <div className="min-h-screen bg-gray-50 pt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="max-w-4xl mx-auto">
                  <article className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                     {/* Cover Image */}
                     <div className="relative">
                        {formData.imageUrl ? (
                           <div className="aspect-video w-full overflow-hidden">
                              <img
                                 src={formData.imageUrl}
                                 alt={formData.title || 'Preview Image'}
                                 className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                 onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    // Show fallback div
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                 }}
                              />
                              {/* Fallback div (hidden by default) */}
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
                        {selectedCategory && (
                           <div className="absolute top-4 left-4">
                              <Badge className="bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                                 {selectedCategory.name}
                              </Badge>
                           </div>
                        )}
                     </div>

                     {/* Article Content */}
                     <div className="p-8 lg:p-12">
                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-100">
                           <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium text-gray-700">
                                 {formData.author || 'Nama Penulis'}
                              </span>
                           </div>
                           <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{formatDate(currentDate)}</span>
                           </div>
                           <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{formatTime(currentDate)}</span>
                           </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
                           {formData.title || 'Judul Artikel'}
                        </h1>

                        {/* Description */}
                        {description && (
                           <div className="text-xl text-gray-700 leading-relaxed mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                              <p className="font-medium italic">{description}</p>
                           </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg prose-gray max-w-none">
                           {formData.content ? (
                              contentParagraphs.length > 0 ? (
                                 contentParagraphs.map((paragraph: string, idx: number) => (
                                    <p key={idx} className="text-gray-800 leading-relaxed mb-6 text-lg">
                                       {paragraph}
                                    </p>
                                 ))
                              ) : (
                                 // Fallback: display raw content if parsing fails
                                 <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                                    {formData.content}
                                 </div>
                              )
                           ) : (
                              <div className="text-gray-400 italic text-lg">
                                 Konten artikel akan ditampilkan di sini...
                              </div>
                           )}
                        </div>
                     </div>
                  </article>
               </div>
            </div>
         </div>
      );
   };

   if (loadingData) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
               <Loader2 className="h-8 w-8 animate-spin" />
               <span className="ml-2">Memuat data...</span>
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header */}
         <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Artikel Baru</h1>
            <p className="text-gray-600">Isi form di bawah untuk membuat artikel baru</p>
         </div>

         {/* Success Alert */}
         {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
               <CheckCircle className="h-4 w-4 text-green-600" />
               <AlertDescription className="text-green-800">
                  Artikel berhasil dibuat! 🎉
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

         {/* Toggle between Form and Preview */}
         <div className="mb-6 flex gap-2">
            <Button
               variant={!previewMode ? "default" : "outline"}
               onClick={() => setPreviewMode(false)}
               className="flex items-center gap-2"
            >
               <FileTextIcon className="h-4 w-4" />
               Form
            </Button>
            <Button
               variant={previewMode ? "default" : "outline"}
               onClick={() => setPreviewMode(true)}
               className="flex items-center gap-2"
            >
               <Eye className="h-4 w-4" />
               Preview
            </Button>
         </div>

         {!previewMode ? (
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
                                 <label htmlFor="useCustomDate" className="text-sm ">
                                    Atur tanggal publikasi manual
                                 </label>
                              </div>

                              {useCustomDate && (
                                 <div>
                                    <Label htmlFor="publishedAt">Tanggal & Waktu Publikasi</Label>
                                    <input
                                       id="publishedAt"
                                       type="datetime-local"
                                       className=" w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none border-gray-300"
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
                  </div>
               </div>

               {/* Submit Button */}
               <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setPreviewMode(true)}>
                     <Eye className="h-4 w-4 mr-2" />
                     Preview
                  </Button>
                  <Button type="submit" disabled={loading}>
                     {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     ) : (
                        <Save className="h-4 w-4 mr-2" />
                     )}
                     {loading ? 'Menyimpan...' : 'Simpan Artikel'}
                  </Button>
               </div>
            </form>
         ) : (
            <div>
               <ArticlePreview />
            </div>
         )}
      </div>
   );
};

export default CreateArticle;