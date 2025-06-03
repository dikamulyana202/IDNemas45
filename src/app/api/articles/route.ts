import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url)

      // Extract query parameters
      const page = parseInt(searchParams.get('page') || '1', 10)
      const limit = parseInt(searchParams.get('limit') || '10', 10)
      const categoryId = searchParams.get('categoryId') || ''
      const search = searchParams.get('search') || ''
      const sortBy = searchParams.get('sortBy') || 'publishedAt'
      const sortOrder = searchParams.get('sortOrder') || 'desc'

      // Validate parameters
      if (page < 1 || limit < 1 || limit > 100) {
         return NextResponse.json(
            { error: 'Invalid pagination parameters' },
            { status: 400 }
         )
      }

      const whereClause: any = {}
      if (categoryId && categoryId !== 'all') {
         whereClause.categoryId = categoryId
      }

      // Search filter
      if (search) {
         whereClause.OR = [
            {
               title: {
                  contains: search,
                  mode: 'insensitive'
               }
            },
            {
               description: {
                  contains: search,
                  mode: 'insensitive'
               }
            },
            {
               author: {
                  contains: search,
                  mode: 'insensitive'
               }
            }
         ]
      }

      const offset = (page - 1) * limit
      const orderBy: any = {}
      if (sortBy === 'title' || sortBy === 'author' || sortBy === 'publishedAt') {
         orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc'
      } else {
         orderBy.publishedAt = 'desc'
      }

      const [articles, totalCount] = await Promise.all([
         prisma.article.findMany({
            where: whereClause,
            include: {
               category: {
                  select: {
                     name: true
                  }
               }
            },
            orderBy,
            skip: offset,
            take: limit
         }),
         prisma.article.count({
            where: whereClause
         })
      ])

      const totalPages = Math.ceil(totalCount / limit)
      const response = {
         data: articles,
         totalPages,
         totalItems: totalCount,
         currentPage: page,
         hasNextPage: page < totalPages,
         hasPrevPage: page > 1,
         filters: {
            categoryId: categoryId || null,
            search: search || null,
            sortBy,
            sortOrder
         }
      }

      return NextResponse.json(response)

   } catch (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}

// POST: Buat artikel baru
export async function POST(req: NextRequest) {
   try {
      const body = await req.json()

      const {
         title,
         description,
         content,
         imageUrl,
         sourceUrl,
         author,
         publishedAt,
         categoryId,
      } = body

      // Validation
      if (!title || !content || !sourceUrl || !author || !categoryId) {
         return NextResponse.json({
            success: false,
            error: 'Missing required fields',
            required: ['title', 'content', 'sourceUrl', 'author', 'categoryId']
         }, { status: 400 })
      }

      // Verify category exists
      const categoryExists = await prisma.category.findUnique({
         where: { id: categoryId }
      })

      if (!categoryExists) {
         return NextResponse.json({
            success: false,
            error: 'Category not found'
         }, { status: 400 })
      }

      // Check if sourceUrl is unique
      const existingArticle = await prisma.article.findUnique({
         where: { sourceUrl }
      })

      if (existingArticle) {
         return NextResponse.json({
            success: false,
            error: 'Article with this source URL already exists'
         }, { status: 400 })
      }

      // Create article
      const article = await prisma.article.create({
         data: {
            title: title.trim(),
            description: description?.trim() || null,
            content: content.trim(),
            imageUrl: imageUrl?.trim() || null,
            sourceUrl: sourceUrl.trim(),
            author: author.trim(),
            publishedAt: new Date(publishedAt),
            categoryId,
         },
         include: {
            category: { select: { name: true } },
         }
      })


      return NextResponse.json({
         success: true,
         data: article,
         message: 'Article created successfully'
      }, { status: 201 })

   } catch (error) {
      console.error('❌ Error creating article:', error)

      // Handle Prisma specific errors
      if (error instanceof Error) {
         if (error.message.includes('Unique constraint')) {
            return NextResponse.json({
               success: false,
               error: 'Article with this source URL already exists'
            }, { status: 400 })
         }

         return NextResponse.json({
            success: false,
            error: 'Failed to create article',
            details: error.message
         }, { status: 500 })
      }

      return NextResponse.json({
         success: false,
         error: 'Internal server error'
      }, { status: 500 })
   } finally {
      await prisma.$disconnect()
   }
}