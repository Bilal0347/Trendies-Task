import { NextResponse } from 'next/server';
import { supabase, signIn, getSession } from '@/lib/auth';

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
    // Sign in (for development/testing)
    await signIn();

    // Get the session
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

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
          item_description_accuracy,
          communication_support,
          delivery_speed,
          overall_experience,
          comment
        )
      `)
      .eq('user_id', user.id) // Filter by authenticated user's ID
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform the data
    const transformedOrders: TransformedOrder[] = orders.map((order) => ({
      id: order.id,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      status: order.status,
      product: order.products,
      rating: order.ratings?.[0] || null,
    }));

    // Categorize
    const pendingOrders = transformedOrders.filter((o) => o.status === 'pending');
    const deliveredOrders = transformedOrders.filter((o) => o.status === 'delivered' && !o.rating);
    const ratedOrders = transformedOrders.filter((o) => o.status === 'delivered' && o.rating);

    return NextResponse.json({ pendingOrders, deliveredOrders, ratedOrders });

  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
