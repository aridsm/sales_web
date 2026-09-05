import React, { useState, useEffect } from "react";
import AppModal from "../../../components/AppModal";
import AppInputText from "../../../components/inputs/AppInputText";
import AppButton from "../../../components/AppButton";
import { useTranslation } from "@/app/utils/i18n";
import { CompanyListItem } from "@/api/schemas/Company";

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyListItem | null;
  onUpdateCompany: (companyId: string, companyName: string) => Promise<void>;
}

export default function EditCompanyModal({
  isOpen,
  onClose,
  company,
  onUpdateCompany,
}: EditCompanyModalProps) {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && company) {
      setCompanyName(company.name || "");
    }
  }, [isOpen, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    const trimmed = companyName.trim();
    if (!trimmed) return;

    try {
      setIsUpdating(true);
      await onUpdateCompany(company.id, trimmed);
      onClose();
    } catch {
      // Error handled in parent
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("labels.account.edit_company")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
        <AppInputText
          label={t("labels.account.company_name")}
          placeholder={t("labels.account.company_name")}
          value={companyName}
          onChange={(e) => setCompanyName((e.target.value as string) || "")}
          required
        />
        <div className="flex justify-end gap-3 mt-2 border-t border-border pt-3">
          <AppButton type="button" color="transparent" flat onClick={onClose}>
            {t("labels.all.cancel")}
          </AppButton>
          <AppButton
            type="submit"
            color="primary-3"
            disabled={isUpdating}
          >
            {isUpdating ? t("labels.all.saving") : t("labels.all.save")}
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
