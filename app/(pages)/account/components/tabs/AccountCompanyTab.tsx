"use client";

import React, { useState, useEffect } from "react";
import { Company, CompanyListItem, getApiError } from "@/api/schemas";
import { User } from "@/api/schemas/User";
import { companyService } from "@/api/services/CompanyService";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/app/utils/i18n";
import AppCard from "@/app/components/AppCard";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppImagePicker from "../AppImagePicker";
import CompanyMembersSidebar from "../CompanyMembersSidebar";
import AppAddressFields, { AddressData } from "../AccountAddressFields";
import { CompanyPermission } from "@/enums/CompanyPermission";
import {
  BusinessOutlined,
  SaveOutlined,
  LockOutlined,
  AddPhotoAlternateOutlined,
  ExitToAppOutlined,
} from "@mui/icons-material";
import { useUserStore } from "@/stores/userStore";

interface AccountCompanyTabProps {
  activeCompany: CompanyListItem | null | undefined;
  currentUser: User | null;
  membersRefreshKey?: number;
  onOpenMembers: (company: CompanyListItem) => void;
  onCompanyUpdated: () => void;
}

export default function AccountCompanyTab({
  activeCompany,
  currentUser,
  membersRefreshKey,
  onOpenMembers,
  onCompanyUpdated,
}: AccountCompanyTabProps) {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();

  const [formData, setFormData] = useState<Partial<Company>>({
    name: "",
    logo_url: "",
    document: "",
    email: "",
    phone: "",
    website: "",
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = currentUser?.permission === CompanyPermission.ADMIN;

  useEffect(() => {
    if (!activeCompany?.id) return;

    let isMounted = true;
    setIsLoading(true);

    companyService
      .getById(activeCompany.id)
      .then((res) => {
        if (!isMounted) return;
        setFormData({
          name: res.name || "",
          logo_url: res.logo_url || "",
          document: res.document || "",
          email: res.email || "",
          phone: res.phone || "",
          website: res.website || "",
          zip_code: res.zip_code || "",
          street: res.street || "",
          number: res.number || "",
          complement: res.complement || "",
          neighborhood: res.neighborhood || "",
          city: res.city || "",
          state: res.state || "",
        });
        setLogoFile(null);
      })
      .catch(() => {
        // Fallback para dados parciais da listagem
        if (!isMounted) return;
        setFormData({
          name: activeCompany.name || "",
          logo_url: activeCompany.logo_url || "",
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCompany]);

  const handleChange = (field: keyof Company, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany?.id) return;

    if (!isAdmin) {
      openDialog({
        variant: "alert",
        message: t("labels.account.admin_only_company_edit"),
      });
      return;
    }

    if (!formData.name?.trim()) {
      openDialog({
        variant: "alert",
        message: t("labels.account.company_name_required"),
      });
      return;
    }

    try {
      setIsSaving(true);
      let updatedLogoUrl = formData.logo_url;

      if (logoFile) {
        const uploadRes = await companyService.uploadLogo(
          activeCompany.id,
          logoFile,
        );
        if (uploadRes?.logo_url) {
          updatedLogoUrl = uploadRes.logo_url;
        }
      }

      const cleanLogoUrl = updatedLogoUrl ? updatedLogoUrl.split("?")[0] : null;

      const payload: Record<string, any> = {
        name: formData.name?.trim() || "",
      };
      if (formData.document?.trim())
        payload.document = formData.document.trim();
      if (formData.email?.trim()) payload.email = formData.email.trim();
      if (formData.phone?.trim()) payload.phone = formData.phone.trim();
      if (formData.website?.trim()) payload.website = formData.website.trim();
      if (formData.zip_code?.trim())
        payload.zip_code = formData.zip_code.trim();
      if (formData.street?.trim()) payload.street = formData.street.trim();
      if (formData.number?.trim()) payload.number = formData.number.trim();
      if (formData.complement?.trim())
        payload.complement = formData.complement.trim();
      if (formData.neighborhood?.trim())
        payload.neighborhood = formData.neighborhood.trim();
      if (formData.city?.trim()) payload.city = formData.city.trim();
      if (formData.state?.trim()) payload.state = formData.state.trim();

      try {
        await companyService.update(activeCompany.id, payload);
      } catch (patchErr) {
        if (Object.keys(payload).length > 1) {
          await companyService.update(activeCompany.id, { name: payload.name });
        } else {
          throw patchErr;
        }
      }

      const logoWithCacheBuster = cleanLogoUrl
        ? `${cleanLogoUrl}?t=${Date.now()}`
        : null;

      const currentCompanies = useUserStore.getState().companies;
      useUserStore.getState().setCompanies(
        currentCompanies.map((c: CompanyListItem) =>
          c.id === activeCompany.id
            ? { ...c, ...formData, logo_url: logoWithCacheBuster }
            : c,
        ),
      );

      openDialog({
        variant: "success",
        message: t("labels.account.company_updated"),
      });

      onCompanyUpdated();
    } catch (err: any) {
      const { code } = getApiError(err);
      const detail = err?.response?.data?.detail;
      const apiMsg =
        typeof detail === "string" ? detail : err?.response?.data?.message;
      openDialog({
        variant: "error",
        message:
          apiMsg ||
          (code
            ? t(`errors.companies.${code}`)
            : t("labels.account.company_update_error")),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaveCompany = () => {
    if (!activeCompany || !currentUser) return;
    openDialog({
      variant: "confirm",
      title: t("labels.all.exit"),
      message: t("labels.account.leave_company_confirm", {
        name: activeCompany.name,
      }),
      confirmLabel: t("labels.all.exit"),
      onConfirm: async () => {
        try {
          await companyService.removeMeFromCompany(activeCompany.id);
          openDialog({
            variant: "success",
            message: t("labels.account.left_company"),
          });
          window.location.reload();
        } catch (err) {
          const { code } = getApiError(err);
          openDialog({
            variant: "error",
            message: code
              ? t(`errors.companies.${code}`)
              : t("labels.account.left_company_error"),
          });
        }
      },
    });
  };

  if (!activeCompany) {
    return (
      <AppCard className="p-8 flex flex-col items-center justify-center text-center gap-3">
        <BusinessOutlined
          style={{ fontSize: 40 }}
          className="text-label opacity-40"
        />
        <p className="text-label max-w-sm">
          {t("labels.account.no_active_company")}
        </p>
      </AppCard>
    );
  }

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.65fr)_minmax(270px,0.95fr)] gap-3 md:gap-5 w-full items-start">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        <AppCard className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-base md:text-lg text-foreground truncate">
                  {activeCompany.name}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-xs bg-primary/8 text-primary-3 shrink-0">
                  {t(`labels.account.permissions.${currentUser?.permission}`)}
                </span>
              </div>
              <span className="mt-2 text-label">
                {isAdmin
                  ? t("labels.account.admin_permissions_hint")
                  : t("labels.account.read_only_permissions_hint")}
              </span>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <AddPhotoAlternateOutlined
                style={{ fontSize: 18 }}
                className="text-primary-3"
              />
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                {t("labels.account.company_logo")}
              </h3>
            </div>
            <AppImagePicker
              currentImageUrl={formData.logo_url}
              nameFallback={formData.name || activeCompany.name}
              variant="company"
              onChangeImage={(file) => setLogoFile(file)}
              onRemoveImage={() => {
                setLogoFile(null);
                setFormData((prev) => ({ ...prev, logo_url: null }));
              }}
              disabled={!isAdmin || isSaving || isLoading}
            />
          </div>

          <div className="h-px bg-border w-full" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <BusinessOutlined
                style={{ fontSize: 18 }}
                className="text-primary-3"
              />
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                {t("labels.account.company_info")}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AppInputText
                label={t("labels.account.company_name")}
                value={formData.name || ""}
                onChange={(e) =>
                  handleChange("name", String(e?.target?.value ?? ""))
                }
                placeholder={t("labels.account.company_name_placeholder")}
                required
                disabled={!isAdmin || isSaving || isLoading}
              />

              <AppInputText
                label={t("labels.account.document_cnpj")}
                value={formData.document || ""}
                onChange={(e) =>
                  handleChange("document", String(e?.target?.value ?? ""))
                }
                placeholder="00.000.000/0000-00"
                disabled={!isAdmin || isSaving || isLoading}
              />

              <AppInputText
                label={t("labels.account.company_email")}
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  handleChange("email", String(e?.target?.value ?? ""))
                }
                placeholder="contato@empresa.com"
                disabled={!isAdmin || isSaving || isLoading}
              />

              <AppInputText
                label={t("labels.account.company_phone")}
                value={formData.phone || ""}
                onChange={(e) =>
                  handleChange("phone", String(e?.target?.value ?? ""))
                }
                placeholder="(11) 3333-4444"
                disabled={!isAdmin || isSaving || isLoading}
              />

              <div className="sm:col-span-2">
                <AppInputText
                  label={t("labels.account.company_website")}
                  value={formData.website || ""}
                  onChange={(e) =>
                    handleChange("website", String(e?.target?.value ?? ""))
                  }
                  placeholder="https://empresa.com.br"
                  disabled={!isAdmin || isSaving || isLoading}
                />
              </div>
            </div>
          </div>

        <div className="h-px bg-border w-full" />

        <AppAddressFields
          data={formData as AddressData}
          onChange={(field, value) => handleChange(field as keyof Company, value)}
          onAddressFill={(filled) => setFormData((prev) => ({ ...prev, ...filled }))}
          disabled={!isAdmin || isSaving || isLoading}
          title={t("labels.account.company_address")}
        />

          {isAdmin && (
            <>
              <div className="h-px bg-border w-full" />
              <div className="flex items-center justify-end gap-3">
                <AppButton
                  type="submit"
                  color="primary-3"
                  disabled={isSaving || isLoading}
                  className="gap-2 px-5 min-w-[160px]"
                >
                  <SaveOutlined style={{ fontSize: 18 }} />
                  <span>
                    {isSaving
                      ? t("labels.all.saving")
                      : t("labels.account.save_company")}
                  </span>
                </AppButton>
              </div>
            </>
          )}

          {!isAdmin && (
            <div className="flex items-center gap-2 p-3 rounded-xs bg-background-3 text-xs text-label">
              <LockOutlined style={{ fontSize: 16 }} />
              <span>{t("labels.account.admin_only_notice")}</span>
            </div>
          )}
        </AppCard>
      </form>

      <div className="flex flex-col gap-3 md:gap-5 w-full">
        <CompanyMembersSidebar
          company={activeCompany}
          currentUser={currentUser}
          refreshKey={membersRefreshKey}
          onOpenManageModal={onOpenMembers}
        />

        {currentUser && activeCompany && (
          <AppCard className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-base text-foreground">
                {t("labels.account.leave_company")}
              </span>
              <span className=" text-label">
                {t("labels.account.leave_company_description")}
              </span>
            </div>

            <AppButton
              color="red"
              className="gap-1.5 shrink-0 self-start sm:self-center"
              onClick={handleLeaveCompany}
              size="small"
              title={t("labels.account.leave_company")}
            >
              <ExitToAppOutlined style={{ fontSize: 16 }} />
              {t("labels.account.leave_company")}
            </AppButton>
          </AppCard>
        )}
      </div>
    </div>
  );
}
