export const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
export const uid = () => crypto.randomUUID();
export function servicePrice(service: { priceType: string; price?: number }) {
  return service.priceType === 'contact_for_pricing'
    ? 'Contact for pricing'
    : `${service.priceType === 'fixed' ? 'Fixed' : 'Starting from'} ${money(service.price ?? 0)}`;
}
