"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft, ExternalLink, User, Calendar, Share2, Loader2, AlertCircle, Eye, ChevronRight } from "lucide-react";
import Link from "next/link";

// Types based on your API
interface Category {
	id: string;
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
	categoryId: string;
	category: Category;
}

interface RelatedArticle {
	id: string;
	title: string;
	description: string | null;
	imageUrl: string | null;
	publishedAt: string;
	author: string;
	category: Category;
}

export default function ArticleDetailPage() {
	const { id } = useParams();
	const [article, setArticle] = useState<Article | null>(null);
	const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchArticleWithRelated = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch article with related articles in single request
				const response = await fetch(`/api/articles/${id}?related=true`);

				if (!response.ok) {
					if (response.status === 404) {
						setError('Artikel tidak ditemukan');
					} else {
						throw new Error('Failed to fetch article');
					}
					return;
				}

				const data = await response.json();

				// Set article data
				setArticle(data);

				// Set related articles (filter out current article just in case)
				const related = data.relatedArticles || [];
				const filteredRelated = related
					.filter((art: RelatedArticle) => art.id !== id)
					.slice(0, 3);

				setRelatedArticles(filteredRelated);

			} catch (err) {
				setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchArticleWithRelated();
		}
	}, [id]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("id-ID", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatRelativeDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const calculateReadingTime = (content: string) => {
		const wordsPerMinute = 200;
		// Clean content and count words
		const cleanContent = content.replace(/\s*\[\+\d+\s+chars\]$/, '');
		const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
		const readingTime = Math.ceil(wordCount / wordsPerMinute);
		return Math.max(1, readingTime); // Minimum 1 minute
	};

	const formatContent = (content: string) => {
		if (!content) return [];

		// Remove character count indicator like [+2181 chars]
		let cleanContent = content.replace(/\s*\[\+\d+\s+chars\]$/, '');
		let paragraphs = cleanContent.split('\n\n');

		if (paragraphs.length === 1) {
			paragraphs = cleanContent.split('\n');
		}

		return paragraphs
			.map(p => p.trim())
			.filter(p => p.length > 0);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

	if (error || !article) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex flex-col items-center justify-center min-h-[400px] text-center">
						<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							{error || 'Artikel tidak ditemukan'}
						</h3>
						<p className="text-gray-600 mb-6">
							Artikel yang Anda cari tidak dapat ditemukan atau telah dihapus.
						</p>
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

	const readingTime = calculateReadingTime(article.content);
	const contentParagraphs = formatContent(article.content);

	return (
		<div className="min-h-screen bg-gray-50 pt-10">
			{/* Header Navigation */}

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Article Content */}
					<div className="lg:col-span-2">
						<article className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
							{/* Cover Image */}
							<div className="relative">
								{article.imageUrl ? (
									<div className="aspect-video w-full overflow-hidden">
										<img
											src={article.imageUrl}
											alt={article.title}
											className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
										/>
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
										{article.category?.name}
									</Badge>
								</div>
							</div>

							{/* Article Content */}
							<div className="p-8 lg:p-12">
								{/* Meta Information */}
								<div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-100">
									<div className="flex items-center">
										<User className="h-4 w-4 mr-2 text-gray-400" />
										<span className="font-medium text-gray-700">{article.author}</span>
									</div>
									<div className="flex items-center">
										<Calendar className="h-4 w-4 mr-2 text-gray-400" />
										<span>{formatDate(article.publishedAt)}</span>
									</div>
									<div className="flex items-center">
										<Clock className="h-4 w-4 mr-2 text-gray-400" />
										<span>{formatTime(article.publishedAt)}</span>
									</div>
									<div className="flex items-center">
										<Eye className="h-4 w-4 mr-2 text-gray-400" />
										<span>{readingTime} menit baca</span>
									</div>
								</div>

								{/* Title */}
								<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
									{article.title}
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
										// Fallback: display raw content if parsing fails
										<div className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
											{article.content.replace(/\s*\[\+\d+\s+chars\]$/, '')}
										</div>
									)}
								</div>

								{/* Source Link */}
								{article.sourceUrl && (
									<div className="mt-12 pt-8 border-t border-gray-200">
										<div className="bg-gray-50 rounded-xl p-6">
											<p className="text-sm text-gray-600 mb-4 font-medium">
												Sumber artikel:
											</p>
											<a
												href={article.sourceUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
											>
												Baca artikel asli
												<ExternalLink className="h-4 w-4 ml-2" />
											</a>
										</div>
									</div>
								)}
							</div>
						</article>

						{/* Action Buttons */}
						<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
							<Link href="/">
								<Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-gray-50">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Kembali ke Beranda
								</Button>
							</Link>

							{article.sourceUrl && (
								<a
									href={article.sourceUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
										Baca Artikel Asli
										<ExternalLink className="h-4 w-4 ml-2" />
									</Button>
								</a>
							)}
						</div>
					</div>

					{/* Sidebar - Related Articles */}
					<div className="lg:col-span-1">
						<div className="sticky top-24">
							<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
								<div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
									<h3 className="text-xl font-bold text-gray-900 mb-2">Artikel Terkait</h3>
									<p className="text-sm text-gray-600">Artikel lain dalam kategori {article.category?.name}</p>
								</div>

								{/* Related Articles Content */}
								{relatedArticles.length > 0 ? (
									<div className="divide-y divide-gray-100">
										{relatedArticles.map((relatedArticle, index) => (
											<Link key={relatedArticle.id} href={`/article/${relatedArticle.id}`}>
												<div className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer">
													<div className="flex gap-4">
														<div className="flex-shrink-0">
															{relatedArticle.imageUrl ? (
																<img
																	src={relatedArticle.imageUrl}
																	alt={relatedArticle.title}
																	className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform"
																/>
															) : (
																<div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
																	<span className="text-2xl">📰</span>
																</div>
															)}
														</div>
														<div className="flex-1 min-w-0">
															<h4 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
																{relatedArticle.title}
															</h4>
															<div className="flex items-center text-xs text-gray-500 mb-2">
																<span>{relatedArticle.author}</span>
																<span className="mx-2">•</span>
																<span>{formatRelativeDate(relatedArticle.publishedAt)}</span>
															</div>
															{relatedArticle.description && (
																<p className="text-xs text-gray-600 line-clamp-2">
																	{relatedArticle.description}
																</p>
															)}
														</div>
														<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
													</div>
												</div>
											</Link>
										))}
									</div>
								) : (
									<div className="p-6 text-center text-gray-500">
										<p className="text-sm">Tidak ada artikel terkait ditemukan</p>
									</div>
								)}

								{relatedArticles.length > 0 && article.category && (
									<div className="p-6 bg-gray-50 border-t border-gray-100">
										<Link href={`/article/category/${encodeURIComponent(article.category.name.toLowerCase())}`}>
											<Button variant="outline" size="sm" className="w-full hover:bg-white">
												Lihat Semua Artikel {article.category.name}
												<ChevronRight className="h-4 w-4 ml-2" />
											</Button>
										</Link>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}