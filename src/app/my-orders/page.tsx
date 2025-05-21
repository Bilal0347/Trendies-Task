"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewModal } from '@/components/ReviewModal';
import { useToast } from '@/components/ui/use-toast';
import { signIn } from '@/lib/auth';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface Rating {
  id: string;
  rating: number;
  comment: string;
}

interface BaseOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  product: Product;
}

interface PendingOrder extends BaseOrder {
  status: 'pending';
  rating: null;
}

interface DeliveredOrder extends BaseOrder {
  status: 'delivered';
  rating: null;
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

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrdersResponse>({
    pendingOrders: [],
    deliveredOrders: [],
    ratedOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);
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
                  <ReviewModal 
                    orderId={order.id} 
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
              if (!order.rating) return null;
              
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
                    <p className="text-2xl font-bold text-primary mb-4">${order.product.price}</p>
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= order.rating.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {order.rating.comment && (
                      <p className="text-sm text-muted-foreground">{order.rating.comment}</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      Rated
                    </Badge>
                    <ReviewModal
                      orderId={order.id}
                      initialRating={order.rating.rating}
                      initialComment={order.rating.comment}
                      isUpdate
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