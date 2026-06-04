import { describe, it, expect } from "vitest";
import {
  addToCart,
  updateQuantity,
  removeFromCart,
  getTotalItems,
  getTotalPrice,
  type CartItem,
  type CartProduct,
} from "@/app/utils/cart";

// ─────────────────────────────────────────────
// Helpers para criar dados de teste
// ─────────────────────────────────────────────
function makeProduct(overrides: Partial<CartProduct> = {}): CartProduct {
  return {
    id: "prod-1",
    price: 49.9,
    stock_amount: 10,
    ...overrides,
  };
}

function makeCart(...items: [Partial<CartProduct>, number][]): CartItem[] {
  return items.map(([productOverrides, quantity]) => ({
    product: makeProduct(productOverrides),
    quantity,
  }));
}

describe("Lógica do Carrinho", () => {
  // ─────────────────────────────────────────────
  // addToCart
  // ─────────────────────────────────────────────
  describe("addToCart", () => {
    it("adiciona um produto novo ao carrinho vazio", () => {
      const product = makeProduct();
      const result = addToCart([], product);

      expect(result).toHaveLength(1);
      expect(result[0].product.id).toBe("prod-1");
      expect(result[0].quantity).toBe(1);
    });

    it("incrementa quantidade se o produto já existe no carrinho", () => {
      const product = makeProduct();
      const cart = makeCart([{ id: "prod-1" }, 2]);

      const result = addToCart(cart, product);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(3);
    });

    it("NÃO incrementa se já atingiu o estoque máximo", () => {
      const product = makeProduct({ stock_amount: 3 });
      const cart = makeCart([{ id: "prod-1", stock_amount: 3 }, 3]);

      const result = addToCart(cart, product);

      // Deve retornar a mesma referência (nenhuma modificação)
      expect(result).toBe(cart);
      expect(result[0].quantity).toBe(3);
    });

    it("mantém outros itens ao adicionar um produto novo", () => {
      const existing = makeCart([{ id: "prod-1", price: 49.9 }, 2]);
      const newProduct = makeProduct({
        id: "prod-2",
        price: 99.9,
      });

      const result = addToCart(existing, newProduct);

      expect(result).toHaveLength(2);
      expect(result[0].product.id).toBe("prod-1");
      expect(result[1].product.id).toBe("prod-2");
      expect(result[1].quantity).toBe(1);
    });

    it("produto com estoque 1 pode ser adicionado mas não incrementado", () => {
      const product = makeProduct({ stock_amount: 1 });

      // Primeira adição: OK
      const cart1 = addToCart([], product);
      expect(cart1[0].quantity).toBe(1);

      // Segunda adição: deve ser bloqueada
      const cart2 = addToCart(cart1, product);
      expect(cart2).toBe(cart1); // mesma referência = sem mudança
    });
  });

  // ─────────────────────────────────────────────
  // updateQuantity
  // ─────────────────────────────────────────────
  describe("updateQuantity", () => {
    it("incrementa a quantidade de um item", () => {
      const cart = makeCart([{ id: "prod-1" }, 2]);

      const result = updateQuantity(cart, "prod-1", 1);

      expect(result[0].quantity).toBe(3);
    });

    it("decrementa a quantidade de um item", () => {
      const cart = makeCart([{ id: "prod-1" }, 3]);

      const result = updateQuantity(cart, "prod-1", -1);

      expect(result[0].quantity).toBe(2);
    });

    it("REMOVE o item se a quantidade chega a zero", () => {
      const cart = makeCart([{ id: "prod-1" }, 1]);

      const result = updateQuantity(cart, "prod-1", -1);

      expect(result).toHaveLength(0);
    });

    it("REMOVE o item se delta é muito negativo", () => {
      const cart = makeCart([{ id: "prod-1" }, 2]);

      const result = updateQuantity(cart, "prod-1", -5);

      expect(result).toHaveLength(0);
    });

    it("NÃO incrementa além do estoque", () => {
      const cart = makeCart([{ id: "prod-1", stock_amount: 5 }, 5]);

      const result = updateQuantity(cart, "prod-1", 1);

      expect(result[0].quantity).toBe(5); // mantém no limite
    });

    it("não afeta outros itens do carrinho", () => {
      const cart = makeCart(
        [{ id: "prod-1" }, 2],
        [{ id: "prod-2" }, 1],
      );

      const result = updateQuantity(cart, "prod-1", 1);

      expect(result).toHaveLength(2);
      expect(result[0].quantity).toBe(3); // incrementado
      expect(result[1].quantity).toBe(1); // intacto
    });

    it("ignora productId inexistente", () => {
      const cart = makeCart([{ id: "prod-1" }, 2]);

      const result = updateQuantity(cart, "inexistente", 1);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(2); // inalterado
    });
  });

  // ─────────────────────────────────────────────
  // removeFromCart
  // ─────────────────────────────────────────────
  describe("removeFromCart", () => {
    it("remove um item pelo ID", () => {
      const cart = makeCart(
        [{ id: "prod-1" }, 2],
        [{ id: "prod-2" }, 1],
      );

      const result = removeFromCart(cart, "prod-1");

      expect(result).toHaveLength(1);
      expect(result[0].product.id).toBe("prod-2");
    });

    it("retorna array vazio ao remover o único item", () => {
      const cart = makeCart([{ id: "prod-1" }, 3]);

      const result = removeFromCart(cart, "prod-1");

      expect(result).toHaveLength(0);
    });

    it("não faz nada se o ID não existe", () => {
      const cart = makeCart([{ id: "prod-1" }, 2]);

      const result = removeFromCart(cart, "inexistente");

      expect(result).toHaveLength(1);
    });
  });

  // ─────────────────────────────────────────────
  // getTotalItems / getTotalPrice
  // ─────────────────────────────────────────────
  describe("getTotalItems", () => {
    it("soma as quantidades de todos os itens", () => {
      const cart = makeCart(
        [{ id: "prod-1" }, 3],
        [{ id: "prod-2" }, 2],
      );

      expect(getTotalItems(cart)).toBe(5);
    });

    it("retorna 0 para carrinho vazio", () => {
      expect(getTotalItems([])).toBe(0);
    });
  });

  describe("getTotalPrice", () => {
    it("calcula o preço total corretamente", () => {
      const cart: CartItem[] = [
        { product: makeProduct({ id: "p1", price: 10 }), quantity: 3 },
        { product: makeProduct({ id: "p2", price: 25.5 }), quantity: 2 },
      ];

      // 10*3 + 25.5*2 = 30 + 51 = 81
      expect(getTotalPrice(cart)).toBe(81);
    });

    it("retorna 0 para carrinho vazio", () => {
      expect(getTotalPrice([])).toBe(0);
    });
  });
});
