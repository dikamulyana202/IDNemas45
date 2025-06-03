import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const API_KEY = process.env.NEWS_API_KEY!;
const KEYWORDS = ['korupsi', 'kasus', 'keadilan', 'oknum', 'penegakan hukum', 'peradilan', 'hukum'];

function buildNewsApiUrl(keyword: string): string {
   const today = new Date();
   const sevenDaysAgo = new Date();
   sevenDaysAgo.setDate(today.getDate() - 7);

   const fromDate = sevenDaysAgo.toISOString().split('T')[0];
   const toDate = today.toISOString().split('T')[0];

   return `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=id&sortBy=publishedAt&from=${fromDate}&to=${toDate}&apiKey=${API_KEY}`;
}

export async function fetchArticles() {
   const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });

   if (!adminUser) {
      console.error('❌ Admin user not found.');
      return;
   }

   for (const keyword of KEYWORDS) {
      const category = await prisma.category.upsert({
         where: { name: keyword },
         update: {},
         create: { name: keyword },
      });

      const url = buildNewsApiUrl(keyword);

      try {
         const { data } = await axios.get(url);
         for (const article of data.articles) {
            await prisma.article.upsert({
               where: { sourceUrl: article.url },
               update: {},
               create: {
                  title: article.title,
                  description: article.description || '',
                  content: article.content || '',
                  author: article.author || null,
                  imageUrl: article.urlToImage,
                  sourceUrl: article.url,
                  publishedAt: new Date(article.publishedAt),
                  categoryId: category.id,
               },
            });
         }
      } catch (err) {
         console.error(`❌ Error fetching for "${keyword}"`, err);
      }
   }

   await prisma.$disconnect();
}
