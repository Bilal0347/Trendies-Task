import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface Rating {
  rating: number;
  comment: string;
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'delivered';
  product: Product;
  rating?: Rating;
}

interface RawOrder {
  id: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'delivered';
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
  ratings: {
    rating: number;
    comment: string;
  }[] | null;
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        updated_at,
        status,
        products:product_id (
          id,
          name,
          price,
          image_url
        ),
        ratings (
          rating,
          comment
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Transform the data to match our expected format
    const transformedOrders = orders.map((order: unknown): Order => {
      const rawOrder = order as RawOrder;
      return {
        id: rawOrder.id,
        created_at: rawOrder.created_at,
        updated_at: rawOrder.updated_at,
        status: rawOrder.status,
        product: {
          id: rawOrder.products.id,
          name: rawOrder.products.name,
          price: rawOrder.products.price,
          image_url: rawOrder.products.image_url,
        },
        rating: rawOrder.ratings?.[0] ? {
          rating: rawOrder.ratings[0].rating,
          comment: rawOrder.ratings[0].comment,
        } : undefined,
      };
    });


    // Categorize orders
    const pendingOrders = transformedOrders.filter((order) => order.status === 'pending');
    const deliveredOrders = transformedOrders.filter((order) => order.status === 'delivered' && !order.rating);
    
    const ratedOrders = transformedOrders.filter((order) => order.status === 'delivered' && order.rating);

    return NextResponse.json({
      pendingOrders,
      deliveredOrders,
      ratedOrders,
    });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, rating, comment } = await request.json();

    if (!orderId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the order exists and belongs to the user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Can only rate delivered orders' },
        { status: 400 }
      );
    }

    // Check if a rating already exists
    const { data: existingRating, error: ratingError } = await supabase
      .from('ratings')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (ratingError && ratingError.code !== 'PGRST116') {
      console.error('Error checking existing rating:', ratingError);
      return NextResponse.json(
        { error: 'Failed to check existing rating' },
        { status: 500 }
      );
    }

    if (existingRating) {
      // Update existing rating
      const { error: updateError } = await supabase
        .from('ratings')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRating.id);

      if (updateError) {
        console.error('Error updating rating:', updateError);
        return NextResponse.json(
          { error: 'Failed to update rating' },
          { status: 500 }
        );
      }
    } else {
      // Create new rating
      const { error: insertError } = await supabase
        .from('ratings')
        .insert({
          order_id: orderId,
          user_id: user.id,
          rating,
          comment,
        });

      if (insertError) {
        console.error('Error creating rating:', insertError);
        return NextResponse.json(
          { error: 'Failed to create rating' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 