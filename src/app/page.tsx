import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ProductGrid } from '@/components/ProductGrid';

interface Rating {
  rating: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  created_at: string;
  ratings: Rating[];
}

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      ratings:ratings(
        rating
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error loading products</h1>
        <p>Please try again later.</p>
      </div>
    );
  }

  // Calculate average rating for each product
  const productsWithRatings = (products as Product[])?.map(product => ({
    ...product,
    averageRating: product.ratings?.length 
      ? product.ratings.reduce((acc: number, curr: Rating) => acc + curr.rating, 0) / product.ratings.length 
      : 0,
    totalRatings: product.ratings?.length || 0
  })) || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Luxury Fashion Collection</h1>
      <ProductGrid products={productsWithRatings} />
    </div>
  );
}
