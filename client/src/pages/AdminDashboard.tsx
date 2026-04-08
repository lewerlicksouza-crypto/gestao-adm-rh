import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  LogOut,
  CheckCircle,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import EmployeeManagement from "../components/EmployeeManagement";
import VacationManagement from "../components/VacationManagement";
import ContractManagement from "../components/ContractManagement";

type Employee = {
  id: number;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  admissionDate: string;
  status: "Ativo" | "Inativo";
  notes: string;
};

type VacationPeriod = {
  id: number;
  employeeId: number;
  periodNumber: number;
  start: string;
  end: string;
  totalDays: number;
  grantedUntil: string;
};

type VacationRecord = {
  id: number;
  employeeId: number;
  periodId: number;
  startDate: string;
  endDate: string;
  vacationDays: number;
  bonusDays: number;
  status: "Programado" | "Aprovada" | "Rejeitada" | "Pendente";
  notes: string;
};

type Section = "dashboard" | "employees" | "vacations" | "contracts";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const [vacations, setVacations] = useState<VacationRecord[]>([]);

  const stats = useMemo(() => {
    const today = new Date();

    const approvedCount = vacations.filter(
      (vacation) => vacation.status === "Aprovada",
    ).length;

    const scheduledCount = vacations.filter(
      (vacation) => vacation.status === "Programado",
    ).length;

    const pendingCount = vacations.filter(
      (vacation) => vacation.status === "Pendente",
    ).length;

    const expiringCount = vacationPeriods.filter((period) => {
      const grantedUntil = new Date(period.grantedUntil);
      const diffInMs = grantedUntil.getTime() - today.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      return diffInDays >= 0 && diffInDays <= 60;
    }).length;

    return {
      employees: employees.length,
      approved: approvedCount,
      scheduled: scheduledCount,
      expiring: expiringCount,
      pending: pendingCount,
    };
  }, [employees, vacationPeriods, vacations]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-72 bg-[#06122b] text-white flex flex-col">
        <div className="px-7 py-8">
          <h1 className="text-4xl font-bold">Admin</h1>
        </div>

        <nav className="px-4 flex-1 space-y-3">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`w-full flex items-center gap-3 rounded-xl px-5 py-4 text-left text-2xl transition ${
              activeSection === "dashboard"
                ? "bg-blue-600 text-white"
                : "text-white hover:bg-white/10"
            }`}
          >
            <LayoutDashboard size={26} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveSection("employees")}
            className={`w-full flex items-center gap-3 rounded-xl px-5 py-4 text-left text-2xl transition ${
              activeSection === "employees"
                ? "bg-blue-600 text-white"
                : "text-white hover:bg-white/10"
            }`}
          >
            <Users size={26} />
            Funcionários
          </button>

          <button
            onClick={() => setActiveSection("vacations")}
            className={`w-full flex items-center gap-3 rounded-xl px-5 py-4 text-left text-2xl transition ${
              activeSection === "vacations"
                ? "bg-blue-600 text-white"
                : "text-white hover:bg-white/10"
            }`}
          >
            <Calendar size={26} />
            Férias
          </button>

          <button
            onClick={() => setActiveSection("contracts")}
            className={`w-full flex items-center gap-3 rounded-xl px-5 py-4 text-left text-2xl transition ${
              activeSection === "contracts"
                ? "bg-blue-600 text-white"
                : "text-white hover:bg-white/10"
            }`}
          >
            <FileText size={26} />
            Contratos
          </button>

          <div className="pt-8">
            <div className="border-t border-white/20" />
          </div>
        </nav>

        <div className="p-6">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl px-5 py-4 text-2xl flex items-center justify-center gap-3 transition">
            <LogOut size={24} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-9">
        {activeSection === "dashboard" && (
          <div className="space-y-8">
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-5xl font-bold text-slate-900 mb-4">
                Bem-vindo ao Painel Admin
              </h2>
              <p className="text-3xl text-slate-600">
                Acompanhe os principais indicadores de funcionários e férias.
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-blue-600 flex items-center justify-between">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">Funcionários</p>
                  <p className="text-6xl font-bold text-slate-900">
                    {stats.employees}
                  </p>
                </div>
                <Users size={52} className="text-blue-600" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-green-600 flex items-center justify-between">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">Concedidas</p>
                  <p className="text-6xl font-bold text-slate-900">
                    {stats.approved}
                  </p>
                </div>
                <CheckCircle size={52} className="text-green-600" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-sky-500 flex items-center justify-between">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">Programadas</p>
                  <p className="text-6xl font-bold text-slate-900">
                    {stats.scheduled}
                  </p>
                </div>
                <Calendar size={52} className="text-sky-500" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-amber-500 flex items-center justify-between">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">A vencer</p>
                  <p className="text-6xl font-bold text-slate-900">
                    {stats.expiring}
                  </p>
                </div>
                <Clock3 size={52} className="text-amber-500" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-red-600 flex items-center justify-between md:col-span-1">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">Pendentes</p>
                  <p className="text-6xl font-bold text-slate-900">
                    {stats.pending}
                  </p>
                </div>
                <AlertTriangle size={52} className="text-red-600" />
              </div>
            </section>
          </div>
        )}

        {activeSection === "employees" && (
          <EmployeeManagement onEmployeesChange={setEmployees} />
        )}

        {activeSection === "vacations" && (
          <VacationManagement
            employees={employees}
            onVacationPeriodsChange={setVacationPeriods}
            onVacationsChange={setVacations}
          />
        )}

        {activeSection === "contracts" && <ContractManagement />}
      </main>
    </div>
  );
}
