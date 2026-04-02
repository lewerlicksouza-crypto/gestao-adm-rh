import { useState } from "react";
import { Users, Calendar, Home, LogOut } from "lucide-react";
import { Button } from "../components/Button";
import EmployeeManagement from "../components/EmployeeManagement";
import VacationManagement from "../components/VacationManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"home" | "employees" | "vacations">("home");

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-8">Admin</h1>

        <nav className="space-y-3">
          <button
            onClick={() => setActiveTab("home")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "home" ? "bg-blue-600" : "hover:bg-gray-800"
            }`}
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("employees")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "employees" ? "bg-blue-600" : "hover:bg-gray-800"
            }`}
          >
            <Users className="w-5 h-5" />
            Funcionários
          </button>

          <button
            onClick={() => setActiveTab("vacations")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "vacations" ? "bg-blue-600" : "hover:bg-gray-800"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Férias
          </button>
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <Button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === "home" && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo ao Painel Admin</h2>
            <p className="text-gray-600">
              Use o menu lateral para gerenciar funcionários e férias.
            </p>
          </div>
        )}

        {activeTab === "employees" && <EmployeeManagement />}
        {activeTab === "vacations" && <VacationManagement />}
      </div>
    </div>
  );
}
