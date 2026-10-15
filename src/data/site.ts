export const site = {
  name: 'Royale Luxury',
  tagline: 'Beautiful Living, Sensibly Priced.',
  description:
    'Royale Luxury designs bedding, kitchenware, bath essentials and decor that bring a refined, hotel-inspired feel to every room, at prices that make sense.',
  url: 'https://royaleluxury.com',
  email: 'hello@royaleluxury.com',
  hours: [
    { days: 'Monday to Friday', time: '9AM to 6PM' },
    { days: 'Saturday', time: '10AM to 4PM' },
  ],
  currency: 'USD',
  locale: 'en_US',
  freeShippingThreshold: 75,
  returnWindowDays: 30,
  social: {
    instagram: 'https://www.instagram.com/royaleluxury',
    tiktok: 'https://www.tiktok.com/@royaleluxury',
    pinterest: 'https://www.pinterest.com/royaleluxury',
  },
} as const;

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: site.currency }).format(amount);
