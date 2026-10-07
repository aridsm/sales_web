"use client";

import React, { useState, useEffect } from "react";
import AppButton from "@/app/components/AppButton";
import UserInitials from "./UserInitials";
import { CompanyUser, getApiError } from "@/api/schemas";
import { User } from "@/api/schemas/User";
import { companyService } from "@/api/services/CompanyService";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/app/utils/i18n";
import { formatDate } from "@/app/utils/formatters/date";
import {
  AdminPanelSettingsOutlined,
  ArrowBackOutlined,
  EmailOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  CalendarTodayOutlined,
  BadgeOutlined,
  WorkOutlineOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PersonOutlined,
} from "@mui/icons-material";

interface CompanyMemberDetailsProps {
  member: CompanyUser;
  currentUser: User | null;
  isAdmin?: boolean;
  onMemberUpdated?: (member: CompanyUser) => void;
  onBack: () => void;
}

export default function CompanyMemberDetails({
  member,
  currentUser,
  isAdmin = false,
  onMemberUpdated,
  onBack,
}: CompanyMemberDetailsProps) {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();

  const [currentMember, setCurrentMember] = useState<CompanyUser>(member);
  const [isEditingJobTitle, setIsEditingJobTitle] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState(
    member.user_job_title || "",
  );
  const [isSavingJobTitle, setIsSavingJobTitle] = useState(false);

  useEffect(() => {
    setCurrentMember(member);
    setJobTitleInput(member.user_job_title || "");
    setIsEditingJobTitle(false);
  }, [member]);

  const handleSaveJobTitle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSavingJobTitle(true);
      const updated = await companyService.updateMemberJobTitle(
        currentMember.company_id,
        currentMember.user_id,
        jobTitleInput.trim() || null,
      );
      const merged: CompanyUser = {
        ...currentMember,
        user_job_title: jobTitleInput.trim() || null,
        ...(updated && typeof updated === "object" ? updated : {}),
      };
      setCurrentMember(merged);
      onMemberUpdated?.(merged);
      setIsEditingJobTitle(false);
      openDialog({
        variant: "success",
        message: t("labels.account.job_title_updated"),
      });
    } catch (err) {
      const { code } = getApiError(err);
      openDialog({
        variant: "error",
        message: code
          ? t(`errors.companies.${code}`)
          : t("labels.account.job_title_update_error"),
      });
    } finally {
      setIsSavingJobTitle(false);
    }
  };

  const isMe = currentMember.user_id === currentUser?.id;
  const displayName =
    currentMember.user_name || currentMember.user_email || "N/A";
  const avatarUrl =
    currentMember.user_avatar_url ||
    (isMe ? currentUser?.avatar_url : undefined);

  const hasAddress = Boolean(
    currentMember.user_street ||
    currentMember.user_city ||
    currentMember.user_zip_code,
  );

  return (
    <div className="flex flex-col animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-2 min-w-0">
          <PersonOutlined
            style={{ fontSize: 18 }}
            className="text-primary shrink-0"
          />
          <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
            {t("labels.account.member_details")}
          </h3>
        </div>

        <AppButton
          type="button"
          color="foreground"
          flat
          onClick={onBack}
          className="gap-1.5 px-2! shrink-0"
          title={t("labels.all.back")}
        >
          <ArrowBackOutlined style={{ fontSize: 16 }} />
          <span>{t("labels.all.back")}</span>
        </AppButton>
      </div>

      <div className="h-px bg-border w-full" />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center text-center gap-2 px-4 pt-4">
          <UserInitials
            name={displayName}
            imageUrl={avatarUrl}
            size="lg"
            className="w-16 h-16 sm:w-18 sm:h-18 text-xl font-bold shadow-xs shrink-0"
          />

          <div className="flex flex-col items-center gap-1 min-w-0 w-full">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-base font-semibold text-foreground">
                {currentMember.user_name || currentMember.user_email}
              </span>
              {isMe && (
                <span className="px-1.5 py-0.2 rounded-xs bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-500 text-xs font-semibold shrink-0">
                  {t("labels.account.you")}
                </span>
              )}
            </div>

            {isEditingJobTitle ? (
              <form
                onSubmit={handleSaveJobTitle}
                className="flex items-center justify-center gap-1.5 mt-1"
              >
                <input
                  type="text"
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                  placeholder={t("labels.account.job_title_placeholder")}
                  className="text-xs px-2 py-1 rounded-xs border border-border bg-background text-foreground focus:outline-hidden focus:border-primary w-36 sm:w-44"
                  autoFocus
                  disabled={isSavingJobTitle}
                />
                <AppButton
                  type="submit"
                  color="primary"
                  flat
                  disabled={isSavingJobTitle}
                  className="w-7 h-7 p-0! flex items-center justify-center text-primary!"
                  title={t("labels.all.save")}
                >
                  <CheckOutlined style={{ fontSize: 14 }} />
                </AppButton>
                <AppButton
                  type="button"
                  color="transparent"
                  flat
                  disabled={isSavingJobTitle}
                  onClick={() => {
                    setIsEditingJobTitle(false);
                    setJobTitleInput(currentMember.user_job_title || "");
                  }}
                  className="w-7 h-7 p-0! flex items-center justify-center text-label hover:text-foreground"
                  title={t("labels.all.cancel")}
                >
                  <CloseOutlined style={{ fontSize: 14 }} />
                </AppButton>
              </form>
            ) : isAdmin ? (
              <div className="flex items-center justify-center gap-1 text-label font-medium text-xs sm:text-sm">
                <WorkOutlineOutlined
                  style={{ fontSize: 14 }}
                  className="opacity-70 shrink-0"
                />
                <span
                  className={
                    currentMember.user_job_title
                      ? "text-label"
                      : "text-label/60 italic"
                  }
                >
                  {currentMember.user_job_title || t("labels.all.not_defined")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setJobTitleInput(currentMember.user_job_title || "");
                    setIsEditingJobTitle(true);
                  }}
                  className="p-1 rounded-xs text-label hover:text-primary transition-colors cursor-pointer ml-0.5"
                  title={t("labels.all.edit")}
                >
                  <EditOutlined style={{ fontSize: 13 }} />
                </button>
              </div>
            ) : currentMember.user_job_title ? (
              <span className="text-label font-medium flex items-center gap-1 text-xs sm:text-sm">
                <WorkOutlineOutlined
                  style={{ fontSize: 14 }}
                  className="opacity-70 shrink-0"
                />
                <span>{currentMember.user_job_title}</span>
              </span>
            ) : null}

            <span
              className={`text-xs font-medium px-2.5 py-0.5 mt-1 rounded-xs flex items-center gap-1 ${
                currentMember.permission === 3
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : currentMember.permission === 2
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
              }`}
            >
              {currentMember.permission === 3 && (
                <AdminPanelSettingsOutlined style={{ fontSize: 13 }} />
              )}
              <span>
                {t(`labels.account.permissions.${currentMember.permission}`)}
              </span>
            </span>
          </div>
        </div>

        <div className="h-px bg-border w-full" />

        <div className="flex flex-col gap-5 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4">
          {currentMember.user_email && (
            <div className="flex items-start gap-2.5 min-w-0">
              <EmailOutlined
                style={{ fontSize: 16 }}
                className="text-primary shrink-0 mt-0.5"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-label text-sm">
                  {t("labels.all.email")}
                </span>
                <span className="font-medium text-foreground truncate select-all">
                  {currentMember.user_email}
                </span>
              </div>
            </div>
          )}

          {currentMember.user_phone && (
            <div className="flex items-start gap-2.5 min-w-0">
              <PhoneOutlined
                style={{ fontSize: 16 }}
                className="text-primary shrink-0 mt-0.5"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-label text-sm">
                  {t("labels.account.phone")}
                </span>
                <span className="font-medium text-foreground select-all">
                  {currentMember.user_phone}
                </span>
              </div>
            </div>
          )}

          {currentMember.user_document && (
            <div className="flex items-start gap-2.5 min-w-0">
              <BadgeOutlined
                style={{ fontSize: 16 }}
                className="text-primary shrink-0 mt-0.5"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-label text-sm">
                  {t("labels.account.document_cpf")}
                </span>
                <span className="font-medium text-foreground select-all">
                  {currentMember.user_document}
                </span>
              </div>
            </div>
          )}

          {hasAddress && (
            <div className="flex items-start gap-2.5 min-w-0">
              <LocationOnOutlined
                style={{ fontSize: 16 }}
                className="text-primary shrink-0 mt-0.5"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-label text-sm">
                  {t("labels.account.address_info")}
                </span>
                <span className="font-medium text-foreground">
                  {[
                    currentMember.user_street,
                    currentMember.user_number,
                    currentMember.user_complement,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                {(currentMember.user_neighborhood ||
                  currentMember.user_city ||
                  currentMember.user_state) && (
                  <span className="font-medium text-foreground">
                    {[
                      currentMember.user_neighborhood,
                      currentMember.user_city
                        ? `${currentMember.user_city}${currentMember.user_state ? ` - ${currentMember.user_state}` : ""}`
                        : currentMember.user_state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                {currentMember.user_zip_code && (
                  <span className="font-medium text-foreground">
                    CEP: {currentMember.user_zip_code}
                  </span>
                )}
              </div>
            </div>
          )}

          {currentMember.created_at && (
            <div className="flex items-start gap-2.5 min-w-0">
              <CalendarTodayOutlined
                style={{ fontSize: 16 }}
                className="text-primary shrink-0 mt-0.5"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-label text-sm">
                  {t("labels.account.member_since")}
                </span>
                <span className="font-medium text-foreground">
                  {formatDate(currentMember.created_at)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
