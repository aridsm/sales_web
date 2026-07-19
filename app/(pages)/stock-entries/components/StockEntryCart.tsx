import AppCard from "../../../components/AppCard";
import AppButton from "../../../components/AppButton";
import AppEmptyState from "../../../components/AppEmptyState";
import { formatCurrency } from "@/app/utils/formatters/currency";
import type { StockCartItem } from "@/app/utils/stockCart";
import type { Product } from "@/api/schemas/Product";
import {
  LocalShippingOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";
import AppDate from "../../../components/inputs/AppDate";

export function StockEntryCart({
  cart,
  totalItems,
  totalPrice,
  isFinishing,
  onClearCart,
  onRemoveFromCart,
  onSetQuantity,
  onUpdateUnitPrice,
  onFinishEntry,
  entryDate,
  onDateChange,
}: {
  cart: StockCartItem<Product>[];
  totalItems: number;
  totalPrice: number;
  isFinishing: boolean;
  onClearCart: () => void;
  onRemoveFromCart: (productId: string) => void;
  onSetQuantity: (productId: string, quantity: number) => void;
  onUpdateUnitPrice: (productId: string, price: number) => void;
  onFinishEntry: () => void;
  entryDate: string;
  onDateChange: (value: string) => void;
}) {
  return (
    <div className="w-[420px] shrink-0 flex flex-col min-h-0">
      <AppCard className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <LocalShippingOutlined
                className="text-primary"
                style={{ fontSize: 20 }}
              />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Itens da Compra</h2>
              <span className="text-label">
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
              className="! px-2! py-1! gap-1!"
            >
              <DeleteOutlined style={{ fontSize: 16 }} />
              Limpar
            </AppButton>
          )}
        </div>

        {/* Date picker */}
        <div className="px-4 py-3 border-b border-border">
          <AppDate
            label="Data da Compra"
            value={entryDate}
            onChange={onDateChange}
            showTime
          />
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4">
              <AppEmptyState
                icon={<LocalShippingOutlined fontSize="medium" />}
                title="Adicione produtos à compra"
                subtitle={null as unknown as string}
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
                  {/* Product name + delete */}
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

                  {/* Qty + Unit Price + Subtotal */}
                  <div className="flex items-end gap-3">
                    {/* Quantity */}
                    <div className="flex flex-col gap-1 w-16 shrink-0">
                      <span className="text-xs text-label">Qtd.</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            onSetQuantity(item.product.id, val);
                          }
                        }}
                        className="w-full text-center bg-background dark:bg-background-2 border border-border rounded-md py-1.5 px-2 text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                      />
                    </div>

                    {/* Unit price */}
                    <div className="flex flex-col gap-1 w-32 shrink-0">
                      <span className="text-xs text-label">Preço un.</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-label font-medium">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price || ""}
                          placeholder="0,00"
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e" || e.key === "E") {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val < 0) return;
                            onUpdateUnitPrice(item.product.id, isNaN(val) ? 0 : val);
                          }}
                          className={`w-full text-right bg-background dark:bg-background-2 border rounded-md py-1.5 pl-8 pr-2 text-sm text-foreground focus:outline-none focus:border-primary font-medium ${
                            item.unit_price <= 0 ? "border-amber-400/60" : "border-border"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex flex-col gap-1 flex-1 items-end">
                      <span className="text-xs text-label">Subtotal</span>
                      <span className="text-sm font-semibold text-foreground py-1.5">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
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
            onClick={onFinishEntry}
            className="w-full h-12 text-base! font-semibold gap-2!"
          >
            <CheckCircleOutlined style={{ fontSize: 20 }} />
            {isFinishing ? "Processando..." : "Finalizar Compra"}
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
