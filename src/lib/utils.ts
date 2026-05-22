import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(price: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ'
  };
  const symbol = symbols[currency] || '$';
  return `${symbol}${price.toFixed(2)}`;
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
}

