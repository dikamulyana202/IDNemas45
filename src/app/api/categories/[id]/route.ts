import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;

      if (!id) {
         return NextResponse.json(
            {
               success: false,
               error: 'ID kategori tidak valid',
            },
            { status: 400 }
         );
      }

      const category = await prisma.category.findUnique({
         where: { id },
         include: {
            _count: {
               select: {
                  articles: true,
               },
            },
         },
      });

      if (!category) {
         return NextResponse.json(
            {
               success: false,
               error: 'Kategori tidak ditemukan',
            },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         data: category,
      });
   } catch (error) {
      console.error('Error fetching category:', error);
      return NextResponse.json(
         {
            success: false,
            error: 'Gagal mengambil data kategori',
         },
         { status: 500 }
      );
   }
}

export async function PUT(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const body = await request.json();
      const { name } = body;

      if (!id) {
         return NextResponse.json(
            {
               success: false,
               error: 'ID kategori tidak valid',
            },
            { status: 400 }
         );
      }

      if (!name || !name.trim()) {
         return NextResponse.json(
            {
               success: false,
               error: 'Nama kategori tidak boleh kosong',
            },
            { status: 400 }
         );
      }

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
         where: { id },
      });

      if (!existingCategory) {
         return NextResponse.json(
            {
               success: false,
               error: 'Kategori tidak ditemukan',
            },
            { status: 404 }
         );
      }

      // Check if another category with the same name exists
      const duplicateCategory = await prisma.category.findFirst({
         where: {
            name: {
               equals: name.trim(),
               mode: 'insensitive',
            },
            id: {
               not: id,
            },
         },
      });

      if (duplicateCategory) {
         return NextResponse.json(
            {
               success: false,
               error: 'Kategori dengan nama tersebut sudah ada',
            },
            { status: 400 }
         );
      }

      // Update category
      const updatedCategory = await prisma.category.update({
         where: { id },
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
         data: updatedCategory,
         message: 'Kategori berhasil diperbarui',
      });
   } catch (error) {
      console.error('Error updating category:', error);
      return NextResponse.json(
         {
            success: false,
            error: 'Gagal memperbarui kategori',
         },
         { status: 500 }
      );
   }
}

export async function DELETE(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;

      if (!id) {
         return NextResponse.json(
            {
               success: false,
               error: 'ID kategori tidak valid',
            },
            { status: 400 }
         );
      }

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
         where: { id },
         include: {
            _count: {
               select: {
                  articles: true,
               },
            },
         },
      });

      if (!existingCategory) {
         return NextResponse.json(
            {
               success: false,
               error: 'Kategori tidak ditemukan',
            },
            { status: 404 }
         );
      }

      // Check if category has articles
      if (existingCategory._count.articles > 0) {
         return NextResponse.json(
            {
               success: false,
               error: `Tidak dapat menghapus kategori yang masih memiliki ${existingCategory._count.articles} artikel`,
            },
            { status: 400 }
         );
      }

      // Delete category
      await prisma.category.delete({
         where: { id },
      });

      return NextResponse.json({
         success: true,
         message: 'Kategori berhasil dihapus',
      });
   } catch (error) {
      console.error('Error deleting category:', error);
      return NextResponse.json(
         {
            success: false,
            error: 'Gagal menghapus kategori',
         },
         { status: 500 }
      );
   }
}