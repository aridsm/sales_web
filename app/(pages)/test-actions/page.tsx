"use client";

import AppActions, { ActionItem } from "@/app/components/AppActions";
import { Edit, Delete, Visibility, Block } from "@mui/icons-material";
import AppCard from "@/app/components/AppCard";
import AppPage from "@/app/components/AppPage";

interface User {
  id: number;
  name: string;
  role: string;
  status: "active" | "inactive";
}

export default function TestActionsPage() {
  const user: User = {
    id: 1,
    name: "João Silva",
    role: "Administrador",
    status: "active",
  };

  const actions: ActionItem<User>[] = [
    {
      text: "Visualizar",
      preText: <Visibility fontSize="inherit" />,
      click: (u) => alert(`Visualizando ${u.name}`),
    },
    {
      text: "Editar",
      preText: <Edit fontSize="inherit" />,
      click: (u) => alert(`Editando ${u.name}`),
    },
    {
      text: "Inativar",
      preText: <Block fontSize="inherit" />,
      click: (u) => alert(`Inativando ${u.name}`),
      disabled: (u) => u.status === "inactive",
    },
    {
      text: "Excluir",
      preText: <Delete fontSize="inherit" />,
      click: (u) => alert(`Excluindo ${u.name}`),
      class: "text-red-600 hover:bg-red-50!",
    },
  ];

  return (
    <AppPage title="Teste de Ações">
      <div className="max-w-md mx-auto mt-10">
        <AppCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.role}</p>
            </div>
            <AppActions item={user} actions={actions} />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Ações na Tabela (Exemplo)</span>
            <AppActions item={user} actions={actions} />
          </div>
        </AppCard>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded text-blue-800 text-sm">
          <p><strong>Nota:</strong> Clique nos botões de 3 pontos para abrir o menu de ações.</p>
        </div>
      </div>
    </AppPage>
  );
}
