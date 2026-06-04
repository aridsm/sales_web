/**
 * Lógica pura do carrinho de compras.
 * Extraída do componente para ser testável independentemente.
 */

export interface CartProduct {
  id: string;
  price: number;
  stock_amount: number;
}

export interface CartItem<T extends CartProduct = CartProduct> {
  product: T;
  quantity: number;
}

/**
 * Adiciona um produto ao carrinho.
 * Se já existe, incrementa a quantidade (respeitando o estoque).
 * Se não existe, adiciona com quantidade 1.
 */
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

/**
 * Atualiza a quantidade de um item no carrinho.
 * - Se a nova quantidade <= 0, remove o item.
 * - Se a nova quantidade > stock_amount, não faz nada.
 */
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

/**
 * Remove um produto do carrinho pelo ID.
 */
export function removeFromCart<T extends CartProduct>(
  cart: CartItem<T>[],
  productId: string,
): CartItem<T>[] {
  return cart.filter((i) => i.product.id !== productId);
}

/**
 * Calcula o total de itens no carrinho.
 */
export function getTotalItems(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

/**
 * Calcula o preço total do carrinho.
 */
export function getTotalPrice(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}
