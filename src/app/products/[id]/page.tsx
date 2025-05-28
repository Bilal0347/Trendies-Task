import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { Database } from '@/types/supabase';

interface Rating {
  item_description_accuracy: number;
  communication_support: number;
  delivery_speed: number;
  overall_experience: number;
  comment: string;
  user_id: string;
  created_at: string;
}

// Next.js expects this type for route segment config
export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServerComponentClient<Database>({ cookies });

  // Get the product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (productError || !product) {
    notFound();
  }

  // Get all ratings for this seller
  const { data: ratings, error: ratingsError } = await supabase
    .from('ratings')
    .select(
      'item_description_accuracy, communication_support, delivery_speed, overall_experience, comment, user_id, created_at'
    )
    .eq('seller_id', product.seller_id);

  if (ratingsError) {
    console.error('Error fetching ratings:', ratingsError);
  }

  const totalRatings = ratings?.length || 0;

  const averageRatings =
    totalRatings > 0
      ? ratings!.reduce(
          (acc, curr) => ({
            item_description_accuracy:
              acc.item_description_accuracy + curr.item_description_accuracy,
            communication_support:
              acc.communication_support + curr.communication_support,
            delivery_speed: acc.delivery_speed + curr.delivery_speed,
            overall_experience:
              acc.overall_experience + curr.overall_experience,
          }),
          {
            item_description_accuracy: 0,
            communication_support: 0,
            delivery_speed: 0,
            overall_experience: 0,
          }
        )
      : {
          item_description_accuracy: 0,
          communication_support: 0,
          delivery_speed: 0,
          overall_experience: 0,
        };

  const finalAverageRatings =
    totalRatings > 0
      ? {
          item_description_accuracy:
            averageRatings.item_description_accuracy / totalRatings,
          communication_support:
            averageRatings.communication_support / totalRatings,
          delivery_speed: averageRatings.delivery_speed / totalRatings,
          overall_experience:
            averageRatings.overall_experience / totalRatings,
        }
      : averageRatings;

  const overallAverageRating =
    totalRatings > 0
      ? (finalAverageRatings.item_description_accuracy +
          finalAverageRatings.communication_support +
          finalAverageRatings.delivery_speed +
          finalAverageRatings.overall_experience) /
        4
      : 0;

  const renderDynamicStars = (
    rating: number,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const stars = [];
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };
    const sizeClass = sizeClasses[size];

    for (let i = 1; i <= 5; i++) {
      const fillPercentage = Math.max(
        0,
        Math.min(100, (rating - (i - 1)) * 100)
      );
      stars.push(
        <div key={i} className={`relative ${sizeClass}`}>
          <Star className={`${sizeClass} text-gray-300 absolute`} />
          <div
            className="absolute overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {renderDynamicStars(overallAverageRating, 'md')}
              </div>
              <span className="text-gray-500">
                ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          <p className="text-2xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </p>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seller Information</h2>
            <p className="text-gray-600">Seller ID: {product.seller_id}</p>
          </div>

          <Button className="w-full" size="lg">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Detailed Seller Ratings */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Seller Ratings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Item Description Accuracy',
              value: finalAverageRatings.item_description_accuracy,
            },
            {
              label: 'Communication Support',
              value: finalAverageRatings.communication_support,
            },
            {
              label: 'Delivery Speed',
              value: finalAverageRatings.delivery_speed,
            },
            {
              label: 'Overall Experience',
              value: finalAverageRatings.overall_experience,
            },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{label}</h3>
              <div className="flex items-center gap-2">
                {renderDynamicStars(value, 'md')}
                <span className="text-gray-600">
                  ({value.toFixed(1)}/5)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seller Feedback */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Seller Feedback</h2>
        {totalRatings > 0 ? (
          <div className="space-y-6">
            {ratings!.map((rating: Rating, index: number) => {
              const reviewAverage =
                (rating.item_description_accuracy +
                  rating.communication_support +
                  rating.delivery_speed +
                  rating.overall_experience) /
                4;

              return (
                <div
                  key={index}
                  className="border rounded-lg p-6 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {renderDynamicStars(reviewAverage, 'md')}
                  </div>
                  {rating.comment && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        Customer Feedback
                      </h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">
                        {rating.comment}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <p>
                      Item Description Accuracy:{' '}
                      {rating.item_description_accuracy}/5
                    </p>
                    <p>
                      Communication Support: {rating.communication_support}/5
                    </p>
                    <p>Delivery Speed: {rating.delivery_speed}/5</p>
                    <p>
                      Overall Experience: {rating.overall_experience}/5
                    </p>
                  </div>
                  <div className="mt-4 text-sm text-gray-500 border-t pt-4">
                    <p>User ID: {rating.user_id}</p>
                    <p>Date: {formatDate(rating.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet</p>
        )}
      </div>
    </div>
  );
}
