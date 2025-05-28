'use client';
import { ProductCard } from './ProductCard';


interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  averageRating: number;
  totalRatings: number;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {

 

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          description={product.description}
          imageUrl={product.image_url}
          averageRating={product.averageRating}
          totalRatings={product.totalRatings}
        />
      ))}
    </div>
  );
} 