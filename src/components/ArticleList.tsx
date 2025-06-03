"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Search, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Types based on your API
interface Category {
  id: string;
  name: string;
  _count?: {
    articles: number;
  };
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

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/articles?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data: ApiResponse = await response.json();

      setArticles(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=50');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [currentPage, searchTerm, selectedCategory, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Function to generate pagination numbers
  const generatePaginationNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // If total pages is less than or equal to max visible, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end page numbers
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      // Adjust start page if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Terjadi Kesalahan
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchArticles} variant="outline">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Artikel Terbaru
        </h1>
        <p className="text-gray-600">
          Temukan artikel menarik dan terbaru dari berbagai kategori
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Cari artikel..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name.toLowerCase()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Info */}
      {!loading && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {articles.length} dari {totalItems} artikel
          </p>
          <p className="text-sm text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Memuat artikel...</p>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {!loading && articles.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
          {articles.map((article) => (
            <Card key={article.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200" >
              {/* Image */}
              <div className="relative h-48 overflow-hidden rounded-t-lg" >
                {
                  article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                          📄
                        </div>
                        <p className="text-sm">No Image</p>
                      </div>
                    </div>
                  )
                }
              </div>

              {/* Content */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category.name}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>

                <Link href={`/article/${article.id}`}>
                  <CardTitle className="text-lg line-clamp-2 leading-tight hover:text-blue-600 transition-colors">
                    {article.title}
                  </CardTitle>
                </Link>

                {article.description && (
                  <CardDescription className="line-clamp-3">
                    {article.description}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          ))
          }
        </div >
      )}

      {/* Empty State */}
      {
        !loading && articles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak Ada Artikel
            </h3>
            <p className="text-gray-600">
              Tidak ada artikel yang sesuai dengan kriteria pencarian Anda.
            </p>
          </div>
        )
      }

      {/* Pagination */}
      {
        !loading && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Sebelumnya
            </Button>

            <div className="flex items-center space-x-1">
              {generatePaginationNumbers().map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )
      }
    </div >
  );
} 