import { CustomerReview } from '@/types/review';

export const MOCK_CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'demo-review-001',
    name: 'Sarah L.',
    location: 'Colorado',
    rating: 4,
    comment: 'The 2-person backpacking tent held up remarkably well during a stormy weekend in the Rockies. Lightweight, completely dry, and quick to pitch.',
  },
  {
    id: 'demo-review-002',
    name: 'Emily R.',
    location: 'Oregon',
    rating: 5,
    comment: 'Exceptional craftsmanship on the technical alpine backpack. The suspension system distributes weight perfectly on 15+ mile trail days.',
  },
  {
    id: 'demo-review-003',
    name: 'James T.',
    location: 'Washington',
    rating: 5,
    comment: 'The camp lantern provides incredible battery life and a warm, glare-free light. It has quickly become an essential part of our camp kit.',
  },
];
