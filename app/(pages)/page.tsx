"use client";

import AppPage from "../components/AppPage";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SettingsOutlined } from "@mui/icons-material";
import AppCard from "../components/AppCard";
import { useTokenStore } from "@/stores/tokenStore";

const datePeriods = {
  today: {
    label: "Hoje",
    getDates: () => {
      const today = new Date();
      return {
        startDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        ),
        endDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
        ),
      };
    },
  },
  this_week: {
    label: "Esta semana",
    getDates: () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - dayOfWeek);
      sunday.setHours(0, 0, 0, 0);

      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      saturday.setHours(23, 59, 59, 999);

      return { startDate: sunday, endDate: saturday };
    },
  },
  this_month: {
    label: "Este mês",
    getDates: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      return { startDate: firstDay, endDate: lastDay };
    },
  },
  this_year: {
    label: "Este ano",
    getDates: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), 0, 1);
      const lastDay = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

      return { startDate: firstDay, endDate: lastDay };
    },
  },
};

export default function DashboardPage() {
  const token = useTokenStore((state) => state.token);
  const router = useRouter();

  const [activePeriod, setActivePeriod] = useState("today");
  const [activeDate, setActiveDate] = useState(datePeriods.today.getDates());
  const [budget, setBudget] = useState({
    balance: {
      value: 1234.56,
      label: "Saldo atual",
    },
    profit: {
      value: 789.01,
      label: "Lucro",
    },
    income: {
      value: 2000,
      label: "Receitas",
    },
    expenses: {
      value: 765.44,
      label: "Despesas",
    },
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token) {
    return <div>Redirecting to login...</div>;
  }

  const handlePeriodChange = (periodKey: string) => {
    setActivePeriod(periodKey);
    setActiveDate(
      datePeriods[periodKey as keyof typeof datePeriods].getDates(),
    );
  };

  return (
    <AppPage title="Dashboard">
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {Object.entries(datePeriods).map(([key, period]) => (
          <button
            key={key}
            onClick={() => handlePeriodChange(key)}
            className={`px-4 py-2 text-sm rounded-md border transition-all duration-200 cursor-pointer ${activePeriod === key
              ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
              : "bg-background-2 text-foreground border-border hover:border-border-2"
              }`}
          >
            {period.label}
          </button>
        ))}
        <button className="p-2 rounded-md border border-border bg-background-2 text-foreground cursor-pointer hover:text-primary hover:border-border-2 transition-all duration-200">
          <SettingsOutlined fontSize="small" />
        </button>
      </div>

      <div className="flex gap-5 w-full">
        {Object.entries(budget).map(([key, value]) => (
          <AppCard
            key={key}
            className={`flex-1 flex-col items-start justify-between gap-1 ${key === "balance"
              ? " bg-primary text-white border-transparent"
              : ""
              }`}
          >
            <span className={`${key === "balance" ? "text-white/80" : "text-label"}`}>
              {value.label}
            </span>
            <span className="text-2xl font-semibold">{`R$ ${value.value.toFixed(2)}`}</span>
          </AppCard>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-5 mt-5 flex-1 min-h-0 grid-dashboard">
        <AppCard className="col-span-5 row-span-2">
          <span className="font-semibold text-lg">Vendas por período</span>
        </AppCard>
        <AppCard className="col-span-3">
          <div className="flex justify-between font-semibold">
            <span className="text-lg">Meta de hoje</span>
            <span className="text-2xl">R$ 1.000,00</span>
          </div>
          <div className="w-full h-7 bg-background-3 dark:bg-foreground/10 rounded-md overflow-hidden mt-2">
            <div className="w-1/4 h-full bg-primary-2 rounded-md" />
          </div>
        </AppCard>

        <AppCard className="col-span-5 row-span-2">
          <span className="font-semibold text-lg">Histórico de Atividade</span>
        </AppCard>
        <AppCard className="col-span-3 row-span-3 col-start-6 row-start-2">
          <span className="font-semibold text-lg">Lucro por Categoria</span>
        </AppCard>
      </div>
    </AppPage>
  );
}
