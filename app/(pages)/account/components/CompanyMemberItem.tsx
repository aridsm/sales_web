"use client";

import UserInitials from "./UserInitials";
import { CompanyUser } from "@/api/schemas/Company";
import { User } from "@/api/schemas/User";
import { useTranslation } from "@/app/utils/i18n";
import { AdminPanelSettingsOutlined } from "@mui/icons-material";

interface CompanyMemberItemProps {
  member: CompanyUser;
  currentUser: User | null;
  onSelect: (member: CompanyUser) => void;
}

export default function CompanyMemberItem({
  member,
  currentUser,
  onSelect,
}: CompanyMemberItemProps) {
  const { t } = useTranslation();
  const isMe = member.user_id === currentUser?.id;
  const displayName = member.user_name || member.user_email || "N/A";
  const avatarUrl =
    member.user_avatar_url || (isMe ? currentUser?.avatar_url : undefined);
  const jobTitle = member.user_job_title;

  return (
    <div
      role="button"
      onClick={() => onSelect(member)}
      className="flex items-center justify-between p-4 rounded-xs hover:bg-foreground/5 active:bg-foreground/10 transition-colors cursor-pointer gap-2 w-full min-w-0"
      title={displayName}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <UserInitials
          name={displayName}
          imageUrl={avatarUrl}
          size="md"
          className="w-10 h-10 sm:w-11 sm:h-11 sm:text-sm font-semibold shrink-0"
        />

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="sm:text-sm font-semibold text-foreground truncate">
              {member.user_name || member.user_email}
            </span>
            {isMe && (
              <span className="px-1.5 py-0.2 rounded-xs bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-500 text-xs font-semibold shrink-0">
                {t("labels.account.you")}
              </span>
            )}
          </div>
          {jobTitle ? (
            <span className="text-label truncate">{jobTitle}</span>
          ) : member.user_name && member.user_email ? (
            <span className="text-label truncate">{member.user_email}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span
          className={`font-medium px-2 py-0.5 rounded-xs text-[11px] md:text-xs flex items-center gap-1 ${
            member.permission === 3
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : member.permission === 2
                ? "bg-primary/10 text-primary"
                : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
          }`}
        >
          {member.permission === 3 && (
            <AdminPanelSettingsOutlined style={{ fontSize: 13 }} />
          )}
          <span>{t(`labels.account.permissions.${member.permission}`)}</span>
        </span>
      </div>
    </div>
  );
}
