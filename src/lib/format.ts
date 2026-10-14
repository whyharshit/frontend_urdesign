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
/** "1 professional", "3 professionals". */
export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;
/** Capitalise the first letter of every word as people type names ("aarav mehta" → "Aarav Mehta"). */
export const capitaliseWords = (value: string) =>
  value.replace(
    /(^|[\s\-'(])(\p{Ll})/gu,
    (_, start: string, letter: string) => start + letter.toUpperCase(),
  );
export const initialsOf = (value: string) =>
  value
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('') || 'UD';
/** Hide a zero: a brand-new practice reads better than "0 years experience". */
export const experienceLabel = (years: number, suffix = 'experience') =>
  years > 0 ? `${plural(years, 'year')}${suffix ? ` ${suffix}` : ''}` : 'New practice';
/** Older records stored a bare number ("1200"); show it with a unit. */
export const areaLabel = (value: string) =>
  /^[\d,.\s]+$/.test(value.trim()) && value.trim() ? `${value.trim()} sq ft` : value;
export const splitMeasure = (value: string, units: readonly string[], fallback: string) => {
  const unit = units.find((u) => value.trim().endsWith(u)) || fallback;
  return { amount: value.replace(unit, '').replace(/[^\d.]/g, ''), unit };
};
export const joinMeasure = (amount: string, unit: string) => {
  const number = Number(amount);
  if (!amount || !Number.isFinite(number) || number <= 0) return '';
  const shown = number.toLocaleString('en-IN');
  return `${shown} ${number === 1 ? unit.replace(/s$/, '') : unit}`;
};
export function servicePrice(service: { priceType: string; price?: number }) {
  const price = service.price ?? 0;
  switch (service.priceType) {
    case 'contact_for_pricing':
      return 'Contact for pricing';
    case 'per_sqft':
      return `${money(price)} per sq ft`;
    case 'percent':
      return `${price}% of project cost`;
    case 'fixed':
      return `Fixed ${money(price)}`;
    default:
      return `Starting from ${money(price)}`;
  }
}
export const phoneLink = (phone: string) => `tel:+91${phone.replace(/\D/g, '').slice(-10)}`;
export const whatsappLink = (phone: string, text = '') =>
  `https://wa.me/91${phone.replace(/\D/g, '').slice(-10)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
export const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};
