"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewModal } from '@/components/ReviewModal';
import { useToast } from '@/components/ui/use-toast';
import { signIn } from '@/lib/auth';
import { Star, StarHalf } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface Rating {
  id: string;
  item_description_accuracy: number;
  communication_support: number;
  delivery_speed: number;
  overall_experience: number;
  comment: string | undefined;
}

interface BaseOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  product: Product;
  rating: Rating | null;
}

interface PendingOrder extends BaseOrder {
  status: 'pending';
}

interface DeliveredOrder extends BaseOrder {
  status: 'delivered';
}

interface RatedOrder extends BaseOrder {
  status: 'delivered';
  rating: Rating;
}

interface OrdersResponse {
  pendingOrders: PendingOrder[];
  deliveredOrders: DeliveredOrder[];
  ratedOrders: RatedOrder[];
}

const calculateAverageRating = (rating: Rating): number => {
  if (!rating) return 0;
  const average = (
    rating.item_description_accuracy +
    rating.communication_support +
    rating.delivery_speed +
    rating.overall_experience
  ) / 4;
  return Math.round(average * 10) / 10; // Round to 1 decimal place
};

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Add full stars
  for (let i = 1; i <= fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        className="w-4 h-4 fill-yellow-400 text-yellow-400"
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <StarHalf
        key="half"
        className="w-4 h-4 fill-yellow-400 text-yellow-400"
      />
    );
  }

  // Add empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 1; i <= emptyStars; i++) {
    stars.push(
      <Star
        key={`empty-${i}`}
        className="w-4 h-4 text-gray-300"
      />
    );
  }

  return stars;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrdersResponse>({
    pendingOrders: [],
    deliveredOrders: [],
    ratedOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      // Ensure we're signed in
      await signIn();
      
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading orders...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      {/* Pending Orders */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Pending Orders</h2>
        {orders.pendingOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.pendingOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="aspect-square relative mb-4">
                    <img
                      src={order.product.image_url}
                      alt={order.product.name}
                      className="object-cover rounded-lg h-[300px] w-full"
                    />
                  </div>
                  <CardTitle>{order.product.name}</CardTitle>
                  <CardDescription>
                    Ordered on {new Date(order.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">${order.product.price}</p>
                </CardContent>
                <CardFooter>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Pending
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No pending orders</p>
        )}
      </section>

      {/* Delivered Orders */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Delivered Orders</h2>
        {orders.deliveredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.deliveredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="aspect-square relative mb-4">
                    <img
                      src={order.product.image_url}
                      alt={order.product.name}
                      className="object-cover rounded-lg h-[300px] w-full"
                    />
                  </div>
                  <CardTitle>{order.product.name}</CardTitle>
                  <CardDescription>
                    Delivered on {new Date(order.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">${order.product.price}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Delivered
                  </Badge>
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => setOpenModalId(order.id)}
                  >
                    Add Review
                  </Button>
                  <ReviewModal 
                    isOpen={openModalId === order.id}
                    onClose={() => setOpenModalId(null)}
                    orderId={order.id}
                    productId={order.product.id}
                    onReviewSubmitted={fetchOrders}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No delivered orders</p>
        )}
      </section>

      {/* Rated Orders */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Rated Orders</h2>
        {orders.ratedOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.ratedOrders.map((order) => {
              const averageRating = calculateAverageRating(order.rating);
              
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="aspect-square relative mb-4">
                      <img
                        src={order.product.image_url}
                        alt={order.product.name}
                        className="object-cover rounded-lg h-[300px] w-full"
                      />
                    </div>
                    <CardTitle>{order.product.name}</CardTitle>
                    <CardDescription>
                      Delivered on {new Date(order.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">${order.product.price}</p>
                    <div className="mt-2">
                      <div className="flex items-center gap-1">
                        {renderStars(averageRating)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Delivered
                    </Badge>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => setOpenModalId(order.id)}
                    >
                      Update Review
                    </Button>
                    <ReviewModal 
                      isOpen={openModalId === order.id}
                      onClose={() => setOpenModalId(null)}
                      orderId={order.id}
                      productId={order.product.id}
                      initialRating={{
                        itemDescriptionAccuracy: order.rating.item_description_accuracy,
                        communicationSupport: order.rating.communication_support,
                        deliverySpeed: order.rating.delivery_speed,
                        overallExperience: order.rating.overall_experience,
                        comment: order.rating.comment
                      }}
                      onReviewSubmitted={fetchOrders}
                    />
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No rated orders</p>
        )}
      </section>
    </div>
  );
} 