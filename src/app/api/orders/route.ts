import { NextResponse } from 'next/server';
import { supabase, signIn } from '@/lib/auth';

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

interface TransformedOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  product: Product[];
  rating: Rating | null;
}

export async function GET() {
  try {
    // Ensure we're signed in
    await signIn();

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        updated_at,
        status,
        products (
          id,
          name,
          price,
          image_url
        ),
        ratings (
          id,
          rating,
          comment
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedOrders = orders.map((order): TransformedOrder => ({
      id: order.id,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      status: order.status,
     product: order.products,
      rating: order.ratings?.[0] || null
    }));

    // Categorize orders
    const pendingOrders = transformedOrders.filter((order) => order.status === 'pending');
    const deliveredOrders = transformedOrders.filter((order) => order.status === 'delivered' && !order.rating);
    const ratedOrders = transformedOrders.filter((order) => order.status === 'delivered' && order.rating);

    return NextResponse.json({
      pendingOrders,
      deliveredOrders,
      ratedOrders
    });
  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
