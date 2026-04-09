import { useState } from "react";
import {
  Users,
  Calendar,
  Home,
  LogOut,
  FileText,
  ChevronDown,
  ChevronRight,
  Building2,
} from "lucide-react";
import { Button } from "../components/Button";
import EmployeeManagement from "../components/EmployeeManagement";
import VacationManagement from "../components/VacationManagement";
import ContractManagement from "../components/ContractManagement";

type ActiveTab =
  | "home"
  | "employees"
  | "vacations"
  | "contracts-conta"
  | "contracts-publi"
  | "contracts-idel";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [contractsMenuOpen, setContractsMenuOpen] = useState(true);

  const currentCompany =
    activeTab === "contracts-conta"
      ? "Conta Soluções"
      : activeTab === "contracts-publica"
        ? "Conta Publica"
        : activeTab === "contracts-idel"
          ? "Idel Soluções"
          : "";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-72 bg-[#031633] text-white p-6 shadow-lg flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Admin</h1>

        <nav className="space-y-3 flex-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
              activeTab === "home" ? "bg-blue-600" : "hover:bg-white/10"
            }`}
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("employees")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
              activeTab === "employees" ? "bg-blue-600" : "hover:bg-white/10"
            }`}
          >
            <Users className="w-5 h-5" />
            Funcionários
          </button>

          <button
            onClick={() => setActiveTab("vacations")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
              activeTab === "vacations" ? "bg-blue-600" : "hover:bg-white/10"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Férias
          </button>

          <div className="space-y-2">
            <button
              onClick={() => setContractsMenuOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-left ${
                activeTab.startsWith("contracts-") || contractsMenuOpen
                  ? "bg-white/10"
                  : "hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                Contratos
              </span>

              {contractsMenuOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {contractsMenuOpen && (
              <div className="ml-4 pl-4 border-l border-white/10 space-y-2">
                <button
                  onClick={() => setActiveTab("contracts-conta")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-left text-sm ${
                    activeTab === "contracts-conta"
                      ? "bg-blue-600 text-white"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Conta Soluções
                </button>

                <button
                  onClick={() => setActiveTab("contracts-publica")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-left text-sm ${
                    activeTab === "contracts-publi"
                      ? "bg-blue-600 text-white"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Conta Publi
                </button>

                <button
                  onClick={() => setActiveTab("contracts-idel")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-left text-sm ${
                    activeTab === "contracts-idel"
                      ? "bg-blue-600 text-white"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Idel
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="mt-8 pt-8 border-t border-white/10">
          <Button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8">
        {activeTab === "home" && (
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bem-vindo ao Painel Admin
            </h2>
            <p className="text-gray-600">
              Use o menu lateral para gerenciar funcionários, férias e contratos.
            </p>
          </div>
        )}

        {activeTab === "employees" && <EmployeeManagement />}
        {activeTab === "vacations" && <VacationManagement />}

        {(activeTab === "contracts-conta" ||
          activeTab === "contracts-publica" ||
          activeTab === "contracts-idel") && (
          <ContractManagement companyName={currentCompany} />
        )}
      </div>
    </div>
  );
}
