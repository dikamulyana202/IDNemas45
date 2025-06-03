"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import Link from 'next/link';

// Flexible interface yang bisa handle kedua format
interface FlexibleArticle {
  id: string;
  title: string;
  content?: string;
  description?: string | null;
  imageUrl: string | null;
  category: {
    name: string;
  };
  // Flexible date fields
  createdAt?: string;
  publishedAt?: string;
  // Flexible author fields
  author?: string;
  user?: {
    username: string;
  };
}

interface ArticleCardProps {
  article: FlexibleArticle;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContent = () => {
    return article.description || article.content || '';
  };

  const getDate = () => {
    return article.publishedAt || article.createdAt || '';
  };

  const getAuthor = () => {
    return article.author || article.user?.username || 'Unknown';
  };

  return (
    <Card key={article.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {article.imageUrl ? (
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
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <CardHeader className="flex-grow">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {article.category.name}
            </Badge>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(getDate())}
            </div>
          </div>
          <CardTitle className="text-xl font-bold hover:text-blue-700 transition-colors line-clamp-2">
            {article.title}
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-3">
            {getContent()}
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-between items-center mt-4 border-t">
          <span className="text-sm font-medium">{getAuthor()}</span>
          <Link href={`/article/${article.id}`}>
            <Button variant="outline" size="sm">Read More</Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ArticleCard;