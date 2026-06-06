"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppPage from "../../../components/AppPage";
import AppCard from "../../../components/AppCard";
import AppButton from "../../../components/AppButton";
import AppFilter from "../../../components/AppFilter";
import AppInfinity from "@/app/components/AppInfinity";
import { useDialogStore } from "@/stores/dialogStore";
import { productsService } from "@/api/services/ProductService";
import {
  usePagination,
  type PaginationService,
} from "@/app/utils/usePagination";
import {
  addToCart as addToCartFn,
  updateQuantity as updateQuantityFn,
  removeFromCart as removeFromCartFn,
  getTotalItems,
  getTotalPrice,
  type CartItem,
} from "@/app/utils/cart";
import type { Product } from "@/api/schemas/Product";
import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../../components/inputs/AppSelectPaginated";
import AppInputText from "../../../components/inputs/AppInputText";
import { categoriesService } from "@/api/services/Categories";
import { CategoryType } from "@/enums/CategoryType";
import {
  SearchOutlined,
  AddOutlined,
  RemoveOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ReceiptOutlined,
  ArrowBackOutlined,
} from "@mui/icons-material";
import { salesService } from "@/api/services/SaleService";
import { useTranslation } from "@/app/utils/i18n";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function NewSalePage() {
  const { t: getLabel } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem<Product>[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const { openDialog } = useDialogStore();
  const searchRef = useRef<HTMLInputElement>(null);
  const productsPagination = usePagination<Product>(productsService);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const filterParams = Object.fromEntries(searchParams.entries());
        await productsPagination.load({
          params: { ...filterParams, search, page: 1 },
        });
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setInitialLoaded(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchParams]);

  function addToCart(product: Product) {
    setCart((prev) => addToCartFn(prev, product));
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) => updateQuantityFn(prev, productId, delta));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => removeFromCartFn(prev, productId));
  }

  function clearCart() {
    if (cart.length === 0) return;
    openDialog({
      variant: "confirm",
      title: "Limpar carrinho",
      message: "Tem certeza que deseja remover todos os itens do carrinho?",
      confirmLabel: "Limpar",
      onConfirm: () => setCart([]),
    });
  }

  const totalItems = getTotalItems(cart);
  const totalPrice = getTotalPrice(cart);

  async function finishSale() {
    if (cart.length === 0) return;

    openDialog({
      variant: "confirm",
      title: "Finalizar venda",
      message: `Confirmar venda de ${totalItems} ${totalItems === 1 ? "item" : "itens"} no valor de ${formatCurrency(totalPrice)}?`,
      confirmLabel: "Finalizar",
      onConfirm: async () => {
        setIsFinishing(true);
        try {
          await salesService.post({
            products: cart.map((i) => ({
              product_id: i.product.id,
              quantity: i.quantity,
            })),
          });
          setCart([]);
          setSearch("");
          openDialog({
            variant: "success",
            message: "Venda registrada com sucesso!",
          });
          router.push("/sales");
        } catch (error: any) {
          openDialog({
            variant: "error",
            message: getLabel(
              `errors.sales.${error.response.data.detail.error}`,
            ),
          });
        } finally {
          setIsFinishing(false);
        }
      },
    });
  }

  function getCartQuantity(productId: string): number {
    return cart.find((i) => i.product.id === productId)?.quantity ?? 0;
  }

  function handleGoBack() {
    if (cart.length > 0) {
      openDialog({
        variant: "confirm",
        title: "Sair da venda",
        message: "Você tem itens no carrinho. Deseja sair e descartar a venda?",
        confirmLabel: "Sair",
        onConfirm: () => router.push("/sales"),
      });
    } else {
      router.push("/sales");
    }
  }

  return (
    <AppPage title="Nova Venda">
      <div className="mb-4">
        <AppButton
          color="transparent"
          flat
          onClick={handleGoBack}
          className="gap-1.5! px-2! -ml-2"
        >
          <ArrowBackOutlined style={{ fontSize: 18 }} />
          <span className="text-sm">Voltar para vendas</span>
        </AppButton>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <SearchOutlined
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label pointer-events-none"
                style={{ fontSize: 20 }}
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto por nome ou categoria..."
                className="input-field w-full pl-11!"
              />
            </div>
            <AppFilter pagination={productsPagination}>
              <SaleNewFilterFields />
            </AppFilter>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <AppInfinity
              pagination={productsPagination}
              initialLoaded={initialLoaded}
              emptyMessage="Nenhum produto encontrado"
            >
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {productsPagination.items.map((product) => {
                  const inCart = getCartQuantity(product.id);
                  const outOfStock = product.stock_amount <= 0;
                  const maxedOut = inCart >= product.stock_amount;

                  return (
                    <AppCard
                      key={product.id}
                      onClick={() => {
                        if (inCart === 0 && !outOfStock) {
                          addToCart(product);
                        }
                      }}
                      className={`
                          group relative text-left p-4 rounded-lg border transition-all duration-200 flex flex-col h-full
                          ${
                            inCart > 0
                              ? "border-primary bg-primary/5 dark:bg-primary/10"
                              : "border-border bg-background-2 dark:bg-background-3 hover:border-border-2"
                          }
                          ${outOfStock ? "opacity-50" : ""}
                          ${inCart === 0 && !outOfStock ? "cursor-pointer" : ""}
                        `}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ backgroundColor: product.category_color }}
                          />
                          <span className="text-sm text-label truncate">
                            {product.category_name}
                          </span>
                        </div>
                        <AppButton
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(product.id);
                          }}
                          color="background"
                          className={`px-2! text-red-500 ${!inCart ? "opacity-0 pointer-events-none" : "hover:bg-red-500/10"}`}
                          title="Remover do carrinho"
                        >
                          <DeleteOutlined style={{ fontSize: 16 }} />
                        </AppButton>
                      </div>

                      <p className="text-foreground leading-snug mb-3 line-clamp-2 font-medium">
                        {product.name}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-lg font-semibold text-foreground leading-none mb-1">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-xs text-label">
                            {product.stock_amount} em estoque
                          </span>
                        </div>

                        {inCart > 0 ? (
                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AppButton
                              color="background"
                              className="px-2!"
                              onClick={() => updateQuantity(product.id, -1)}
                            >
                              <RemoveOutlined style={{ fontSize: 14 }} />
                            </AppButton>
                            <span className="w-6 text-center text-sm font-semibold text-foreground">
                              {inCart}
                            </span>
                            <AppButton
                              className="px-2!"
                              color="background"
                              onClick={() => updateQuantity(product.id, 1)}
                              disabled={maxedOut}
                            >
                              <AddOutlined style={{ fontSize: 14 }} />
                            </AppButton>
                          </div>
                        ) : (
                          !outOfStock && (
                            <AppButton
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="py-1! px-3! opacity-0 group-hover:opacity-100 transition-opacity "
                            >
                              Adicionar
                            </AppButton>
                          )
                        )}
                      </div>
                    </AppCard>
                  );
                })}
              </div>
            </AppInfinity>
          </div>
        </div>

        <SaleCart
          cart={cart}
          totalItems={totalItems}
          totalPrice={totalPrice}
          isFinishing={isFinishing}
          onClearCart={clearCart}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
          onFinishSale={finishSale}
        />
      </div>
    </AppPage>
  );
}

