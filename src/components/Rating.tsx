"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface RatingProps {
  orderId: string;
  initialRating?: number;
  initialComment?: string;
  onRatingSubmit?: () => void;
}

export function Rating({ orderId, initialRating, initialComment, onRatingSubmit }: RatingProps) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('You must be logged in to submit a rating');
      }

      // Check if the order exists and is delivered
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'delivered') {
        throw new Error('Can only rate delivered orders');
      }

      // Check if a rating already exists
      const { data: existingRating, error: ratingError } = await supabase
        .from('ratings')
        .select('id')
        .eq('order_id', orderId)
        .single();

      if (ratingError && ratingError.code !== 'PGRST116') {
        throw new Error('Failed to check existing rating');
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
          throw new Error('Failed to update rating');
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
          throw new Error('Failed to create rating');
        }
      }

      toast({
        title: "Success",
        description: "Your rating has been submitted successfully",
      });

      if (onRatingSubmit) {
        onRatingSubmit();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      <Textarea
        placeholder="Write your review (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px]"
      />
      
      <Button
        onClick={handleRatingSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : rating ? 'Update Rating' : 'Submit Rating'}
      </Button>
    </div>
  );
} 