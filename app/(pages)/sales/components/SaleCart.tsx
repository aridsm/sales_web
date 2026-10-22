import { useState } from "react";
import AppCard from "../../../components/AppCard";
import AppButton from "../../../components/AppButton";
import AppEmptyState from "../../../components/AppEmptyState";
import { useTranslation } from "@/app/utils/i18n";
import { formatCurrency } from "@/app/utils/formatters/currency";
import type { CartItem } from "@/app/utils/cart";
import type { Product } from "@/api/schemas/Product";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  RemoveOutlined,
  AddOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";
import AppDate from "../../../components/inputs/AppDate";

export function SaleCart({
  cart,
  totalItems,
  totalPrice,
  discount,
  onDiscountChange,
  isFinishing,
  onClearCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onFinishSale,
  saleDate,
  onDateChange,
}: {
  cart: CartItem<Product>[];
  totalItems: number;
  totalPrice: number;
  discount: number;
  onDiscountChange: (value: number) => void;
  isFinishing: boolean;
  onClearCart: () => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onFinishSale: () => void;
  saleDate: string;
  onDateChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const [editingQty, setEditingQty] = useState<Record<string, string>>({});

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <AppCard className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xs bg-primary/10 flex items-center justify-center">
              <ShoppingCartOutlined
                className="text-primary"
                style={{ fontSize: 20 }}
              />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {t("labels.sales.new.cart")}
              </h2>
              <span className="text-label">
                {totalItems === 0
                  ? t("labels.sales.new.no_items")
                  : `${totalItems} ${totalItems === 1 ? t("labels.sales.new.item_singular") : t("labels.sales.new.item_plural")}`}
              </span>
            </div>
          </div>
          {cart.length > 0 && (
            <AppButton
              color="background"
              onClick={onClearCart}
              className="w-8 min-w-8 px-0 md:w-auto md:min-w-0 md:px-3.5 shrink-0"
              title={t("labels.all.clear")}
              aria-label={t("labels.all.clear")}
            >
              <DeleteOutlined
                style={{ fontSize: 16 }}
                className="text-red-500"
              />
              <span className="hidden md:inline">{t("labels.all.clear")}</span>
            </AppButton>
          )}
        </div>

        <div className="px-4 py-3 border-b border-border">
          <AppDate
            label={t("labels.sales.new.sale_date")}
            value={saleDate}
            onChange={onDateChange}
            showTime
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4">
              <AppEmptyState
                icon={<ShoppingCartOutlined fontSize="medium" />}
                title={t("labels.sales.new.add_products_to_cart")}
                subtitle={null as any}
                className="bg-transparent! dark:bg-transparent! border-none!"
                iconClassName="text-primary bg-primary/10"
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {cart.map((item) => (
                <li
                  key={item.product.id}
                  className="px-4 py-3 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate flex-1">
                      {item.product.name}
                    </p>
                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="text-label hover:text-red-500 transition-colors shrink-0 cursor-pointer p-0.5"
                    >
                      <DeleteOutlined style={{ fontSize: 16 }} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-label">
                      {formatCurrency(item.product.price)}{" "}
                      {t("labels.sales.new.unit")}
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingQty((prev) => {
                              const next = { ...prev };
                              delete next[item.product.id];
                              return next;
                            });
                            onUpdateQuantity(item.product.id, -1);
                          }}
                          className="w-7 h-7 rounded-xs border border-border hover:border-border-2 flex items-center justify-center text-foreground-2 hover:text-foreground transition-all cursor-pointer bg-background-2 dark:bg-background-3"
                        >
                          <RemoveOutlined style={{ fontSize: 14 }} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item.product.stock_amount}
                          value={
                            editingQty[item.product.id] !== undefined
                              ? editingQty[item.product.id]
                              : item.quantity
                          }
                          onKeyDown={(e) => {
                            if (
                              e.key === "-" ||
                              e.key === "e" ||
                              e.key === "E" ||
                              e.key === "." ||
                              e.key === ","
                            ) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setEditingQty((prev) => ({
                              ...prev,
                              [item.product.id]: raw,
                            }));
                            const parsed = parseInt(raw, 10);
                            if (!isNaN(parsed) && parsed > 0) {
                              const clamped = Math.min(
                                parsed,
                                item.product.stock_amount,
                              );
                              if (clamped !== item.quantity) {
                                onUpdateQuantity(
                                  item.product.id,
                                  clamped - item.quantity,
                                );
                              }
                              if (parsed > item.product.stock_amount) {
                                setEditingQty((prev) => ({
                                  ...prev,
                                  [item.product.id]: String(clamped),
                                }));
                              }
                            }
                          }}
                          onBlur={() => {
                            setEditingQty((prev) => {
                              const next = { ...prev };
                              delete next[item.product.id];
                              return next;
                            });
                          }}
                          className="w-12 h-7 text-center font-semibold text-foreground text-sm border border-border rounded-xs bg-background dark:bg-background-2 focus:outline-none focus:border-primary tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => {
                            setEditingQty((prev) => {
                              const next = { ...prev };
                              delete next[item.product.id];
                              return next;
                            });
                            onUpdateQuantity(item.product.id, 1);
                          }}
                          disabled={item.quantity >= item.product.stock_amount}
                          className="w-7 h-7 rounded-xs border border-border hover:border-border-2 flex items-center justify-center text-foreground-2 hover:text-foreground transition-all cursor-pointer bg-background-2 dark:bg-background-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <AddOutlined style={{ fontSize: 14 }} />
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-foreground w-24 text-right">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-label">
              <span>{t("labels.sales.new.items_label")}</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-label">
              <span>{t("labels.all.subtotal")}</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-label gap-2">
              <span>{t("labels.all.discount")}</span>
              <div className="w-28">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount > 0 ? discount : ""}
                  onChange={(e) =>
                    onDiscountChange(
                      Math.max(0, parseFloat(e.target.value) || 0),
                    )
                  }
                  placeholder="0,00"
                  className="w-full text-right h-8 py-1 px-2 border border-border rounded-xs bg-background text-sm font-medium text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>{t("labels.sales.new.total")}</span>
              <span>{formatCurrency(Math.max(0, totalPrice - discount))}</span>
            </div>
          </div>

          <AppButton
            color="primary"
            disabled={cart.length === 0 || isFinishing}
            onClick={onFinishSale}
            className="w-full h-12 gap-2!"
          >
            <CheckCircleOutlined style={{ fontSize: 20 }} />
            {isFinishing
              ? t("labels.all.processing")
              : t("labels.sales.new.finish_button")}
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
