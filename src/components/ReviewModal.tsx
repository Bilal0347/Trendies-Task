"use client";

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productId: string;
  initialRating?: {
    itemDescriptionAccuracy: number;
    communicationSupport: number;
    deliverySpeed: number;
    overallExperience: number;
    comment?: string;
  };
  onReviewSubmitted?: () => void;
}

export function ReviewModal({ isOpen, onClose, orderId, productId, initialRating, onReviewSubmitted }: ReviewModalProps) {
  const [itemDescriptionAccuracy, setItemDescriptionAccuracy] = useState(initialRating?.itemDescriptionAccuracy || 0);
  const [communicationSupport, setCommunicationSupport] = useState(initialRating?.communicationSupport || 0);
  const [deliverySpeed, setDeliverySpeed] = useState(initialRating?.deliverySpeed || 0);
  const [overallExperience, setOverallExperience] = useState(initialRating?.overallExperience || 0);
  const [comment, setComment] = useState(initialRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Reset form when modal opens with new initialRating
  useEffect(() => {
    if (isOpen && initialRating) {
      setItemDescriptionAccuracy(initialRating.itemDescriptionAccuracy);
      setCommunicationSupport(initialRating.communicationSupport);
      setDeliverySpeed(initialRating.deliverySpeed);
      setOverallExperience(initialRating.overallExperience);
      setComment(initialRating.comment || '');
    }
  }, [isOpen, initialRating]);

  const handleSubmit = async () => {
    if (!itemDescriptionAccuracy || !communicationSupport || !deliverySpeed || !overallExperience) {
      toast({
        title: "Error",
        description: "Please provide all ratings before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          productId,
          itemDescriptionAccuracy,
          communicationSupport,
          deliverySpeed,
          overallExperience,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      toast({
        title: "Success",
        description: initialRating ? "Your review has been updated" : "Thank you for your review!",
      });
      onClose();
      router.refresh();
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialRating ? 'Update Review' : 'Write a Review'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* 1. Accuracy of item description */}
          <div>
            <div className="font-medium mb-2">1. Accuracy of item description</div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setItemDescriptionAccuracy(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= itemDescriptionAccuracy
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 2. Communication & support */}
          <div>
            <div className="font-medium mb-2">2. Communication & support</div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCommunicationSupport(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= communicationSupport
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 3. Delivery speed */}
          <div>
            <div className="font-medium mb-2">3. Delivery speed</div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setDeliverySpeed(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= deliverySpeed
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 4. Overall experience */}
          <div>
            <div className="font-medium mb-2">4. Overall experience</div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallExperience(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= overallExperience
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 5. Optional written review */}
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : initialRating ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 