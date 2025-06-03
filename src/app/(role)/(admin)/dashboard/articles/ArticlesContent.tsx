'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
   EyeIcon,
   PencilIcon,
   PlusIcon,
   SearchIcon,
   FilterIcon,
   RefreshCwIcon,
   FileTextIcon,
   CalendarIcon,
   UserIcon,
   Trash2,
   Loader2
} from 'lucide-react'
import {
   Pagination,
   PaginationContent,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
} from '@/components/ui/pagination'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

type Article = {
   id: string
   title: string
   description: string
   imageUrl: string
   sourceUrl: string
   author: string
   publishedAt: string
   category: { name: string }
   user: { username: string }
}

type ApiResponse = {
   data: Article[]
   totalPages: number
   totalItems: number
   currentPage: number
}

type Category = {
   id: string
   name: string
}

const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 500

export default function ListArticlePage() {
   const router = useRouter()
   const searchParams = useSearchParams()

   const [articles, setArticles] = useState<Article[]>([])
   const [totalPages, setTotalPages] = useState(1)
   const [totalItems, setTotalItems] = useState(0)
   const [loading, setLoading] = useState(false)
   const [searchInput, setSearchInput] = useState('')
   const [searchDebounced, setSearchDebounced] = useState('')

   // State untuk categories dari database
   const [categories, setCategories] = useState<Category[]>([])
   const [loadingCategories, setLoadingCategories] = useState(true)

   // Get initial values from URL params
   const currentPage = parseInt(searchParams.get('page') || '1', 10)
   const currentCategory = searchParams.get('category') || 'all'
   const currentSearch = searchParams.get('search') || ''

   // Initialize search input from URL
   useEffect(() => {
      setSearchInput(currentSearch)
      setSearchDebounced(currentSearch)
   }, [currentSearch])

   // Fetch categories dari database
   const fetchCategories = async () => {
      setLoadingCategories(true)
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
         setLoadingCategories(false)
      }
   }

   // Load categories on component mount
   useEffect(() => {
      fetchCategories()
   }, [])

   // Generate categories options dengan database data
   const categoriesOptions = useMemo(() => {
      const options = [{ value: 'all', label: 'Semua Kategori' }]

      categories.forEach(category => {
         options.push({
            value: category.id, // Gunakan ID untuk value
            label: category.name
         })
      })

      return options
   }, [categories])

   // Debounce search input
   useEffect(() => {
      const timer = setTimeout(() => {
         setSearchDebounced(searchInput)
      }, SEARCH_DEBOUNCE_MS)

      return () => clearTimeout(timer)
   }, [searchInput])

   // Update URL when filters change
   const updateUrl = useCallback((params: {
      page?: number
      category?: string
      search?: string
   }) => {
      const newParams = new URLSearchParams(searchParams.toString())

      if (params.page !== undefined) {
         if (params.page === 1) {
            newParams.delete('page')
         } else {
            newParams.set('page', params.page.toString())
         }
      }

      if (params.category !== undefined) {
         if (params.category === 'all') {
            newParams.delete('category')
         } else {
            newParams.set('category', params.category)
         }
      }

      if (params.search !== undefined) {
         if (params.search === '') {
            newParams.delete('search')
         } else {
            newParams.set('search', params.search)
         }
      }

      const newUrl = `${window.location.pathname}?${newParams.toString()}`
      router.replace(newUrl, { scroll: false })
   }, [router, searchParams])

   // Reset to page 1 when search or category changes
   useEffect(() => {
      if (searchDebounced !== currentSearch) {
         updateUrl({ search: searchDebounced, page: 1 })
      }
   }, [searchDebounced, currentSearch, updateUrl])

   // Fetch articles when URL params change
   useEffect(() => {
      const fetchArticles = async () => {
         setLoading(true)
         try {
            const params = new URLSearchParams({
               page: currentPage.toString(),
               limit: ITEMS_PER_PAGE.toString(),
            })

            // FIX: Pastikan parameter category yang dikirim benar
            if (currentCategory !== 'all') {
               // Kirim categoryId, bukan category name
               params.set('categoryId', currentCategory) // Ganti dari 'category' ke 'categoryId'
            }

            if (currentSearch) {
               params.set('search', currentSearch)
            }

            const res = await fetch(`/api/articles?${params.toString()}`)
            if (!res.ok) {
               throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data: ApiResponse = await res.json()
            setArticles(data.data || [])
            setTotalPages(data.totalPages || 1)
            setTotalItems(data.totalItems || 0)
         } catch (err) {
            console.error('Failed to fetch articles:', err)
            setArticles([])
            setTotalPages(1)
            setTotalItems(0)
         } finally {
            setLoading(false)
         }
      }

      fetchArticles()
   }, [currentPage, currentCategory, currentSearch])

   const handleRead = (id: string) => {
      router.push(`/dashboard/articles/${id}/detail`)
   }

   const handleEdit = (id: string) => {
      router.push(`/dashboard/articles/${id}/edit`)
   }

   const handleCreate = () => {
      router.push('/dashboard/articles/create')
   }

   const handleDelete = async (id: string) => {
      if (!confirm('Yakin ingin menghapus artikel ini?')) return

      try {
         const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
         if (!res.ok) {
            throw new Error('Failed to delete article')
         }

         // Refresh data after successful deletion
         window.location.reload()
      } catch (err) {
         console.error('Gagal menghapus artikel:', err)
         alert('Gagal menghapus artikel. Silakan coba lagi.')
      }
   }

   const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
         updateUrl({ page: newPage })
      }
   }

   const handleCategoryChange = (category: string) => {
      updateUrl({ category, page: 1 })
   }

   const handleSearchChange = (value: string) => {
      setSearchInput(value)
   }

   const handleRefresh = () => {
      window.location.reload()
   }

   // Generate pagination numbers with ellipsis
   const paginationNumbers = useMemo(() => {
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
         range.push(i)
      }

      if (currentPage - delta > 2) {
         rangeWithDots.push(1, '...')
      } else {
         rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (currentPage + delta < totalPages - 1) {
         rangeWithDots.push('...', totalPages)
      } else if (totalPages > 1) {
         rangeWithDots.push(totalPages)
      }

      return rangeWithDots
   }, [currentPage, totalPages])

   const showingText = useMemo(() => {
      if (totalItems === 0) return 'Tidak ada data'

      const start = (currentPage - 1) * ITEMS_PER_PAGE + 1
      const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems)
      return `Menampilkan ${start}-${end} dari ${totalItems} artikel`
   }, [currentPage, totalItems])

   // Function untuk mendapatkan nama kategori berdasarkan ID
   const getCategoryName = (categoryId: string) => {
      if (categoryId === 'all') return 'Semua Kategori'
      const category = categories.find(c => c.id === categoryId)
      return category ? category.name : categoryId
   }

   return (
      <div className="space-y-8">
         {/* Header Section */}
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                     <FileTextIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  Kelola Artikel
               </h1>
               <p className="text-gray-600 mt-2">
                  Kelola semua artikel yang telah dipublikasikan
               </p>
            </div>

            <div className="flex gap-3">
               <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="flex items-center gap-2"
                  disabled={loading}
               >
                  <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
               </Button>
               <Button
                  onClick={handleCreate}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
               >
                  <PlusIcon className="h-4 w-4" />
                  Buat Artikel
               </Button>
            </div>
         </div>

         {/* Filters & Search */}
         <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                     placeholder="Cari artikel..."
                     value={searchInput}
                     onChange={(e) => handleSearchChange(e.target.value)}
                     className="pl-10"
                  />
               </div>

               <div className="flex gap-3">
                  <Select value={currentCategory} onValueChange={handleCategoryChange} disabled={loadingCategories}>
                     <SelectTrigger className="w-[200px]">
                        <FilterIcon className="h-4 w-4 mr-2" />
                        <SelectValue placeholder={loadingCategories ? "Loading..." : "Pilih Kategori"} />
                     </SelectTrigger>
                     <SelectContent>
                        {loadingCategories ? (
                           <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                 <Loader2 className="h-4 w-4 animate-spin" />
                                 Loading...
                              </div>
                           </SelectItem>
                        ) : (
                           categoriesOptions.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                 {category.label}
                              </SelectItem>
                           ))
                        )}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            {/* Results info */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
               <span>{showingText}</span>
               {(currentSearch || currentCategory !== 'all') && (
                  <div className="flex items-center gap-2">
                     <span>Filter aktif:</span>
                     {currentSearch && (
                        <Badge variant="secondary">
                           Pencarian: "{currentSearch}"
                        </Badge>
                     )}
                     {currentCategory !== 'all' && (
                        <Badge variant="secondary">
                           Kategori: {getCategoryName(currentCategory)}
                        </Badge>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Table */}
         <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {loading ? (
               <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-gray-500">
                     <RefreshCwIcon className="h-5 w-5 animate-spin" />
                     <span>Memuat data...</span>
                  </div>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <Table>
                     <TableHeader className="bg-gray-50">
                        <TableRow>
                           <TableHead className="w-16 text-center font-semibold">No</TableHead>
                           <TableHead className="font-semibold">Artikel</TableHead>
                           <TableHead className="font-semibold">Kategori</TableHead>
                           <TableHead className="font-semibold">Penulis</TableHead>
                           <TableHead className="text-center font-semibold">Gambar</TableHead>
                           <TableHead className="text-center font-semibold">Tanggal</TableHead>
                           <TableHead className="text-center font-semibold">Aksi</TableHead>
                        </TableRow>
                     </TableHeader>

                     <TableBody>
                        {!articles || articles.length === 0 ? (
                           <TableRow>
                              <TableCell colSpan={7} className="text-center py-12">
                                 <div className="flex flex-col items-center gap-4 text-gray-500">
                                    <FileTextIcon className="h-12 w-12 text-gray-300" />
                                    <div>
                                       <p className="text-lg font-medium">
                                          {currentSearch || currentCategory !== 'all'
                                             ? 'Tidak ada artikel yang sesuai filter'
                                             : 'Tidak ada artikel'
                                          }
                                       </p>
                                       <p className="text-sm">
                                          {currentSearch || currentCategory !== 'all'
                                             ? 'Coba ubah filter atau kata kunci pencarian'
                                             : 'Belum ada artikel yang tersedia saat ini'
                                          }
                                       </p>
                                    </div>
                                    {!currentSearch && currentCategory === 'all' && (
                                       <Button onClick={handleCreate} className="mt-2">
                                          <PlusIcon className="h-4 w-4 mr-2" />
                                          Buat Artikel Pertama
                                       </Button>
                                    )}
                                 </div>
                              </TableCell>
                           </TableRow>
                        ) : (
                           articles.map((article, i) => (
                              <TableRow
                                 key={article.id}
                                 className="hover:bg-gray-50 transition-all duration-200"
                              >
                                 <TableCell className="text-center text-sm font-medium text-gray-600">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                       {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                    </div>
                                 </TableCell>

                                 <TableCell className="max-w-[300px]">
                                    <div className="space-y-1">
                                       <h3 className="font-semibold text-gray-900 truncate">
                                          {article.title}
                                       </h3>
                                       <p className="text-sm text-gray-500 truncate">
                                          {article.description || 'Tidak ada deskripsi'}
                                       </p>
                                    </div>
                                 </TableCell>

                                 <TableCell>
                                    <Badge variant="secondary" className="capitalize">
                                       {article.category?.name || 'Tidak ada'}
                                    </Badge>
                                 </TableCell>

                                 <TableCell>
                                    <div className="flex items-center gap-2">
                                       <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                          <UserIcon className="h-4 w-4 text-blue-600" />
                                       </div>
                                       <span className="text-sm font-medium">
                                          {article.author || 'Unknown'}
                                       </span>
                                    </div>
                                 </TableCell>

                                 <TableCell className="text-center">
                                    {article.imageUrl ? (
                                       <div className="flex justify-center">
                                          <img
                                             src={article.imageUrl}
                                             alt="Thumbnail"
                                             className="h-12 w-16 object-cover rounded-lg border"
                                             loading="lazy"
                                          />
                                       </div>
                                    ) : (
                                       <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                                          <FileTextIcon className="h-4 w-4 text-gray-400" />
                                       </div>
                                    )}
                                 </TableCell>

                                 <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                                       <CalendarIcon className="h-3 w-3" />
                                       {new Date(article.publishedAt).toLocaleDateString('id-ID')}
                                    </div>
                                 </TableCell>

                                 <TableCell className="text-center">
                                    <div className="flex justify-center gap-1">
                                       <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 p-0 hover:bg-blue-50"
                                          onClick={() => handleRead(article.id)}
                                       >
                                          <EyeIcon size={14} className=" text-blue-600" />
                                       </Button>

                                       <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 p-0 hover:bg-amber-50"
                                          onClick={() => handleEdit(article.id)}
                                       >
                                          <PencilIcon className="h-4 w-4 text-amber-600" />
                                       </Button>

                                       <Button
                                          variant="destructive"
                                          size="icon"
                                          className="h-8 w-8 p-0 hover:bg-red-400"
                                          onClick={() => handleDelete(article.id)}
                                       >
                                          <Trash2 className="h-4 w-4 text-red-50" />
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))
                        )}
                     </TableBody>
                  </Table>
               </div>
            )}
         </div>

         {/* Pagination */}
         {totalPages > 1 && !loading && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="text-sm text-gray-600">
                  {showingText}
               </div>

               <Pagination>
                  <PaginationContent>
                     <PaginationItem>
                        <PaginationPrevious
                           href="#"
                           onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(currentPage - 1)
                           }}
                           className={
                              currentPage <= 1
                                 ? "pointer-events-none opacity-50"
                                 : "cursor-pointer hover:bg-gray-100"
                           }
                        />
                     </PaginationItem>

                     {paginationNumbers.map((pageNum, idx) => (
                        <PaginationItem key={idx}>
                           {pageNum === '...' ? (
                              <span className="px-3 py-2 text-gray-500">...</span>
                           ) : (
                              <PaginationLink
                                 href="#"
                                 onClick={(e) => {
                                    e.preventDefault()
                                    handlePageChange(pageNum as number)
                                 }}
                                 isActive={pageNum === currentPage}
                                 className="cursor-pointer"
                              >
                                 {pageNum}
                              </PaginationLink>
                           )}
                        </PaginationItem>
                     ))}

                     <PaginationItem>
                        <PaginationNext
                           href="#"
                           onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(currentPage + 1)
                           }}
                           className={
                              currentPage >= totalPages
                                 ? "pointer-events-none opacity-50"
                                 : "cursor-pointer hover:bg-gray-100"
                           }
                        />
                     </PaginationItem>
                  </PaginationContent>
               </Pagination>
            </div>
         )}
      </div>
   )
}