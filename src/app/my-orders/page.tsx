import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReviewModal } from '@/components/ReviewModal';
import { ToasterWrapper } from '@/components/ToasterWrapper';

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

export default async function MyOrdersPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
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
    throw new Error('Failed to fetch orders');
  }

  if (!orders) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  // Transform and categorize orders
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

  const pendingOrders = transformedOrders.filter(order => order.status === 'pending');
  const deliveredOrders = transformedOrders.filter(order => order.status === 'delivered' && !order.rating);
  const ratedOrders = transformedOrders.filter(order => order.status === 'delivered' && order.rating);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {/* Pending Orders */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Pending Orders</h2>
        {pendingOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="aspect-square relative mb-4">
                  <img
                    src={order.product.image_url}
                    alt={order.product.name}
                    className="object-cover rounded-lg  h-[300px] w-full"
                  />
                </div>
                <h3 className="font-semibold mb-2">{order.product.name}</h3>
                <p className="text-gray-600 mb-2">${order.product.price}</p>
                <p className="text-sm text-gray-500">
                  Ordered on {new Date(order.created_at).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No pending orders</p>
        )}
      </section>

      {/* Delivered Orders */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Delivered Orders</h2>
        {deliveredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveredOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="aspect-square relative mb-4">
                  <img
                    src={order.product.image_url}
                    alt={order.product.name}
                    className="object-cover rounded-lg h-[300px] w-full"
                  />
                </div>
                <h3 className="font-semibold mb-2">{order.product.name}</h3>
                <p className="text-gray-600 mb-2">${order.product.price}</p>
                <p className="text-sm text-gray-500">
                  Delivered on {new Date(order.updated_at).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-sm bg-green-100 text-green-800 rounded">
                    Delivered
                  </span>
                </div>
                {!order.rating && (
                  <div className="mt-4">
                    <ReviewModal orderId={order.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No delivered orders</p>
        )}
      </section>

      {/* Rated Orders */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Rated Orders</h2>
        {ratedOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ratedOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="aspect-square relative mb-4">
                  <img
                    src={order.product.image_url}
                    alt={order.product.name}
                    className="object-cover rounded-lg  h-[300px] w-full"
                  />
                </div>
                <h3 className="font-semibold mb-2">{order.product.name}</h3>
                <p className="text-gray-600 mb-2">${order.product.price}</p>
                <p className="text-sm text-gray-500">
                  Delivered on {new Date(order.updated_at).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                    Rated
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= (order.rating?.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {order.rating?.comment && (
                    <p className="text-sm text-gray-600 mb-4">{order.rating.comment}</p>
                  )}
                  <ReviewModal
                    orderId={order.id}
                    initialRating={order.rating?.rating}
                    initialComment={order.rating?.comment}
                    isUpdate
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No rated orders</p>
        )}
      </section>

      <ToasterWrapper />
    </div>
  );
} 