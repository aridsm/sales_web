export interface CartProduct {
  id: string;
  price: number;
  stock_amount: number;
}

export interface CartItem<T extends CartProduct = CartProduct> {
  product: T;
  quantity: number;
}

export function addToCart<T extends CartProduct>(
  cart: CartItem<T>[],
  product: T,
): CartItem<T>[] {
  const existing = cart.find((i) => i.product.id === product.id);

  if (existing) {
    if (existing.quantity >= product.stock_amount) return cart;
    return cart.map((i) =>
      i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
    );
  }

  return [...cart, { product, quantity: 1 }];
}

export function updateQuantity<T extends CartProduct>(
  cart: CartItem<T>[],
  productId: string,
  delta: number,
): CartItem<T>[] {
  return cart
    .map((item) => {
      if (item.product.id !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > item.product.stock_amount) return item;
      return { ...item, quantity: newQty };
    })
    .filter(Boolean) as CartItem<T>[];
}

export function removeFromCart<T extends CartProduct>(
  cart: CartItem<T>[],
  productId: string,
): CartItem<T>[] {
  return cart.filter((i) => i.product.id !== productId);
}

export function getTotalItems(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

export function getTotalPrice(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}
