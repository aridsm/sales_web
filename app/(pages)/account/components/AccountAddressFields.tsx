"use client";

import React, { useState } from "react";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppButton from "@/app/components/AppButton";
import { fetchAddressByCep } from "@/app/utils/cep";
import { useTranslation } from "@/app/utils/i18n";
import { LocationOnOutlined, SearchOutlined } from "@mui/icons-material";

export interface AddressData {
  zip_code?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}

interface AccountAddressFieldsProps {
  data: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
  onAddressFill: (filled: Partial<AddressData>) => void;
  disabled?: boolean;
  title?: string;
}

export default function AccountAddressFields({
  data,
  onChange,
  onAddressFill,
  disabled = false,
  title,
}: AccountAddressFieldsProps) {
  const { t } = useTranslation();
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const handleCepLookup = async (cepToSearch?: string) => {
    const rawCep = cepToSearch || data.zip_code || "";
    const cleanCep = rawCep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      setIsSearchingCep(true);
      const addr = await fetchAddressByCep(cleanCep);
      if (addr) {
        onAddressFill({
          street: addr.logradouro || data.street || "",
          neighborhood: addr.bairro || data.neighborhood || "",
          city: addr.localidade || data.city || "",
          state: addr.uf || data.state || "",
          complement: addr.complemento || data.complement || "",
        });
      }
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleCepChange = (e: any) => {
    const val = String(e?.target?.value ?? "");
    onChange("zip_code", val);
    const clean = val.replace(/\D/g, "");
    if (clean.length === 8) {
      handleCepLookup(clean);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <LocationOnOutlined
          style={{ fontSize: 18 }}
          className="text-primary"
        />
        <h3 className="font-semibold text-sm sm:text-base text-foreground">
          {title || t("labels.account.address_info")}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-end gap-2 sm:col-span-1">
          <div className="flex-1">
            <AppInputText
              label={t("labels.account.zip_code")}
              value={data.zip_code || ""}
              onChange={handleCepChange}
              placeholder="00000-000"
              disabled={disabled || isSearchingCep}
            />
          </div>
          <AppButton
            type="button"
            color="background"
            onClick={() => handleCepLookup()}
            disabled={disabled || isSearchingCep}
            className="h-10 w-10 p-0! shrink-0"
            title={t("labels.account.search_cep")}
          >
            <SearchOutlined style={{ fontSize: 18 }} />
          </AppButton>
        </div>

        <div className="sm:col-span-2">
          <AppInputText
            label={t("labels.account.street")}
            value={data.street || ""}
            onChange={(e) =>
              onChange("street", String(e?.target?.value ?? ""))
            }
            placeholder={t("labels.account.street_placeholder")}
            disabled={disabled}
          />
        </div>

        <div>
          <AppInputText
            label={t("labels.account.number")}
            value={data.number || ""}
            onChange={(e) =>
              onChange("number", String(e?.target?.value ?? ""))
            }
            placeholder="123"
            disabled={disabled}
          />
        </div>

        <div>
          <AppInputText
            label={t("labels.account.complement")}
            value={data.complement || ""}
            onChange={(e) =>
              onChange("complement", String(e?.target?.value ?? ""))
            }
            placeholder={t("labels.account.complement_placeholder")}
            disabled={disabled}
          />
        </div>

        <div>
          <AppInputText
            label={t("labels.account.neighborhood")}
            value={data.neighborhood || ""}
            onChange={(e) =>
              onChange("neighborhood", String(e?.target?.value ?? ""))
            }
            placeholder={t("labels.account.neighborhood_placeholder")}
            disabled={disabled}
          />
        </div>

        <div className="sm:col-span-2">
          <AppInputText
            label={t("labels.account.city")}
            value={data.city || ""}
            onChange={(e) =>
              onChange("city", String(e?.target?.value ?? ""))
            }
            placeholder={t("labels.account.city_placeholder")}
            disabled={disabled}
          />
        </div>

        <div>
          <AppInputText
            label={t("labels.account.state")}
            value={data.state || ""}
            onChange={(e) =>
              onChange("state", String(e?.target?.value ?? ""))
            }
            placeholder="SP"
            maxLength={2}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
