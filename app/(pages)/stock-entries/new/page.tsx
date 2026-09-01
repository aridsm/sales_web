"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { useRouter } from "next/navigation";
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
  addToStockCart,
  updateStockUnitPrice,
  setStockQuantity,
  removeFromStockCart,
  getTotalStockItems,
  getTotalStockPrice,
  type StockCartItem,
} from "@/app/utils/stockCart";
import { StockEntryCart } from "../components/StockEntryCart";
import type { Product } from "@/api/schemas/Product";
import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../../components/inputs/AppSelectPaginated";
import AppNumberRange from "../../../components/inputs/AppNumberRange";
import { categoriesService } from "@/api/services/CategoryService";
import { CategoryType } from "@/enums/CategoryType";
import {
  SearchOutlined,
  ArrowBackOutlined,
  AddOutlined,
  DeleteOutlined,
  ErrorTwoTone,
} from "@mui/icons-material";
import { stockEntriesService } from "@/api/services/StockEntryService";
import { useTranslation } from "@/app/utils/i18n";
import { Category, getApiError } from "@/api/schemas";

export default function NewStockEntryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const handleFilterChange = useCallback(
    (params: Record<string, unknown>) => setFilterParams(params),
    [],
  );
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<StockCartItem<Product>[]>([]);
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString());
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
        await productsPagination.load({
          replace: true,
          params: { ...filterParams, search, page: 1 },
        });
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setInitialLoaded(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterParams]);

  function addToCart(product: Product) {
    setCart((prev) => addToStockCart(prev, product));
  }

  function handleSetQuantity(productId: string, quantity: number) {
    setCart((prev) => setStockQuantity(prev, productId, quantity));
  }

  function updateUnitPrice(productId: string, price: number) {
    setCart((prev) => updateStockUnitPrice(prev, productId, price));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => removeFromStockCart(prev, productId));
  }

  function clearCart() {
    if (cart.length === 0) return;
    openDialog({
      variant: "confirm",
      title: t("labels.stock_entries.new.clear_cart_title"),
      message: t("labels.stock_entries.new.clear_cart_message"),
      confirmLabel: t("labels.all.clear"),
      onConfirm: () => setCart([]),
    });
  }

  const totalItems = getTotalStockItems(cart);
  const totalPrice = getTotalStockPrice(cart);

  function submitEntry() {
    setIsFinishing(true);
    stockEntriesService
      .post({
        date: entryDate,
        products: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      })
      .then(() => {
        setCart([]);
        setSearch("");
        openDialog({
          variant: "success",
          message: t("labels.stock_entries.new.success"),
        });
        router.push("/stock-entries");
      })
      .catch((err) => {
        const { code, params } = getApiError(err);
        openDialog({
          variant: "error",
          message: t(
            code ? `errors.stock_entries.${code}` : "errors.all.generic",
            params,
          ),
        });
      })
      .finally(() => {
        setIsFinishing(false);
      });
  }

  async function finishEntry() {
    if (cart.length === 0) return;

    const hasZeroPrice = cart.some((item) => item.unit_price <= 0);
    const zeroPriceNames = cart
      .filter((item) => item.unit_price <= 0)
      .map((item) => item.product.name);

    if (hasZeroPrice) {
      openDialog({
        variant: "confirm",
        title: t("labels.stock_entries.new.zero_price_title"),
        message: t("labels.stock_entries.new.zero_price_message", {
          items: zeroPriceNames.join(", "),
        }),
        confirmLabel: t("labels.stock_entries.new.proceed"),
        onConfirm: () => {
          openDialog({
            variant: "confirm",
            title: t("labels.stock_entries.new.finish_entry_title"),
            message: t("labels.stock_entries.new.finish_entry_message", {
              items: `${totalItems} ${totalItems === 1 ? t("labels.stock_entries.new.item_singular") : t("labels.stock_entries.new.item_plural")}`,
              total: formatCurrency(totalPrice),
            }),
            confirmLabel: t("labels.all.finish"),
            onConfirm: submitEntry,
          });
        },
      });
      return;
    }

    openDialog({
      variant: "confirm",
      title: t("labels.stock_entries.new.finish_entry_title"),
      message: t("labels.stock_entries.new.finish_entry_message", {
        items: `${totalItems} ${totalItems === 1 ? t("labels.stock_entries.new.item_singular") : t("labels.stock_entries.new.item_plural")}`,
        total: formatCurrency(totalPrice),
      }),
      confirmLabel: t("labels.all.finish"),
      onConfirm: submitEntry,
    });
  }

  function getCartQuantity(productId: string): number {
    return cart.find((i) => i.product.id === productId)?.quantity ?? 0;
  }

  function handleGoBack() {
    if (cart.length > 0) {
      openDialog({
        variant: "confirm",
        title: t("labels.stock_entries.new.exit_title"),
        message: t("labels.stock_entries.new.exit_message"),
        confirmLabel: t("labels.all.exit"),
        onConfirm: () => router.push("/stock-entries"),
      });
    } else {
      router.push("/stock-entries");
    }
  }

  return (
    <AppPage title={t("labels.stock_entries.new.title")}>
      <div className="mb-2">
        <AppButton
          color="transparent"
          flat
          onClick={handleGoBack}
          className="gap-1.5! px-2!"
        >
          <ArrowBackOutlined style={{ fontSize: 18 }} />
          <span className="text-sm">{t("labels.stock_entries.new.back")}</span>
        </AppButton>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex gap-3 mb-3">
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
                placeholder={t("labels.stock_entries.new.search_placeholder")}
                className="input-field w-full pl-11!"
              />
            </div>
            <AppFilter
              onChange={handleFilterChange}
              validKeys={["category_id", "stock_amount"]}
            >
              <StockNewFilterFields />
            </AppFilter>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <AppInfinity
              pagination={productsPagination}
              initialLoaded={initialLoaded}
              emptyMessage={t("labels.stock_entries.new.no_products")}
            >
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {productsPagination.items.map((product) => {
                  const inCart = getCartQuantity(product.id);

                  return (
                    <AppCard
                      key={product.id}
                      onClick={() => {
                        if (inCart === 0) addToCart(product);
                      }}
                      className={`
                        group relative text-left p-4 rounded-lg border transition-all duration-200 flex flex-col h-full
                        ${
                          inCart > 0
                            ? "border-primary-3 bg-primary-3/5 dark:bg-primary-3/10 cursor-default"
                            : "border-border bg-background-2 dark:bg-background-3 hover:border-border-2 hover:bg-background-2! cursor-pointer"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2 min-w-0">
                        <div
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: product.category_color }}
                        />
                        <span className="text-sm text-label truncate">
                          {product.category_name}
                        </span>
                      </div>

                      <p className="text-foreground leading-snug mb-3 line-clamp-2 font-medium">
                        {product.name}
                      </p>

                      <div className="flex items-center justify-between mt-auto h-8">
                        <div className="flex items-center gap-1">
                          {product.stock_amount <= 5 && (
                            <ErrorTwoTone
                              style={{ fontSize: 16 }}
                              className={
                                product.stock_amount === 0
                                  ? "text-red-500"
                                  : "text-amber-600 dark:text-amber-400"
                              }
                            />
                          )}
                          <span
                            className={`text-xs ${
                              product.stock_amount === 0
                                ? "text-red-500 font-medium"
                                : product.stock_amount <= 5
                                  ? "text-amber-600 dark:text-amber-400 font-medium"
                                  : "text-label"
                            }`}
                          >
                            {product.stock_amount}{" "}
                            {t("labels.stock_entries.new.in_stock")}
                          </span>
                        </div>

                        {inCart === 0 ? (
                          <AppButton
                            color="primary-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="py-1! px-3! opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <AddOutlined style={{ fontSize: 16 }} />
                            {t("labels.all.add")}
                          </AppButton>
                        ) : (
                          <AppButton
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(product.id);
                            }}
                            color="background"
                            className="py-1! px-3!"
                          >
                            <DeleteOutlined
                              style={{ fontSize: 16 }}
                              className="text-red-500"
                            />
                            {t("labels.all.remove")}
                          </AppButton>
                        )}
                      </div>
                    </AppCard>
                  );
                })}
              </div>
            </AppInfinity>
          </div>
        </div>

        <StockEntryCart
          cart={cart}
          totalItems={totalItems}
          totalPrice={totalPrice}
          isFinishing={isFinishing}
          onClearCart={clearCart}
          onRemoveFromCart={removeFromCart}
          onSetQuantity={handleSetQuantity}
          onUpdateUnitPrice={updateUnitPrice}
          onFinishEntry={finishEntry}
          entryDate={entryDate}
          onDateChange={setEntryDate}
        />
      </div>
    </AppPage>
  );
}

function StockNewFilterFields() {
  const { t } = useTranslation();
  const { control } = useFormContext();

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
            label={t("labels.stock_entries.category")}
            placeholder={t("labels.stock_entries.filter_category")}
            pagination={categories}
            search
            multiple
            clearable
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="stock_amount"
        render={({ field }) => (
          <AppNumberRange
            label={t("labels.products.stock_amount")}
            {...field}
          />
        )}
      />
    </>
  );
}
