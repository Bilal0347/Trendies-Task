import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  averageRating: number;
  totalRatings: number;
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  description, 
  imageUrl, 
  averageRating,
  totalRatings
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const renderDynamicStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const fillPercentage = Math.max(0, Math.min(100, (rating - (i - 1)) * 100));
      stars.push(
        <div key={i} className="relative w-4 h-4">
          <Star className="w-4 h-4 text-gray-300 absolute" />
          <div 
            className="absolute overflow-hidden" 
            style={{ width: `${fillPercentage}%` }}
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }
    return stars;
  };

  return (
    <Card className="w-full overflow-hidden group">
      <Link href={`/products/${id}`}>
        <CardHeader className="p-0 cursor-pointer">
          <div className="relative w-full h-48 bg-gray-100">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              {renderDynamicStars(averageRating)}
            </div>
            <span className="text-sm text-gray-500">
              ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
          <p className="text-lg font-bold mt-2">${price.toFixed(2)}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Link href={`/products/${id}`} className="w-full">
          <Button className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            View Product
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 