"use client";

import { useState, useRef, useEffect } from "react";
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
import { categoriesService } from "@/api/services/CategoryService";
import { CategoryType } from "@/enums/CategoryType";
import {
  SearchOutlined,
  ArrowBackOutlined,
  AddOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import { stockEntriesService } from "@/api/services/StockEntryService";
import { useTranslation } from "@/app/utils/i18n";
import { Category } from "@/api/schemas/Category";

export default function NewStockEntryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
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
      title: "Limpar itens",
      message: "Tem certeza que deseja remover todos os itens da compra?",
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
          message: "Entrada de estoque registrada com sucesso!",
        });
        router.push("/stock-entries");
      })
      .catch(() => {
        openDialog({
          variant: "error",
          message: "Ocorreu um erro ao registrar a entrada de estoque.",
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
      // Warn but don't block — user can proceed or go back to fix
      openDialog({
        variant: "confirm",
        title: "Itens sem preço",
        message: `Os seguintes itens estão com preço unitário zerado:\n\n${zeroPriceNames.join(", ")}.\n\nDeseja prosseguir mesmo assim?`,
        confirmLabel: "Prosseguir",
        onConfirm: () => {
          // After confirming the warning, show the final confirmation
          openDialog({
            variant: "confirm",
            title: "Finalizar Compra",
            message: `Confirmar registro de compra de ${totalItems} ${totalItems === 1 ? "item" : "itens"} no valor total de ${formatCurrency(totalPrice)}?`,
            confirmLabel: t("labels.all.finish"),
            onConfirm: submitEntry,
          });
        },
      });
      return;
    }

    openDialog({
      variant: "confirm",
      title: "Finalizar Compra",
      message: `Confirmar registro de compra de ${totalItems} ${totalItems === 1 ? "item" : "itens"} no valor total de ${formatCurrency(totalPrice)}?`,
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
        title: "Sair da compra",
        message:
          "Você tem itens pendentes. Deseja sair e descartar a operação?",
        confirmLabel: t("labels.all.exit"),
        onConfirm: () => router.push("/stock-entries"),
      });
    } else {
      router.push("/stock-entries");
    }
  }

  return (
    <AppPage title="Nova Entrada de Estoque">
      <div className="mb-4">
        <AppButton
          color="transparent"
          flat
          onClick={handleGoBack}
          className="gap-1.5! px-2! -ml-2"
        >
          <ArrowBackOutlined style={{ fontSize: 18 }} />
          <span className="text-sm">Voltar para Entradas</span>
        </AppButton>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Product listing */}
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
              <StockNewFilterFields />
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
                            ? "border-primary bg-primary/5 dark:bg-primary/10 cursor-default"
                            : "border-border bg-background-2 dark:bg-background-3 hover:border-border-2 hover:bg-background-2! cursor-pointer"
                        }
                      `}
                    >
                      {/* Category badge */}
                      <div className="flex items-center gap-2 mb-2 min-w-0">
                        <div
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: product.category_color }}
                        />
                        <span className="text-sm text-label truncate">
                          {product.category_name}
                        </span>
                      </div>

                      {/* Product name */}
                      <p className="text-foreground leading-snug mb-3 line-clamp-2 font-medium">
                        {product.name}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto h-8">
                        <span className="text-xs text-label">
                          {product.stock_amount} em estoque
                        </span>

                        {inCart === 0 ? (
                          <AppButton
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="py-1! px-3! opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <AddOutlined style={{ fontSize: 16 }} />
                            Adicionar
                          </AppButton>
                        ) : (
                          <AppButton
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(product.id);
                            }}
                            color="red"
                            flat
                            className="py-1! px-3! bg-red-500/10! hover:bg-red-500/20!"
                          >
                            <DeleteOutlined style={{ fontSize: 16 }} />
                            Remover
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

        {/* Cart sidebar */}
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
    </>
  );
}
