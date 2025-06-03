'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from 'use-debounce';
import {
   Pagination,
   PaginationContent,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
} from '@/components/ui/pagination';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
   EyeIcon,
   Pencil,
   Trash2,
   Plus,
   Search,
   RefreshCw,
   FolderIcon,
   AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Category = {
   id: string;
   name: string;
   _count?: {
      articles: number;
   };
};

type ApiResponse = {
   success: boolean;
   data: Category[];
   totalPages?: number;
   totalItems?: number;
   currentPage?: number;
};

const ITEMS_PER_PAGE = 10;

export default function CategoryPage() {
   const [categories, setCategories] = useState<Category[]>([]);
   const [search, setSearch] = useState('');
   const [debouncedSearch] = useDebounce(search, 400);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [totalItems, setTotalItems] = useState(0);
   const [loading, setLoading] = useState(false);

   // Dialog states
   const [createDialogOpen, setCreateDialogOpen] = useState(false);
   const [editDialogOpen, setEditDialogOpen] = useState(false);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

   // Form states
   const [categoryName, setCategoryName] = useState('');
   const [submitting, setSubmitting] = useState(false);

   const fetchCategories = async () => {
      setLoading(true);
      try {
         const params = new URLSearchParams({
            page: page.toString(),
            limit: ITEMS_PER_PAGE.toString(),
         });

         if (debouncedSearch) {
            params.set('search', debouncedSearch);
         }

         const response = await fetch(`/api/categories?${params.toString()}`);
         if (!response.ok) {
            throw new Error('Failed to fetch categories');
         }

         const data: ApiResponse = await response.json();

         if (data.success) {
            setCategories(data.data || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.totalItems || 0);
         } else {
            throw new Error('API returned error');
         }
      } catch (error) {
         console.error('Error fetching categories:', error);
         toast.error('Gagal memuat data kategori');
         setCategories([]);
         setTotalPages(1);
         setTotalItems(0);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchCategories();
   }, [debouncedSearch, page]);

   const handleCreateCategory = async () => {
      if (!categoryName.trim()) {
         toast.error('Nama kategori tidak boleh kosong');
         return;
      }

      setSubmitting(true);
      try {
         const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: categoryName.trim() }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create category');
         }

         toast.success('Kategori berhasil dibuat');
         setCreateDialogOpen(false);
         setCategoryName('');
         fetchCategories();
      } catch (error) {
         console.error('Error creating category:', error);
         toast.error(error instanceof Error ? error.message : 'Gagal membuat kategori');
      } finally {
         setSubmitting(false);
      }
   };

   const handleEditCategory = async () => {
      if (!selectedCategory || !categoryName.trim()) {
         toast.error('Nama kategori tidak boleh kosong');
         return;
      }

      setSubmitting(true);
      try {
         const response = await fetch(`/api/categories/${selectedCategory.id}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: categoryName.trim() }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update category');
         }

         toast.success('Kategori berhasil diperbarui');
         setEditDialogOpen(false);
         setCategoryName('');
         setSelectedCategory(null);
         fetchCategories();
      } catch (error) {
         console.error('Error updating category:', error);
         toast.error(error instanceof Error ? error.message : 'Gagal memperbarui kategori');
      } finally {
         setSubmitting(false);
      }
   };

   const handleDeleteCategory = async () => {
      if (!selectedCategory) return;

      setSubmitting(true);
      try {
         const response = await fetch(`/api/categories/${selectedCategory.id}`, {
            method: 'DELETE',
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete category');
         }

         toast.success('Kategori berhasil dihapus');
         setDeleteDialogOpen(false);
         setSelectedCategory(null);
         fetchCategories();
      } catch (error) {
         console.error('Error deleting category:', error);
         toast.error(error instanceof Error ? error.message : 'Gagal menghapus kategori');
      } finally {
         setSubmitting(false);
      }
   };

   const openEditDialog = (category: Category) => {
      setSelectedCategory(category);
      setCategoryName(category.name);
      setEditDialogOpen(true);
   };

   const openDeleteDialog = (category: Category) => {
      setSelectedCategory(category);
      setDeleteDialogOpen(true);
   };

   const handleRefresh = () => {
      fetchCategories();
   };

   const showingText = () => {
      if (totalItems === 0) return 'Tidak ada data';
      const start = (page - 1) * ITEMS_PER_PAGE + 1;
      const end = Math.min(page * ITEMS_PER_PAGE, totalItems);
      return `Menampilkan ${start}-${end} dari ${totalItems} kategori`;
   };

   return (
      <div className="space-y-8">
         {/* Header Section */}
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                     <FolderIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  Manajemen Kategori
               </h1>
               <p className="text-gray-600 mt-2">
                  Kelola semua kategori artikel
               </p>
            </div>

            <div className="flex gap-3">
               <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="flex items-center gap-2"
                  disabled={loading}
               >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
               </Button>

               <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                     <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4" />
                        Tambah Kategori
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
                        <DialogTitle>Tambah Kategori Baru</DialogTitle>
                        <DialogDescription>
                           Masukkan nama kategori yang ingin ditambahkan
                        </DialogDescription>
                     </DialogHeader>
                     <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="category-name" className="text-right">
                              Nama
                           </Label>
                           <Input
                              id="category-name"
                              value={categoryName}
                              onChange={(e) => setCategoryName(e.target.value)}
                              className="col-span-3"
                              placeholder="Masukkan nama kategori"
                              disabled={submitting}
                           />
                        </div>
                     </div>
                     <DialogFooter>
                        <Button
                           type="button"
                           variant="outline"
                           onClick={() => setCreateDialogOpen(false)}
                           disabled={submitting}
                        >
                           Batal
                        </Button>
                        <Button
                           type="submit"
                           onClick={handleCreateCategory}
                           disabled={submitting || !categoryName.trim()}
                        >
                           {submitting ? (
                              <>
                                 <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                 Menyimpan...
                              </>
                           ) : (
                              'Simpan'
                           )}
                        </Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>
            </div>
         </div>

         {/* Table Section */}
         <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {loading ? (
               <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-gray-500">
                     <RefreshCw className="h-5 w-5 animate-spin" />
                     <span>Memuat data...</span>
                  </div>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <Table>
                     <TableHeader className="bg-gray-50">
                        <TableRow>
                           <TableHead className="w-16 text-center font-semibold">No</TableHead>
                           <TableHead className="font-semibold">Nama Kategori</TableHead>
                           <TableHead className="text-center font-semibold">Jumlah Artikel</TableHead>
                           <TableHead className="text-center font-semibold">Aksi</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {categories.length === 0 ? (
                           <TableRow>
                              <TableCell colSpan={4} className="text-center py-12">
                                 <div className="flex flex-col items-center gap-4 text-gray-500">
                                    <FolderIcon className="h-12 w-12 text-gray-300" />
                                    <div>
                                       <p className="text-lg font-medium">
                                          {search ? 'Tidak ada kategori yang sesuai' : 'Tidak ada kategori'}
                                       </p>
                                       <p className="text-sm">
                                          {search ? 'Coba ubah kata kunci pencarian' : 'Belum ada kategori yang tersedia'}
                                       </p>
                                    </div>
                                    {!search && (
                                       <Button
                                          onClick={() => setCreateDialogOpen(true)}
                                          className="mt-2"
                                       >
                                          <Plus className="h-4 w-4 mr-2" />
                                          Tambah Kategori Pertama
                                       </Button>
                                    )}
                                 </div>
                              </TableCell>
                           </TableRow>
                        ) : (
                           categories.map((category, index) => (
                              <TableRow key={category.id} className="hover:bg-gray-50 transition-all duration-200">
                                 <TableCell className="text-center text-sm font-medium text-gray-600">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                       {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                    </div>
                                 </TableCell>

                                 <TableCell>
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                          <FolderIcon className="h-5 w-5 text-purple-600" />
                                       </div>
                                       <div>
                                          <p className="font-semibold text-gray-900">{category.name}</p>
                                          <p className="text-sm text-gray-500">ID: {category.id.slice(0, 8)}...</p>
                                       </div>
                                    </div>
                                 </TableCell>

                                 <TableCell className="text-center">
                                    <Badge variant="secondary" className="font-medium">
                                       {category._count?.articles || 0} artikel
                                    </Badge>
                                 </TableCell>

                                 <TableCell className="text-center">
                                    <div className="flex justify-center gap-1">
                                       <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 p-0 hover:bg-amber-50"
                                          onClick={() => openEditDialog(category)}
                                       >
                                          <Pencil className="h-4 w-4 text-amber-600" />
                                       </Button>

                                       <Button
                                          variant="destructive"
                                          size="icon"
                                          className="h-8 w-8 p-0 hover:bg-red-400"
                                          onClick={() => openDeleteDialog(category)}
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
                  {showingText()}
               </div>

               <Pagination>
                  <PaginationContent>
                     <PaginationItem>
                        <PaginationPrevious
                           href="#"
                           onClick={(e) => {
                              e.preventDefault();
                              if (page > 1) setPage(page - 1);
                           }}
                           className={
                              page <= 1
                                 ? "pointer-events-none opacity-50"
                                 : "cursor-pointer hover:bg-gray-100"
                           }
                        />
                     </PaginationItem>

                     {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i}>
                           <PaginationLink
                              href="#"
                              isActive={page === i + 1}
                              onClick={(e) => {
                                 e.preventDefault();
                                 setPage(i + 1);
                              }}
                              className="cursor-pointer"
                           >
                              {i + 1}
                           </PaginationLink>
                        </PaginationItem>
                     ))}

                     <PaginationItem>
                        <PaginationNext
                           href="#"
                           onClick={(e) => {
                              e.preventDefault();
                              if (page < totalPages) setPage(page + 1);
                           }}
                           className={
                              page >= totalPages
                                 ? "pointer-events-none opacity-50"
                                 : "cursor-pointer hover:bg-gray-100"
                           }
                        />
                     </PaginationItem>
                  </PaginationContent>
               </Pagination>
            </div>
         )}

         {/* Edit Dialog */}
         <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Edit Kategori</DialogTitle>
                  <DialogDescription>
                     Ubah nama kategori "{selectedCategory?.name}"
                  </DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="edit-category-name" className="text-right">
                        Nama
                     </Label>
                     <Input
                        id="edit-category-name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="col-span-3"
                        placeholder="Masukkan nama kategori"
                        disabled={submitting}
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => {
                        setEditDialogOpen(false);
                        setCategoryName('');
                        setSelectedCategory(null);
                     }}
                     disabled={submitting}
                  >
                     Batal
                  </Button>
                  <Button
                     type="submit"
                     onClick={handleEditCategory}
                     disabled={submitting || !categoryName.trim()}
                  >
                     {submitting ? (
                        <>
                           <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                           Menyimpan...
                        </>
                     ) : (
                        'Simpan Perubahan'
                     )}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Delete Dialog */}
         <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                     <AlertTriangle className="h-5 w-5" />
                     Hapus Kategori
                  </DialogTitle>
                  <DialogDescription>
                     Apakah Anda yakin ingin menghapus kategori <strong>"{selectedCategory?.name}"</strong>?
                     <br />
                     <span className="text-red-600 font-medium">
                        Tindakan ini tidak dapat dibatalkan!
                     </span>
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => {
                        setDeleteDialogOpen(false);
                        setSelectedCategory(null);
                     }}
                     disabled={submitting}
                  >
                     Batal
                  </Button>
                  <Button
                     type="submit"
                     variant="destructive"
                     onClick={handleDeleteCategory}
                     disabled={submitting}
                  >
                     {submitting ? (
                        <>
                           <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                           Menghapus...
                        </>
                     ) : (
                        'Ya, Hapus'
                     )}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