function SaleCart({
  cart,
  totalItems,
  totalPrice,
  isFinishing,
  onClearCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onFinishSale,
}: {
  cart: CartItem<Product>[];
  totalItems: number;
  totalPrice: number;
  isFinishing: boolean;
  onClearCart: () => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onFinishSale: () => void;
}) {
  return (
    <div className="w-96 shrink-0 flex flex-col min-h-0">
      <AppCard className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCartOutlined
                className="text-primary"
                style={{ fontSize: 20 }}
              />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Carrinho</h2>
              <span className=" text-label">
                {totalItems === 0
                  ? "Nenhum item"
                  : `${totalItems} ${totalItems === 1 ? "item" : "itens"}`}
              </span>
            </div>
          </div>
          {cart.length > 0 && (
            <AppButton
              color="red"
              flat
              onClick={onClearCart}
              className="! px-2! py-1!"
            >
              Limpar
            </AppButton>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-label gap-2 py-12">
              <ReceiptOutlined style={{ fontSize: 40, opacity: 0.2 }} />
              <span className="text-sm">Adicione produtos à venda</span>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {cart.map((item) => (
                <li
                  key={item.product.id}
                  className="px-4 py-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {item.product.name}
                      </p>
                      <p className=" text-label mt-0.5">
                        {formatCurrency(item.product.price)} un.
                      </p>
                    </div>
                    <AppButton
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="text-label hover:text-red-500 transition-colors shrink-0 cursor-pointer p-0.5"
                    >
                      <DeleteOutlined style={{ fontSize: 16 }} />
                    </AppButton>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded-md border border-border hover:border-border-2 flex items-center justify-center text-foreground-2 hover:text-foreground transition-all cursor-pointer bg-background-2 dark:bg-background-3"
                      >
                        <RemoveOutlined style={{ fontSize: 14 }} />
                      </button>
                      <span className="w-9 text-center font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock_amount}
                        className="w-7 h-7 rounded-md border border-border hover:border-border-2 flex items-center justify-center text-foreground-2 hover:text-foreground transition-all cursor-pointer bg-background-2 dark:bg-background-3 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <AddOutlined style={{ fontSize: 14 }} />
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-label">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-label">
              <span>Itens</span>
              <span>{totalItems}</span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <AppButton
            color="primary"
            disabled={cart.length === 0 || isFinishing}
            onClick={onFinishSale}
            className="w-full h-12 text-base! font-semibold gap-2!"
          >
            <CheckCircleOutlined style={{ fontSize: 20 }} />
            {isFinishing ? "Processando..." : "Finalizar Venda"}
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}

function SaleNewFilterFields() {
  const { control, register } = useFormContext();

  const categories = usePagination<any>(
    categoriesService as unknown as PaginationService<any>,
    { type: CategoryType.PRODUCT, page_size: 20 },
  );

  useEffect(() => {
    categories.load({ params: { page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Controller
        control={control}
        name="category_id"
        render={({ field }) => (
          <AppSelectPaginated
            label="Categoria"
            placeholder="Filtrar por categoria"
            pagination={categories}
            search
            multiple
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <AppInputText
        label="Código"
        placeholder="Buscar por código"
        {...register("code")}
      />
    </>
  );
}
