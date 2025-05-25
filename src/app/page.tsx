import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ProductGrid } from '@/components/ProductGrid';

interface Rating {
  item_description_accuracy: number;
  communication_support: number;
  delivery_speed: number;
  overall_experience: number;
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
        item_description_accuracy,
        communication_support,
        delivery_speed,
        overall_experience
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
  const productsWithRatings = (products as Product[])?.map(product => {
    const ratings = product.ratings || [];
    const totalRatings = ratings.length;
    
    if (totalRatings === 0) {
      return {
        ...product,
        averageRating: 0,
        totalRatings: 0
      };
    }

    // Calculate average of all four ratings for each review
    const averageRating = ratings.reduce((acc, curr) => {
      const reviewAverage = (
        curr.item_description_accuracy +
        curr.communication_support +
        curr.delivery_speed +
        curr.overall_experience
      ) / 4;
      return acc + reviewAverage;
    }, 0) / totalRatings;

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings
    };
  }) || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Luxury Fashion Collection</h1>
      <ProductGrid products={productsWithRatings} />
    </div>
  );
}
