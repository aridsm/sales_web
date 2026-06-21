"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { formatCurrency } from "@/app/utils/formatters/currency";
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
import { SaleCart } from "../components/SaleCart";
import type { Product } from "@/api/schemas/Product";
import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../../components/inputs/AppSelectPaginated";
import AppInputText from "../../../components/inputs/AppInputText";
import { categoriesService } from "@/api/services/CategoryService";
import { CategoryType } from "@/enums/CategoryType";
import {
  SearchOutlined,
  AddOutlined,
  RemoveOutlined,
  DeleteOutlined,
  ArrowBackOutlined,
} from "@mui/icons-material";
import { salesService } from "@/api/services/SaleService";
import { useTranslation } from "@/app/utils/i18n";
import { Category } from "@/api/schemas/Category";

export default function NewSalePage() {
  const { t } = useTranslation();
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
      title: t("labels.sales.new.clear_cart_title"),
      message: t("labels.sales.new.clear_cart_message"),
      confirmLabel: t("labels.all.clear"),
      onConfirm: () => setCart([]),
    });
  }

  const totalItems = getTotalItems(cart);
  const totalPrice = getTotalPrice(cart);

  async function finishSale() {
    if (cart.length === 0) return;

    openDialog({
      variant: "confirm",
      title: t("labels.sales.new.finish_sale_title"),
      message: t("labels.sales.new.finish_sale_message", {
        items: `${totalItems} ${totalItems === 1 ? t("labels.sales.new.item_singular") : t("labels.sales.new.item_plural")}`,
        total: formatCurrency(totalPrice),
      }),
      confirmLabel: t("labels.all.finish"),
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
            message: t("labels.sales.new.success"),
          });
          router.push("/sales");
        } catch (err: unknown) {
          const error = err as {
            response?: { data?: { detail?: { error?: string } } };
          };
          openDialog({
            variant: "error",
            message: t(
              error.response?.data?.detail?.error
                ? `errors.sales.${error.response.data.detail.error}`
                : "errors.all.generic",
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
        title: t("labels.sales.new.exit_title"),
        message: t("labels.sales.new.exit_message"),
        confirmLabel: t("labels.all.exit"),
        onConfirm: () => router.push("/sales"),
      });
    } else {
      router.push("/sales");
    }
  }

  return (
    <AppPage title={t("labels.sales.new.title")}>
      <div className="mb-4">
        <AppButton
          color="transparent"
          flat
          onClick={handleGoBack}
          className="gap-1.5! px-2! -ml-2"
        >
          <ArrowBackOutlined style={{ fontSize: 18 }} />
          <span className="text-sm">{t("labels.sales.new.back")}</span>
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
                placeholder={t("labels.sales.new.search_placeholder")}
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
              emptyMessage={t("labels.sales.new.no_products")}
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
                          title={t("labels.sales.new.remove_from_cart")}
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
                            {product.stock_amount}{" "}
                            {t("labels.sales.new.in_stock")}
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
                              {t("labels.all.add")}
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

function SaleNewFilterFields() {
  const { t } = useTranslation();
  const { control, register } = useFormContext();

  const categories = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
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
            label={t("labels.sales.category")}
            placeholder={t("labels.sales.filter_category")}
            pagination={categories}
            search
            multiple
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <AppInputText
        label={t("labels.sales.code")}
        placeholder={t("labels.sales.search_code")}
        {...register("code")}
      />
    </>
  );
}
