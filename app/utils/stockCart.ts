export interface StockCartProduct {
  id: string;
}

export interface StockCartItem<T extends StockCartProduct = StockCartProduct> {
  product: T;
  quantity: number;
  unit_price: number;
}

export function addToStockCart<T extends StockCartProduct>(
  cart: StockCartItem<T>[],
  product: T,
): StockCartItem<T>[] {
  const existing = cart.find((i) => i.product.id === product.id);

  if (existing) {
    return cart.map((i) =>
      i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
    );
  }

  return [...cart, { product, quantity: 1, unit_price: 0 }];
}

export function updateStockQuantity<T extends StockCartProduct>(
  cart: StockCartItem<T>[],
  productId: string,
  delta: number,
): StockCartItem<T>[] {
  return cart
    .map((item) => {
      if (item.product.id !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return null;
      return { ...item, quantity: newQty };
    })
    .filter(Boolean) as StockCartItem<T>[];
}

export function updateStockUnitPrice<T extends StockCartProduct>(
  cart: StockCartItem<T>[],
  productId: string,
  unit_price: number,
): StockCartItem<T>[] {
  return cart.map((item) => {
    if (item.product.id !== productId) return item;
    return { ...item, unit_price };
  });
}

export function setStockQuantity<T extends StockCartProduct>(
  cart: StockCartItem<T>[],
  productId: string,
  quantity: number,
): StockCartItem<T>[] {
  if (quantity <= 0) {
    return cart.filter((i) => i.product.id !== productId);
  }
  return cart.map((item) => {
    if (item.product.id !== productId) return item;
    return { ...item, quantity };
  });
}

export function removeFromStockCart<T extends StockCartProduct>(
  cart: StockCartItem<T>[],
  productId: string,
): StockCartItem<T>[] {
  return cart.filter((i) => i.product.id !== productId);
}

export function getTotalStockItems(cart: StockCartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

export function getTotalStockPrice(cart: StockCartItem[]): number {
  return cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
}
