import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   const { id } = await params;

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

      return NextResponse.json(article);
   } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
