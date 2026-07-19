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

export function SaleCart({
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
  const { t } = useTranslation();
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
              color="red"
              flat
              onClick={onClearCart}
              className="! px-2! py-1!"
            >
              {t("labels.all.clear")}
            </AppButton>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4">
              <AppEmptyState
                icon={<ShoppingCartOutlined fontSize="medium" />}
                title={t("labels.sales.new.add_products_to_cart")}
                subtitle={null as any}
                className="bg-transparent! dark:bg-transparent! border-none!"
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
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-7 h-7 rounded-md border border-border hover:border-border-2 flex items-center justify-center text-foreground-2 hover:text-foreground transition-all cursor-pointer bg-background-2 dark:bg-background-3"
                        >
                          <RemoveOutlined style={{ fontSize: 14 }} />
                        </button>
                        <span className="w-8 text-center font-semibold text-foreground text-sm">
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
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>{t("labels.sales.new.total")}</span>
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
            {isFinishing
              ? t("labels.all.processing")
              : t("labels.sales.new.finish_button")}
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
