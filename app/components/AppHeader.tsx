"use client";

import {
  NotificationsOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";

interface AppHeaderProps {
  title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-300 py-5 px-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <NotificationsOutlined />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <AccountCircleOutlined />
        </button>
      </div>
    </div>
  );
}
