import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('opus_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    localStorage.setItem('opus_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (tool) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === tool.id);
      if (exists) return prev;
      return [...prev, tool];
    });
  };

  const removeFromCart = (toolId) => {
    setItems((prev) => prev.filter((i) => i.id !== toolId));
  };

  const clearCart = () => setItems([]);

  const daysCount = Math.max(
    1,
    Math.round(
      (new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)
    )
  );

  const subtotal = items.reduce((sum, item) => sum + (item.dailyPrice || 0) * daysCount, 0);
  const totalDeposit = items.reduce((sum, item) => sum + (item.depositAmount || 0), 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva + totalDeposit;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        dateRange,
        setDateRange,
        daysCount,
        subtotal,
        totalDeposit,
        iva,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
