import { NextResponse } from 'next/server';
import { supabase, signIn } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Ensure we're signed in
    await signIn();

    const { orderId, rating, comment } = await request.json();

    if (!orderId || !rating) {
      return NextResponse.json(
        { error: 'Order ID and rating are required' },
        { status: 400 }
      );
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }

    // Check if the order exists and is delivered
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, product_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
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

    let result;
    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating rating:', error);
        return NextResponse.json(
          { error: 'Failed to update rating' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          user_id: user.id,
          product_id: order.product_id,
          order_id: orderId,
          rating,
          comment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating rating:', error);
        return NextResponse.json(
          { error: 'Failed to create rating' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in ratings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 