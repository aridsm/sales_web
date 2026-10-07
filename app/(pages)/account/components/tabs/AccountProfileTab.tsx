"use client";

import React, { useState, useEffect } from "react";
import { User, UserBase } from "@/api/schemas/User";
import { usersService } from "@/api/services/UserService";
import { useDialogStore } from "@/stores/dialogStore";
import { useUserStore } from "@/stores/userStore";
import { useTranslation } from "@/app/utils/i18n";
import AppCard from "@/app/components/AppCard";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppImagePicker from "../AppImagePicker";
import AppAddressFields from "../AccountAddressFields";
import { usePermission } from "@/app/utils/usePermission";
import { getApiError } from "@/api/schemas";
import {
  PersonOutlined,
  SaveOutlined,
  AddPhotoAlternateOutlined,
} from "@mui/icons-material";

interface AccountProfileTabProps {
  currentUser: User | null;
  onUserUpdated: (user: User) => void;
}

export default function AccountProfileTab({
  currentUser,
  onUserUpdated,
}: AccountProfileTabProps) {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();
  const { isAdmin } = usePermission();

  const [formData, setFormData] = useState<UserBase>({
    name: "",
    email: "",
    phone: "",
    job_title: "",
    document: "",
    avatar_url: "",
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        job_title: currentUser.job_title || "",
        document: currentUser.document || "",
        avatar_url: currentUser.avatar_url || "",
        zip_code: currentUser.zip_code || "",
        street: currentUser.street || "",
        number: currentUser.number || "",
        complement: currentUser.complement || "",
        neighborhood: currentUser.neighborhood || "",
        city: currentUser.city || "",
        state: currentUser.state || "",
      });
      setAvatarFile(null);
    }
  }, [currentUser]);

  const handleChange = (field: keyof UserBase, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      openDialog({
        variant: "alert",
        message: t("labels.account.name_required"),
      });
      return;
    }

    try {
      setIsSaving(true);
      let updatedAvatarUrl = formData.avatar_url;

      if (avatarFile) {
        const uploadRes = await usersService.uploadAvatar(avatarFile);
        if (uploadRes?.avatar_url) {
          updatedAvatarUrl = uploadRes.avatar_url;
        }
      }

      const cleanAvatarUrl = updatedAvatarUrl
        ? updatedAvatarUrl.split("?")[0]
        : null;

      const payload: Partial<UserBase> = {
        name: formData.name?.trim() || "",
        email: formData.email?.trim() || "",
        phone: formData.phone?.trim() || null,
        job_title: formData.job_title?.trim() || null,
        document: formData.document?.trim() || null,
        avatar_url: cleanAvatarUrl,
        zip_code: formData.zip_code?.trim() || null,
        street: formData.street?.trim() || null,
        number: formData.number?.trim() || null,
        complement: formData.complement?.trim() || null,
        neighborhood: formData.neighborhood?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
      };

      const updatedUser = await usersService.updateMe(payload);

      const userToStore: User = {
        ...updatedUser,
        avatar_url: cleanAvatarUrl
          ? `${cleanAvatarUrl}?t=${Date.now()}`
          : null,
      };

      onUserUpdated(userToStore);
      useUserStore.getState().setCurrentUser(userToStore);

      openDialog({
        variant: "success",
        message: t("labels.account.profile_updated"),
      });
    } catch (err) {
      const { code } = getApiError(err);
      openDialog({
        variant: "error",
        message: code
          ? t(`errors.users.${code}`)
          : t("labels.account.profile_update_error"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <AppCard className="p-4 sm:p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AddPhotoAlternateOutlined
              style={{ fontSize: 18 }}
              className="text-primary"
            />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              {t("labels.account.profile_picture")}
            </h3>
          </div>
          <AppImagePicker
            currentImageUrl={formData.avatar_url}
            nameFallback={formData.name}
            variant="user"
            onChangeImage={(file) => setAvatarFile(file)}
            onRemoveImage={() => {
              setAvatarFile(null);
              setFormData((prev) => ({ ...prev, avatar_url: null }));
            }}
            disabled={isSaving}
          />
        </div>

        <div className="h-px bg-border w-full" />

        {/* Informações Pessoais */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PersonOutlined
              style={{ fontSize: 18 }}
              className="text-primary"
            />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              {t("labels.account.personal_info")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppInputText
              label={t("labels.account.user_name")}
              value={formData.name}
              onChange={(e) =>
                handleChange("name", String(e?.target?.value ?? ""))
              }
              placeholder={t("labels.account.user_name_placeholder")}
              required
              disabled={isSaving}
            />

            <AppInputText
              label={t("labels.account.user_email")}
              type="email"
              value={formData.email}
              onChange={(e) =>
                handleChange("email", String(e?.target?.value ?? ""))
              }
              placeholder="exemplo@email.com"
              disabled={isSaving}
            />

            <AppInputText
              label={t("labels.account.phone")}
              value={formData.phone || ""}
              onChange={(e) =>
                handleChange("phone", String(e?.target?.value ?? ""))
              }
              placeholder="(11) 99999-9999"
              disabled={isSaving}
            />

            <AppInputText
              label={t("labels.account.job_title")}
              value={formData.job_title || ""}
              onChange={(e) =>
                handleChange("job_title", String(e?.target?.value ?? ""))
              }
              placeholder={t("labels.account.job_title_placeholder")}
              disabled={isSaving || !isAdmin}
            />

            <AppInputText
              label={t("labels.account.document_cpf")}
              value={formData.document || ""}
              onChange={(e) =>
                handleChange("document", String(e?.target?.value ?? ""))
              }
              placeholder="000.000.000-00"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="h-px bg-border w-full" />

        {/* Endereço Residencial */}
        <AppAddressFields
          data={formData}
          onChange={(field, value) => handleChange(field as keyof UserBase, value)}
          onAddressFill={(filled) => setFormData((prev) => ({ ...prev, ...filled }))}
          disabled={isSaving}
          title={t("labels.account.address_info")}
        />

        <div className="h-px bg-border w-full" />

        <div className="flex items-center justify-end gap-3">
          <AppButton
            type="submit"
            color="primary"
            disabled={isSaving}
            className="gap-2 "
          >
            <SaveOutlined style={{ fontSize: 18 }} />
            <span>
              {isSaving
                ? t("labels.all.saving")
                : t("labels.account.save_changes")}
            </span>
          </AppButton>
        </div>
      </AppCard>
    </form>
  );
}
