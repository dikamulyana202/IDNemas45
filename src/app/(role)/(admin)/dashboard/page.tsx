"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BookOpen, Users, TrendingUp, Calendar, Eye, FileText, BarChart3 } from 'lucide-react';

// Updated interfaces to match your Prisma schema
interface Article {
	id: string;
	title: string;
	description?: string;
	content?: string;
	imageUrl?: string;
	sourceUrl: string;
	author?: string;
	publishedAt: string; // API returns string, we'll convert to Date
	userId: string;
	categoryId: string;
	user: {
		username: string;
	};
	category: {
		name: string;
	};
}

interface ApiResponse {
	data: Article[];
	totalPages: number;
}

interface DashboardStats {
	totalArticles: number;
	totalAuthors: number;
	totalCategories: number;
	articlesThisMonth: number;
	articlesThisWeek: number;
	articlesToday: number;
	growthPercentage: number;
	weeklyGrowth: number;
}

interface ChartData {
	date: string;
	articles: number;
	fullDate: string;
	dayName: string;
}

const Dashboard = () => {
	const [articles, setArticles] = useState<Article[]>([]);
	const [stats, setStats] = useState<DashboardStats>({
		totalArticles: 0,
		totalAuthors: 0,
		totalCategories: 0,
		articlesThisMonth: 0,
		articlesThisWeek: 0,
		articlesToday: 0,
		growthPercentage: 0,
		weeklyGrowth: 0
	});
	const [selectedPeriod, setSelectedPeriod] = useState('7');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Function to fetch all articles for dashboard statistics
	const fetchAllArticles = async (): Promise<Article[]> => {
		const allArticles: Article[] = [];
		let page = 1;
		let hasMore = true;

		try {
			while (hasMore) {
				const response = await fetch(`/api/articles?page=${page}&limit=100`);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data: ApiResponse = await response.json();

				if (data.data && data.data.length > 0) {
					allArticles.push(...data.data);
					page++;
					// Check if we've reached the last page
					hasMore = page <= data.totalPages;
				} else {
					hasMore = false;
				}
			}
		} catch (error) {
			console.error('Error fetching articles:', error);
			throw error;
		}

		return allArticles;
	};

	// Calculate statistics from articles data
	const calculateStats = (articlesData: Article[]): DashboardStats => {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const weekAgo = new Date(today);
		weekAgo.setDate(weekAgo.getDate() - 7);
		const monthAgo = new Date(today);
		monthAgo.setMonth(monthAgo.getMonth() - 1);
		const lastWeek = new Date(weekAgo);
		lastWeek.setDate(lastWeek.getDate() - 7);
		const lastMonth = new Date(monthAgo);
		lastMonth.setMonth(lastMonth.getMonth() - 1);

		const articlesToday = articlesData.filter(article => {
			const articleDate = new Date(article.publishedAt);
			return articleDate >= today;
		}).length;

		const articlesThisWeek = articlesData.filter(article => {
			const articleDate = new Date(article.publishedAt);
			return articleDate >= weekAgo;
		}).length;

		const articlesThisMonth = articlesData.filter(article => {
			const articleDate = new Date(article.publishedAt);
			return articleDate >= monthAgo;
		}).length;

		const articlesLastWeek = articlesData.filter(article => {
			const articleDate = new Date(article.publishedAt);
			return articleDate >= lastWeek && articleDate < weekAgo;
		}).length;

		const articlesLastMonth = articlesData.filter(article => {
			const articleDate = new Date(article.publishedAt);
			return articleDate >= lastMonth && articleDate < monthAgo;
		}).length;

		// Get unique authors and categories
		const uniqueAuthors = [...new Set(articlesData.map(a => a.author).filter(Boolean))];
		const uniqueCategories = [...new Set(articlesData.map(a => a.category.name))];

		const monthlyGrowth = articlesLastMonth > 0
			? ((articlesThisMonth - articlesLastMonth) / articlesLastMonth) * 100
			: articlesThisMonth > 0 ? 100 : 0;

		const weeklyGrowth = articlesLastWeek > 0
			? ((articlesThisWeek - articlesLastWeek) / articlesLastWeek) * 100
			: articlesThisWeek > 0 ? 100 : 0;

		return {
			totalArticles: articlesData.length,
			totalAuthors: uniqueAuthors.length,
			totalCategories: uniqueCategories.length,
			articlesThisMonth,
			articlesThisWeek,
			articlesToday,
			growthPercentage: Math.round(monthlyGrowth),
			weeklyGrowth: Math.round(weeklyGrowth)
		};
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				const articlesData = await fetchAllArticles();

				setArticles(articlesData);

				// Calculate statistics
				const calculatedStats = calculateStats(articlesData);
				setStats(calculatedStats);

			} catch (error) {
				console.error('❌ Error fetching dashboard data:', error);
				setError('Gagal memuat data dashboard. Silakan coba lagi.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Prepare chart data based on selected period
	const getChartData = (): ChartData[] => {
		const days = parseInt(selectedPeriod);
		const chartData: ChartData[] = [];
		const now = new Date();

		for (let i = days - 1; i >= 0; i--) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			const endOfDay = new Date(startOfDay);
			endOfDay.setDate(endOfDay.getDate() + 1);

			const dayArticles = articles.filter(article => {
				const articleDate = new Date(article.publishedAt);
				return articleDate >= startOfDay && articleDate < endOfDay;
			});

			chartData.push({
				date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
				articles: dayArticles.length,
				fullDate: date.toISOString().split('T')[0],
				dayName: date.toLocaleDateString('id-ID', { weekday: 'short' })
			});
		}

		return chartData;
	};

	const chartData = getChartData();
	const maxArticles = Math.max(...chartData.map(d => d.articles), 1);

	// Custom tooltip for chart
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
					<p className="font-medium text-gray-900">{`${data.dayName}, ${label}`}</p>
					<p className="text-blue-600">{`${payload[0].value} artikel dipublikasi`}</p>
				</div>
			);
		}
		return null;
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
						))}
					</div>
					<div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<div className="text-red-600 text-lg font-semibold mb-2">Error</div>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Coba Lagi
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
				<p className="text-gray-600">Monitor artikel dan statistik konten Anda</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{/* Total Articles */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Artikel</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalArticles.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Semua artikel yang dipublikasi
						</p>
					</CardContent>
				</Card>

				{/* This Month */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.articlesThisMonth}</div>
						<p className={`text-xs flex items-center ${stats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
							}`}>
							<TrendingUp className="h-3 w-3 mr-1" />
							{stats.growthPercentage >= 0 ? '+' : ''}{stats.growthPercentage}% dari bulan lalu
						</p>
					</CardContent>
				</Card>

				{/* This Week */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Minggu Ini</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.articlesThisWeek}</div>
						<p className={`text-xs flex items-center ${stats.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
							}`}>
							<TrendingUp className="h-3 w-3 mr-1" />
							{stats.weeklyGrowth >= 0 ? '+' : ''}{stats.weeklyGrowth}% dari minggu lalu
						</p>
					</CardContent>
				</Card>

				{/* Authors */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Penulis Aktif</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalAuthors}</div>
						<p className="text-xs text-muted-foreground">
							{stats.totalCategories} kategori artikel
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Chart Section */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between">
						<div>
							<CardTitle>Trend Upload Artikel</CardTitle>
							<CardDescription>
								Grafik publikasi artikel per tanggal dalam {selectedPeriod} hari terakhir
							</CardDescription>
						</div>
						<Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
							<SelectTrigger className="w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="7">7 Hari</SelectItem>
								<SelectItem value="14">14 Hari</SelectItem>
								<SelectItem value="30">30 Hari</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={chartData}>
								<defs>
									<linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
								<XAxis
									dataKey="date"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									fontSize={12}
									tickLine={false}
									axisLine={false}
									domain={[0, maxArticles + 2]}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Area
									type="monotone"
									dataKey="articles"
									stroke="#3B82F6"
									strokeWidth={3}
									fill="url(#colorArticles)"
									dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
									activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			{/* Today's Summary */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Hari Ini</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-blue-600 mb-2">
							{stats.articlesToday}
						</div>
						<p className="text-sm text-gray-600">artikel dipublikasi hari ini</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Rata-rata Harian</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-green-600 mb-2">
							{Math.round(stats.articlesThisWeek / 7)}
						</div>
						<p className="text-sm text-gray-600">artikel per hari minggu ini</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Produktivitas</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-purple-600 mb-2">
							{stats.totalAuthors > 0 ? Math.round((stats.articlesThisMonth / stats.totalAuthors) * 10) / 10 : 0}
						</div>
						<p className="text-sm text-gray-600">artikel per penulis bulan ini</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Dashboard;