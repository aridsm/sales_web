export const currencyFormatter = {
  prefixLength: 3,
  mask: (value: number | string | undefined | null): string => {
    if (value === undefined || value === null || value === "") return "";

    const numberValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^\d.-]/g, ""))
        : value;

    if (isNaN(numberValue)) return "";

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  },

  unmask: (value: any): number => {
    if (value === undefined || value === null || value === "") return 0;
    if (typeof value === "number") return value;

    const stringValue = String(value);

    if (stringValue.includes("R$")) {
      const digits = stringValue.replace(/\D/g, "");
      return parseInt(digits || "0") / 100;
    }

    const cleanValue = stringValue
      .replace(/\.(?=\d{3,}(\,|$))/g, "")
      .replace(",", ".");

    const parsedValue = parseFloat(cleanValue);
    return isNaN(parsedValue) ? 0 : parsedValue;
  },

  formatInput: (value: string): string => {
    const digits = value.replace(/\D/g, "");
    const numberValue = parseInt(digits || "0") / 100;

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  },
};
