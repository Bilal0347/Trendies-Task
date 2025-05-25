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
  initialComment?: string;
  onRatingSubmit?: () => void;
}

export function Rating({ orderId, initialComment, onRatingSubmit }: RatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // New state for expanded questions
  const [itemDescriptionAccuracy, setItemDescriptionAccuracy] = useState('');
  const [sellerCommunicationRating, setSellerCommunicationRating] = useState(0);
  const [sellerCommunicationComment, setSellerCommunicationComment] = useState('');
  const [overallSatisfaction, setOverallSatisfaction] = useState('');

  const handleRatingSubmit = async () => {
    // Validation for new fields
    if (!itemDescriptionAccuracy) {
      toast({
        title: "Error",
        description: "Please answer: Was the item as described?",
        variant: "destructive",
      });
      return;
    }
    if (sellerCommunicationRating === 0) {
      toast({
        title: "Error",
        description: "Please rate the seller&apos;s communication and delivery time.",
        variant: "destructive",
      });
      return;
    }
    if (!overallSatisfaction) {
      toast({
        title: "Error",
        description: "Please answer: How satisfied are you with your purchase overall?",
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

      const ratingPayload = {
        comment,
        item_description_accuracy: itemDescriptionAccuracy,
        seller_communication_rating: sellerCommunicationRating,
        seller_communication_comment: sellerCommunicationComment,
        overall_satisfaction: overallSatisfaction,
        updated_at: new Date().toISOString(),
        order_id: orderId,
        user_id: user.id,
      };

      if (existingRating) {
        // Update existing rating
        const { error: updateError } = await supabase
          .from('ratings')
          .update(ratingPayload)
          .eq('id', existingRating.id);

        if (updateError) {
          throw new Error('Failed to update rating');
        }
      } else {
        // Create new rating
        const { error: insertError } = await supabase
          .from('ratings')
          .insert(ratingPayload);

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
    <div className="space-y-6">
      {/* 1. Was the item as described? */}
      <div>
        <div className="font-medium mb-2">1. Was the item as described?</div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="radio" value="exactly" checked={itemDescriptionAccuracy === 'exactly'} onChange={() => setItemDescriptionAccuracy('exactly')} />
            Exactly as described
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="slightly" checked={itemDescriptionAccuracy === 'slightly'} onChange={() => setItemDescriptionAccuracy('slightly')} />
            Slightly different
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="very" checked={itemDescriptionAccuracy === 'very'} onChange={() => setItemDescriptionAccuracy('very')} />
            Very different
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="not_at_all" checked={itemDescriptionAccuracy === 'not_at_all'} onChange={() => setItemDescriptionAccuracy('not_at_all')} />
            Not at all as described
          </label>
        </div>
      </div>

      {/* 2. Seller's communication and delivery time */}
      <div>
        <div className="font-medium mb-2">2. How would you rate the seller's communication and delivery time?</div>
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSellerCommunicationRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= (hoverRating || sellerCommunicationRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Comments on communication or delivery (optional)"
          value={sellerCommunicationComment}
          onChange={(e) => setSellerCommunicationComment(e.target.value)}
          className="min-h-[60px]"
        />
      </div>

      {/* 3. Overall satisfaction */}
      <div>
        <div className="font-medium mb-2">3. How satisfied are you with your purchase overall?</div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="radio" value="very_satisfied" checked={overallSatisfaction === 'very_satisfied'} onChange={() => setOverallSatisfaction('very_satisfied')} />
            Very satisfied
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="satisfied" checked={overallSatisfaction === 'satisfied'} onChange={() => setOverallSatisfaction('satisfied')} />
            Satisfied
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="neutral" checked={overallSatisfaction === 'neutral'} onChange={() => setOverallSatisfaction('neutral')} />
            Neutral
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="dissatisfied" checked={overallSatisfaction === 'dissatisfied'} onChange={() => setOverallSatisfaction('dissatisfied')} />
            Dissatisfied
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="very_dissatisfied" checked={overallSatisfaction === 'very_dissatisfied'} onChange={() => setOverallSatisfaction('very_dissatisfied')} />
            Very dissatisfied
          </label>
        </div>
      </div>

      {/* 4. Optional written review */}
      <div>
        <div className="font-medium mb-2">Would you like to leave a written review? (Optional but valuable for feedback)</div>
        <Textarea
          placeholder="Write your review (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <Button
        onClick={handleRatingSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </Button>
    </div>
  );
} 