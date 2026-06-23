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
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => get().cart.reduce((sum, item) => sum + item.price, 0),

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
