import { useMemo, useState } from "react";
import {
  Users,
  Calendar,
  Home,
  LogOut,
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/Button";
import EmployeeManagement from "../components/EmployeeManagement";
import VacationManagement from "../components/VacationManagement";
import { trpc } from "@/lib/trpc";

type DashboardTab = "home" | "employees" | "vacations";

function formatDate(date: string) {
  if (!date) return "-";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function diffInDays(fromDate: Date, toDate: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
  );
  const utc2 = Date.UTC(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate(),
  );
  return Math.floor((utc2 - utc1) / msPerDay);
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");

  const { data: employees = [], isLoading: employeesLoading } =
    trpc.employees.list.useQuery();

  const { data: periods = [], isLoading: periodsLoading } =
    trpc.vacationPeriods.list.useQuery();

  const { data: vacations = [], isLoading: vacationsLoading } =
    trpc.vacations.list.useQuery();

  const isLoading = employeesLoading || periodsLoading || vacationsLoading;

  const dashboardData = useMemo(() => {
    const today = new Date();

    const periodSummaries = periods.map((period) => {
      const employee = employees.find((item) => item.id === period.employeeId);

      const usedDays = vacations
        .filter(
          (vacation) =>
            vacation.periodId === period.id && vacation.status !== "Rejeitada",
        )
        .reduce(
          (total, vacation) => total + vacation.vacationDays + vacation.bonusDays,
          0,
        );

      const remainingDays = period.totalDays - usedDays;
      const grantedUntilDate = new Date(period.grantedUntil);
      const daysUntilExpiration = diffInDays(today, grantedUntilDate);

      const isExpired = daysUntilExpiration < 0 && remainingDays > 0;
      const isNearExpiration =
        daysUntilExpiration >= 0 &&
        daysUntilExpiration <= 60 &&
        remainingDays > 0;

      return {
        ...period,
        employeeName: employee?.fullName ?? "Funcionário não encontrado",
        remainingDays,
        isExpired,
        isNearExpiration,
        daysUntilExpiration,
      };
    });

    const programmedVacations = vacations.filter(
      (vacation) => vacation.status === "Pendente" || vacation.status === "Aprovada",
    ).length;

    const expiringVacations = periodSummaries.filter(
      (period) => period.isNearExpiration,
    );

    const expiredVacations = periodSummaries.filter(
      (period) => period.isExpired,
    );

    const upcomingExpirations = [...periodSummaries]
      .filter((period) => period.remainingDays > 0)
      .sort(
        (a, b) =>
          new Date(a.grantedUntil).getTime() - new Date(b.grantedUntil).getTime(),
      )
      .slice(0, 5);

    return {
      totalEmployees: employees.length,
      programmedVacations,
      expiringVacationsCount: expiringVacations.length,
      expiredVacationsCount: expiredVacations.length,
      upcomingExpirations,
    };
  }, [employees, periods, vacations]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
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

      <div className="flex-1 p-8">
        {activeTab === "home" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bem-vindo ao Painel Admin
              </h2>
              <p className="text-gray-600">
                Acompanhe os principais indicadores de funcionários e férias.
              </p>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-8 text-gray-600">
                Carregando indicadores...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Total de funcionários
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {dashboardData.totalEmployees}
                        </h3>
                      </div>
                      <Users className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Férias programadas
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {dashboardData.programmedVacations}
                        </h3>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Férias a vencer</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {dashboardData.expiringVacationsCount}
                        </h3>
                      </div>
                      <Clock3 className="w-10 h-10 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Férias vencidas</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {dashboardData.expiredVacationsCount}
                        </h3>
                      </div>
                      <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Próximos vencimentos
                  </h3>

                  {dashboardData.upcomingExpirations.length === 0 ? (
                    <p className="text-gray-500">
                      Nenhum período com saldo em aberto encontrado.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-3 px-4">Funcionário</th>
                            <th className="text-left py-3 px-4">Período</th>
                            <th className="text-left py-3 px-4">Saldo</th>
                            <th className="text-left py-3 px-4">Conceder até</th>
                            <th className="text-left py-3 px-4">Situação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.upcomingExpirations.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-200"
                            >
                              <td className="py-4 px-4">{item.employeeName}</td>
                              <td className="py-4 px-4">
                                Período {item.periodNumber}
                              </td>
                              <td className="py-4 px-4">
                                {item.remainingDays} dias
                              </td>
                              <td className="py-4 px-4">
                                {formatDate(item.grantedUntil)}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`px-2 py-1 rounded text-sm ${
                                    item.isExpired
                                      ? "bg-red-100 text-red-700"
                                      : item.isNearExpiration
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {item.isExpired
                                    ? "Vencido"
                                    : item.daysUntilExpiration <= 60
                                    ? `Vence em ${item.daysUntilExpiration} dias`
                                    : "No prazo"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "employees" && <EmployeeManagement />}
        {activeTab === "vacations" && <VacationManagement />}
      </div>
    </div>
  );
}
