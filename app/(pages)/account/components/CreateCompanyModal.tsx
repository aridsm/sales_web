import React, { useState, useEffect } from "react";
import AppModal from "../../../components/AppModal";
import AppInputText from "../../../components/inputs/AppInputText";
import AppButton from "../../../components/AppButton";
import { useTranslation } from "@/app/utils/i18n";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCompany: (companyName: string) => Promise<void>;
}

export default function CreateCompanyModal({
  isOpen,
  onClose,
  onCreateCompany,
}: CreateCompanyModalProps) {
  const { t } = useTranslation();
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNewCompanyName("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCompanyName.trim();
    if (!trimmed) return;

    try {
      setIsCreatingCompany(true);
      await onCreateCompany(trimmed);
      onClose();
    } catch {
      // Error handled in parent
    } finally {
      setIsCreatingCompany(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("labels.account.create_company")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
        <AppInputText
          label={t("labels.account.company_name")}
          placeholder={t("labels.account.company_name")}
          value={newCompanyName}
          onChange={(e) => setNewCompanyName((e.target.value as string) || "")}
          required
        />
        <div className="flex justify-end gap-3 mt-2 border-t border-border pt-3">
          <AppButton type="button" color="transparent" flat onClick={onClose}>
            {t("labels.all.cancel")}
          </AppButton>
          <AppButton
            type="submit"
            color="primary"
            disabled={isCreatingCompany}
          >
            {isCreatingCompany ? t("labels.all.saving") : t("labels.all.save")}
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
