import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'candelaria_cart_v1';

const CartContext = createContext(null);

const playAddToCartSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(640, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(920, audioContext.currentTime + 0.08);

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);

    oscillator.onended = () => {
      audioContext.close().catch(() => {});
    };
  } catch {
    // Ignore audio errors to keep cart behavior stable.
  }
};

const normalizeCurrency = (currency) => (currency || 'usd').toLowerCase();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (newItem) => {
    if (!newItem?.productId || !newItem?.name || !newItem?.price) {
      return false;
    }

    setItems((prev) => {
      const key = `${newItem.kind}:${newItem.productId}`;

      // Membership: only one type allowed at a time; quantity capped at 1.
      if (newItem.kind === 'membership') {
        const withoutMemberships = prev.filter((item) => item.kind !== 'membership');
        return [
          ...withoutMemberships,
          {
            key,
            kind: 'membership',
            productId: newItem.productId,
            name: newItem.name,
            price: Number(newItem.price),
            currency: normalizeCurrency(newItem.currency),
            quantity: 1,
            meta: newItem.meta || {},
          },
        ];
      }

      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          key,
          kind: newItem.kind || 'product',
          productId: newItem.productId,
          name: newItem.name,
          price: Number(newItem.price),
          currency: normalizeCurrency(newItem.currency),
          quantity: 1,
          meta: newItem.meta || {},
        },
      ];
    });

    playAddToCartSound();
    return true;
  };

  const decrementItem = (key) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: Math.max(0, item.quantity - 1),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const incrementItem = (key) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        // Memberships are capped at quantity 1
        if (item.kind === 'membership') return item;
        return { ...item, quantity: item.quantity + 1 };
      })
    );
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setItems([]);
  };

  const differentProductsCount = items.length;
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      differentProductsCount,
      totalItems,
      subtotal,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    }),
    [items, differentProductsCount, totalItems, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
