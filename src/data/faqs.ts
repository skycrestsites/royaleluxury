import { site } from './site';

export interface Faq {
  question: string;
  answer: string;
  featured?: boolean;
}

export const faqs: Faq[] = [
  {
    question: 'How long does shipping take?',
    answer:
      'Orders are processed within 1 to 2 business days. Standard delivery typically arrives in 3 to 7 business days, and you will receive a tracking link by email as soon as your order ships.',
    featured: true,
  },
  {
    question: 'Do you offer free shipping?',
    answer: `Yes. Every order over $${site.freeShippingThreshold} ships free. A flat shipping rate applies to smaller orders and is shown at checkout before you pay.`,
    featured: true,
  },
  {
    question: 'What is your return policy?',
    answer: `If something is not right, you can return unused items in their original condition within ${site.returnWindowDays} days of delivery for a full refund. Bedding can be returned even if it has been opened.`,
    featured: true,
  },
  {
    question: 'How do I choose the right bedding size?',
    answer:
      'Each product page lists exact dimensions. As a guide, our Full / Queen duvet fits inserts up to 90 x 90 inches and our King fits inserts up to 106 x 90 inches. If you are between sizes, contact us and we will help you choose.',
  },
  {
    question: 'How should I care for my products?',
    answer:
      'Care instructions are listed on every product page and printed on each label. Most bedding and bath textiles can be machine washed cold and tumble dried low.',
  },
  {
    question: 'Can I change or cancel my order?',
    answer:
      'We can update or cancel orders that have not yet shipped. Email us as soon as possible with your order number and we will take care of it.',
  },
  {
    question: 'Do you offer gift wrapping?',
    answer: 'Yes. Gift wrapping and a handwritten note can be added at checkout for a small fee.',
  },
];
