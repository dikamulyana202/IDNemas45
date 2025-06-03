import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

// GET /api/categories - Get all categories with pagination and search
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';

      const skip = (page - 1) * limit;

      // Build where clause for search
      const whereClause = search
         ? {
            name: {
               contains: search,
               mode: 'insensitive' as const,
            },
         }
         : {};

      // Get total count for pagination
      const totalItems = await prisma.category.count({
         where: whereClause,
      });

      // Get categories with article count
      const categories = await prisma.category.findMany({
         where: whereClause,
         skip,
         take: limit,
         include: {
            _count: {
               select: {
                  articles: true,
               },
            },
         },
         orderBy: {
            name: 'asc',
         },
      });

      const totalPages = Math.ceil(totalItems / limit);

      return NextResponse.json({
         success: true,
         data: categories,
         totalPages,
         totalItems,
         currentPage: page,
      });
   } catch (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
         {
            success: false,
            error: 'Gagal mengambil data kategori',
         },
         { status: 500 }
      );
   }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { name } = body;

      if (!name || !name.trim()) {
         return NextResponse.json(
            {
               success: false,
               error: 'Nama kategori tidak boleh kosong',
            },
            { status: 400 }
         );
      }

      // Check if category already exists
      const existingCategory = await prisma.category.findFirst({
         where: {
            name: {
               equals: name.trim(),
               mode: 'insensitive',
            },
         },
      });

      if (existingCategory) {
         return NextResponse.json(
            {
               success: false,
               error: 'Kategori dengan nama tersebut sudah ada',
            },
            { status: 400 }
         );
      }

      // Create new category
      const category = await prisma.category.create({
         data: {
            name: name.trim(),
         },
         include: {
            _count: {
               select: {
                  articles: true,
               },
            },
         },
      });

      return NextResponse.json({
         success: true,
         data: category,
         message: 'Kategori berhasil dibuat',
      });
   } catch (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
         {
            success: false,
            error: 'Gagal membuat kategori',
         },
         { status: 500 }
      );
   }
}