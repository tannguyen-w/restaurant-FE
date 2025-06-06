import { createContext, useState, useContext, useEffect } from "react";

export const CartContext = createContext({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},  // Thêm hàm này để xóa giỏ hàng sau khi thanh toán
  cartTotal: 0,
});

export const CartProvider = ({ children }) => {
  // Khởi tạo giỏ hàng từ localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Lưu giỏ hàng vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Các hàm xử lý giỏ hàng
  const addToCart = (dish) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === dish.id);
      
      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        };
        return newItems;
      } else {
        return [...prevItems, {
          ...dish,
          quantity: 1,
          image: dish.images && dish.images.length > 0 
            ? `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8081"}${dish.images[0]}` 
            : null
        }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  // Xóa toàn bộ giỏ hàng sau khi thanh toán thành công
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  // Tính tổng giá trị giỏ hàng
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);