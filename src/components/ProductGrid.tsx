'use client';
import { ProductCard } from './ProductCard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

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
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleOrder = async (productId: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to place an order",
          variant: "destructive",
        });
        return;
      }

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          product_id: productId,
          user_id: user.id,
          status: 'pending',
        });

      if (orderError) {
        throw new Error('Failed to create order');
      }

      toast({
        title: "Success",
        description: "Order placed successfully!",
      });

      router.push('/my-orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          onOrder={handleOrder}
        />
      ))}
    </div>
  );
} 