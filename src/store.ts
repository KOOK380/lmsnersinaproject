import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface CartItem {
  id: string; // unique local id
  itemType: "COURSE" | "MEMBERSHIP" | "EVENT" | "BUNDLE";
  itemId: string;
  editionId?: string;
  title: string;
  price: number;
  isSubscription?: boolean;
  subscriptionInterval?: string;
  originalPrice?: number;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount?: number;
  description?: string;
  appliesTo?: string;
  courseIds?: string[];
  maxDiscount?: number | null;
  minOrderValue?: number;
}

interface AppState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null) => void;
  
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  clearAppliedCoupon: () => void;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
  
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  language: string;
  setLanguage: (lang: string) => void;
  languages: any[];
  setLanguages: (langs: any[]) => void;

  currency: string;
  setCurrency: (currency: string) => void;

  categories: any[];
  setCategories: (cats: any[]) => void;

  settings: any[];
  setSettings: (settings: any[]) => void;

  favorites: any[];
  setFavorites: (favs: any[]) => void;
  toggleFavorite: (itemType: string, itemId: string, token: string) => Promise<void>;
  
  enrolledItems: { courses: any[], memberships: any[], bookings: any[] } | null;
  setEnrolledItems: (items: any) => void;
}

export function getTranslated(item: any, language: string): any {
  if (!item) return item;
  if (Array.isArray(item)) return item.map(i => getTranslated(i, language));
  if (typeof item !== 'object') return item;
  
  const newItem = { ...item };
  if (item.translations && Array.isArray(item.translations)) {
    const defaultLang = localStorage.getItem("user_lang_pref") || "en";
    const t = item.translations.find((x: any) => x.languageCode === language) || 
              item.translations.find((x: any) => x.languageCode === defaultLang) ||
              item.translations.find((x: any) => x.languageCode === 'en') ||
              item.translations[0];
    if (t) {
      if (t.title) newItem.title = t.title;
      if (t.description) newItem.description = t.description;
      if (t.name) newItem.name = t.name;
      if (t.content) newItem.content = t.content;
    }
  }

  if (item.category) newItem.category = getTranslated(item.category, language);
  if (item.lessons) newItem.lessons = getTranslated(item.lessons, language);
  if (item.editions) newItem.editions = getTranslated(item.editions, language);

  return newItem;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  setUser: (user, token) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    set({ user, token });
  },

  cart: [],
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
  clearCart: () => set({ cart: [], appliedCoupon: null }),
  getCartTotal: () => get().cart.reduce((sum, item) => sum + item.price, 0),

  appliedCoupon: null,
  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
  clearAppliedCoupon: () => set({ appliedCoupon: null }),
  getDiscountAmount: () => {
    const { appliedCoupon, cart } = get();
    if (!appliedCoupon) return 0;
    
    let eligibleTotal = 0;
    if (appliedCoupon.appliesTo === 'SPECIFIC_COURSES' && Array.isArray(appliedCoupon.courseIds) && appliedCoupon.courseIds.length > 0) {
      eligibleTotal = cart
        .filter(it => it.itemType === 'COURSE' && appliedCoupon.courseIds?.includes(it.itemId))
        .reduce((sum, it) => sum + Number(it.price || 0), 0);
    } else {
      eligibleTotal = cart.reduce((sum, it) => sum + Number(it.price || 0), 0);
    }

    if (eligibleTotal <= 0) return 0;
    if (appliedCoupon.minOrderValue && eligibleTotal < appliedCoupon.minOrderValue) return 0;

    let discount = 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = (eligibleTotal * Number(appliedCoupon.discountValue || 0)) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = Math.min(Number(appliedCoupon.discountValue || 0), eligibleTotal);
    }

    return Math.round(discount * 100) / 100;
  },
  getFinalTotal: () => {
    const total = get().getCartTotal();
    const discount = get().getDiscountAmount();
    return Math.max(0, Math.round((total - discount) * 100) / 100);
  },

  isAuthModalOpen: false,
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

  language: localStorage.getItem("user_lang_pref") || "",
  setLanguage: (lang) => {
    localStorage.setItem("user_lang_pref", lang);
    set({ language: lang });
  },
  languages: [],
  setLanguages: (langs) => set({ languages: Array.isArray(langs) ? langs : [] }),

  currency: localStorage.getItem("currency") || "USD",
  setCurrency: (currency) => {
    localStorage.setItem("currency", currency);
    set({ currency });
  },

  categories: [],
  setCategories: (cats) => set({ categories: Array.isArray(cats) ? cats : [] }),

  settings: [],
  setSettings: (settings) => set({ settings: Array.isArray(settings) ? settings : [] }),

  favorites: [],
  setFavorites: (favs) => set({ favorites: Array.isArray(favs) ? favs : [] }),
  enrolledItems: null,
  setEnrolledItems: (items) => set({ enrolledItems: items }),
  toggleFavorite: async (itemType, itemId, token) => {
    const { favorites, setFavorites } = get();
    const existing = favorites.find(f => f.itemType === itemType && f.itemId === itemId);
    if (existing) {
      // Optimistic update
      setFavorites(favorites.filter(f => f.id !== existing.id));
      await fetch(`/api/favorites/${existing.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      // Optimistic upate (fake ID that will be replaced on reload, or we can just fetch)
      // Actually let's wait for API to get real ID
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemType, itemId })
      });
      const data = await res.json();
      if (!data.error) {
        setFavorites([...get().favorites, data]);
      }
    }
  }
}));
