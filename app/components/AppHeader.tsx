"use client";

import {
  NotificationsOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";
import AppLogo from "./AppLogo";

interface AppHeaderProps {
  title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-5">
      <div className="max-w-400 w-full flex items-center justify-between mx-auto px-6">

        <div className="flex items-center gap-3">
          <AppLogo />
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <NotificationsOutlined />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <AccountCircleOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
