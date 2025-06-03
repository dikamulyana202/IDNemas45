import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   const { id } = await params;
   const { searchParams } = new URL(req.url);
   const limit = parseInt(searchParams.get('limit') || '6'); // Default ke 6

   try {
      const currentArticle = await prisma.article.findUnique({
         where: { id },
         select: {
            categoryId: true,
         }
      });

      if (!currentArticle) {
         return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      const relatedArticles = await prisma.article.findMany({
         where: {
            categoryId: currentArticle.categoryId,
            id: {
               not: id,
            }
         },
         include: {
            category: true,
         },
         orderBy: {
            publishedAt: 'desc',
         },
         take: limit,
      });


      // Jika artikel dalam kategori yang sama kurang dari limit,
      // ambil artikel dari kategori lain untuk melengkapi
      if (relatedArticles.length < limit) {
         const additionalArticles = await prisma.article.findMany({
            where: {
               categoryId: {
                  not: currentArticle.categoryId,
               },
               id: {
                  not: id,
               }
            },
            include: {
               category: true,
            },
            orderBy: {
               publishedAt: 'desc',
            },
            take: limit - relatedArticles.length,
         });

         relatedArticles.push(...additionalArticles);
      }

      return NextResponse.json({
         data: relatedArticles,
         meta: {
            total: relatedArticles.length,
            categoryId: currentArticle.categoryId
         }
      });
   } catch (error) {
      console.error('Error fetching related articles:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
}