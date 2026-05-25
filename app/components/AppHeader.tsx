"use client";

import {
  NotificationsOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";
import AppButton from "./AppButton";
import AppDarkModeToggle from "./AppDarkModeToggle";

interface AppHeaderProps {
  title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 transition-colors bg-background-2 dark:bg-background">
      <div className="max-w-400 w-full flex items-center justify-between mx-auto px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground transition-colors">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <AppDarkModeToggle />
          <AppButton
            rounded
            flat
            color="transparent"
            className="w-9 h-9 text-foreground hover:text-foreground"
          >
            <NotificationsOutlined fontSize="small" />
          </AppButton>
          <AppButton
            rounded
            flat
            color="transparent"
            className="w-9 h-9 text-foreground hover:text-foreground"
          >
            <AccountCircleOutlined fontSize="small" />
          </AppButton>
        </div>
      </div>
    </div>
  );
}
