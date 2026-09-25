"use client";

import React, { useRef, useState } from "react";
import AppButton from "@/app/components/AppButton";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  BusinessOutlined,
} from "@mui/icons-material";
import { getImageUrl } from "@/app/utils/image";
import UserInitials from "./UserInitials";
import AppImageCropperModal from "./AppImageCropperModal";
import { useTranslation } from "@/app/utils/i18n";

interface AppImagePickerProps {
  currentImageUrl?: string | null;
  nameFallback?: string;
  variant?: "user" | "company";
  onChangeImage: (file: File) => void;
  onRemoveImage?: () => void;
  disabled?: boolean;
  isUploading?: boolean;
  className?: string;
}

export default function AppImagePicker({
  currentImageUrl,
  nameFallback = "",
  variant = "user",
  onChangeImage,
  onRemoveImage,
  disabled = false,
  isUploading = false,
  className = "",
}: AppImagePickerProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCropFile(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    const objectUrl = URL.createObjectURL(croppedFile);
    setPreviewUrl(objectUrl);
    onChangeImage(croppedFile);
    setCropFile(null);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemoveImage?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const activeUrl = previewUrl || getImageUrl(currentImageUrl);
  const hasImage = Boolean(activeUrl);

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      <div className="relative shrink-0">
        {variant === "user" ? (
          activeUrl ? (
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-border bg-background-3 shadow-xs">
              <img
                src={activeUrl}
                alt={nameFallback || "Avatar"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <UserInitials
              name={nameFallback || "U"}
              size="lg"
              variant="primary-soft"
              className="w-20 h-20 sm:w-22 sm:h-22 text-2xl font-bold"
            />
          )
        ) : activeUrl ? (
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xs overflow-hidden border-2 border-border bg-background-3 shadow-xs flex items-center justify-center p-1">
            <img
              src={activeUrl}
              alt={nameFallback || "Company Logo"}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xs border-2 border-dashed border-border bg-background dark:bg-background-3/50 flex flex-col items-center justify-center text-label gap-1">
            <BusinessOutlined style={{ fontSize: 28 }} className="opacity-60" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <AppButton
            type="button"
            color="primary"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="gap-1.5"
          >
            <CloudUploadOutlined style={{ fontSize: 16 }} />
            <span>
              {isUploading
                ? t("labels.account.uploading_image")
                : hasImage
                  ? t("labels.account.change_image")
                  : t("labels.account.upload_image")}
            </span>
          </AppButton>

          {hasImage && onRemoveImage && (
            <AppButton
              type="button"
              color="transparent"
              size="small"
              flat
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="text-red-500! hover:bg-red-500/10! gap-1.5"
            >
              <DeleteOutlined style={{ fontSize: 16 }} />
              <span>{t("labels.account.remove_image")}</span>
            </AppButton>
          )}
        </div>

        <span className="text-xs text-label">
          {t("labels.account.image_hint")}
        </span>
      </div>

      <AppImageCropperModal
        isOpen={Boolean(cropFile)}
        imageFile={cropFile}
        variant={variant}
        onClose={() => setCropFile(null)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
