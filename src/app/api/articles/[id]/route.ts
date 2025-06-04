import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Article, Category } from '@prisma/client';

const prisma = new PrismaClient();

type ArticleWithCategory = Article & {
   category: Category;
};

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   const { id } = await params;
   const { searchParams } = new URL(req.url);
   const includeRelated = searchParams.get('related') === 'true';

   try {
      const article = await prisma.article.findUnique({
         where: { id },
         include: {
            category: true,
         }
      });

      if (!article) {
         return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      // If related articles are requested, fetch them in the same request
      let relatedArticles: ArticleWithCategory[] = [];
      if (includeRelated) {
         relatedArticles = await prisma.article.findMany({
            where: {
               categoryId: article.categoryId,
               id: {
                  not: article.id // Exclude current article
               }
            },
            include: {
               category: true
            },
            orderBy: {
               publishedAt: 'desc'
            },
            take: 6 // Limit to 6 related articles
         });
      }

      const response = {
         ...article,
         ...(includeRelated && { relatedArticles })
      };

      return NextResponse.json(response);

   } catch (error) {
      console.error('Error fetching article:', error);
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      );
   } finally {
      await prisma.$disconnect();
   }
}


// PUT /api/articles/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   const body = await req.json()

   try {
      const updated = await prisma.article.update({
         where: { id },
         data: {
            title: body.title,
            description: body.description,
            content: body.content,
            imageUrl: body.imageUrl,
            categoryId: body.categoryId,
         },
      })

      return NextResponse.json(updated)
   } catch (err) {
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
   }
}

// DELETE /api/articles/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;

   try {
      await prisma.article.delete({
         where: { id },
      })

      return NextResponse.json({ success: true })
   } catch (err) {
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
   }
}
