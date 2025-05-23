import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  averageRating: number;
  totalRatings: number;
  onOrder: (productId: string) => void;
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  description, 
  imageUrl, 
  averageRating,
  totalRatings,
  onOrder 
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 bg-gray-100">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
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
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= Math.round(averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">
            ({totalRatings})
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <p className="text-lg font-bold mt-2">${price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onOrder(id)} 
          className="w-full"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Order Now
        </Button>
      </CardFooter>
    </Card>
  );
} 