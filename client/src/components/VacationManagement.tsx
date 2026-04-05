import { useMemo, useState } from "react";
import { Eye, CalendarPlus, Bell, X, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

type VacationStatus = "Pendente" | "Gozada" | "Programada";

type VacationFormData = {
  employeeId: number | "";
  periodId: number | "";
  startDate: string;
  vacationDays: 15 | 20 | 30;
  bonusDays: 0 | 10;
  status: VacationStatus;
  notes: string;
};

const emptyForm: VacationFormData = {
  employeeId: "",
  periodId: "",
  startDate: "",
  vacationDays: 30,
  bonusDays: 0,
  status: "Pendente",
  notes: "",
};

function formatDate(date: string) {
  if (!date) return "-";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function calculateEndDate(startDate: string, vacationDays: number) {
  if (!startDate || !vacationDays) return "";
  const [year, month, day] = startDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + vacationDays - 1);
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

function getPeriodReference(start: string, end: string) {
  return `${new Date(start).getFullYear()}/${new Date(end).getFullYear()}`;
}

export default function VacationManagement() {
  const utils = trpc.useUtils();

  const { data: employees = [], isLoading: employeesLoading } =
    trpc.employees.list.useQuery();

  const { data: periods = [], isLoading: periodsLoading } =
    trpc.vacationPeriods.list.useQuery();

  const { data: vacations = [], isLoading: vacationsLoading, error } =
    trpc.vacations.list.useQuery();

  const createVacation = trpc.vacations.create.useMutation({
    onSuccess: () => {
      utils.vacations.list.invalidate();
      closeForm();
    },
  });

  const updateVacation = trpc.vacations.update.useMutation({
    onSuccess: () => {
      utils.vacations.list.invalidate();
      closeForm();
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);
  const [alertEmployee, setAlertEmployee] = useState<any | null>(null);
  const [editingVacationId, setEditingVacationId] = useState<number | null>(null);
  const [formData, setFormData] = useState<VacationFormData>(emptyForm);

  const isLoading = employeesLoading || periodsLoading || vacationsLoading;

  function closeForm() {
    setShowForm(false);
    setViewingEmployee(null);
    setAlertEmployee(null);
    setEditingVacationId(null);
    setFormData(emptyForm);
  }

  const relevantLimitDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear() + 1, 11, 31);
  }, []);

  const periodSummaries = useMemo(() => {
    const today = new Date();

    return periods
      .map((period) => {
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

        const endDate = new Date(period.end);
        const availableDate = new Date(endDate);
        availableDate.setDate(availableDate.getDate() + 1);

        const grantedUntilDate = new Date(period.grantedUntil);
        const daysUntilExpiration = diffInDays(today, grantedUntilDate);

        const isAvailable = today >= availableDate;
        const isExpired = daysUntilExpiration < 0 && remainingDays > 0;
        const isNearExpiration =
          daysUntilExpiration >= 0 &&
          daysUntilExpiration <= 60 &&
          remainingDays > 0;

        const isRelevant = grantedUntilDate <= relevantLimitDate;

        return {
          ...period,
          employeeName: employee?.fullName ?? "Funcionário não encontrado",
          employeeJobTitle: employee?.jobTitle ?? "-",
          employeeDepartment: employee?.department ?? "-",
          usedDays,
          remainingDays,
          availableDate,
          isAvailable,
          isExpired,
          isNearExpiration,
          daysUntilExpiration,
          isRelevant,
          periodReference: getPeriodReference(period.start, period.end),
        };
      })
      .filter((period) => period.isRelevant)
      .sort((a, b) => {
        if (a.employeeName !== b.employeeName) {
          return a.employeeName.localeCompare(b.employeeName);
        }
        return a.periodNumber - b.periodNumber;
      });
  }, [periods, vacations, employees, relevantLimitDate]);

  const employeeVacationSummary = useMemo(() => {
    return employees.map((employee) => {
      const employeePeriods = periodSummaries.filter(
        (period) => period.employeeId === employee.id,
      );

      const expiredCount = employeePeriods.filter((p) => p.isExpired).length;
      const nearExpirationCount = employeePeriods.filter(
        (p) => p.isNearExpiration,
      ).length;
      const availablePeriods = employeePeriods.filter(
        (p) => p.isAvailable && p.remainingDays > 0,
      ).length;

      const nextExpiration = employeePeriods
        .filter((p) => p.remainingDays > 0)
        .sort(
          (a, b) =>
            new Date(a.grantedUntil).getTime() - new Date(b.grantedUntil).getTime(),
        )[0];

      let vacationStatus = "Sem períodos relevantes";

      if (expiredCount > 0) {
        vacationStatus = `${expiredCount} vencido(s)`;
      } else if (nearExpirationCount > 0) {
        vacationStatus = `${nearExpirationCount} próximo(s) do vencimento`;
      } else if (availablePeriods > 0) {
        vacationStatus = `${availablePeriods} período(s) disponível(is)`;
      }

      return {
        employee,
        periods: employeePeriods,
        expiredCount,
        nearExpirationCount,
        availablePeriods,
        nextExpiration,
        vacationStatus,
      };
    });
  }, [employees, periodSummaries]);

  const selectedEmployeePeriods = useMemo(() => {
    if (!formData.employeeId) return [];

    return periodSummaries
      .filter((period) => period.employeeId === Number(formData.employeeId))
      .filter((period) => period.isAvailable && period.remainingDays > 0)
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }, [formData.employeeId, periodSummaries]);

  const selectedPeriodSummary = useMemo(() => {
    if (!formData.periodId) return null;
    return periodSummaries.find((item) => item.id === Number(formData.periodId)) ?? null;
  }, [formData.periodId, periodSummaries]);

  const currentEndDate = useMemo(() => {
    return calculateEndDate(formData.startDate, formData.vacationDays);
  }, [formData.startDate, formData.vacationDays]);

  const employeeAlerts = useMemo(() => {
    if (!alertEmployee) return [];
    return periodSummaries.filter(
      (period) =>
        period.employeeId === alertEmployee.id &&
        (period.isExpired || period.isNearExpiration),
    );
  }, [alertEmployee, periodSummaries]);

  const viewingEmployeeHistory = useMemo(() => {
    if (!viewingEmployee) return [];

    return vacations
      .filter((vacation) => vacation.employeeId === viewingEmployee.id)
      .map((vacation) => {
        const period = periods.find((p) => p.id === vacation.periodId);
        return {
          ...vacation,
          periodNumber: period?.periodNumber ?? "-",
          periodReference: period
            ? getPeriodReference(period.start, period.end)
            : "-",
        };
      })
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
  }, [viewingEmployee, vacations, periods]);

  if (isLoading) {
    return <div className="p-6">Carregando férias...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Erro ao carregar férias: {error.message}
      </div>
    );
  }

  const handleProgramVacation = (employee: any) => {
    setEditingVacationId(null);
    setFormData({
      ...emptyForm,
      employeeId: employee.id,
      periodId: "",
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const payload = {
      employeeId: Number(formData.employeeId),
      periodId: Number(formData.periodId),
      startDate: formData.startDate,
      vacationDays: Number(formData.vacationDays),
      bonusDays: Number(formData.bonusDays),
      status: formData.status,
      notes: formData.notes,
    };

    if (!payload.employeeId || !payload.periodId || !payload.startDate) {
      alert("Funcionário, período e data de início são obrigatórios.");
      return;
    }

    if (editingVacationId) {
      updateVacation.mutate({
        id: editingVacationId,
        ...payload,
      });
      return;
    }

    createVacation.mutate(payload);
  };

  const mutationError =
    createVacation.error?.message || updateVacation.error?.message;

  const isSaving = createVacation.isPending || updateVacation.isPending;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Férias</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-3 px-4">Funcionário</th>
              <th className="text-left py-3 px-4">Cargo</th>
              <th className="text-left py-3 px-4">Setor</th>
              <th className="text-left py-3 px-4">Situação</th>
              <th className="text-center py-3 px-4">Ações</th>
            </tr>
          </thead>

          <tbody>
            {employeeVacationSummary.map((item) => (
              <tr key={item.employee.id} className="border-b border-gray-200">
                <td className="py-4 px-4 font-medium">
                  {item.employee.fullName}
                </td>
                <td className="py-4 px-4">{item.employee.jobTitle}</td>
                <td className="py-4 px-4">{item.employee.department}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      item.expiredCount > 0
                        ? "bg-red-100 text-red-700"
                        : item.nearExpirationCount > 0
                        ? "bg-yellow-100 text-yellow-700"
                        : item.availablePeriods > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.vacationStatus}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setViewingEmployee(item.employee)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Visualizar períodos"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleProgramVacation(item.employee)}
                      className="text-green-600 hover:text-green-800"
                      title="Programar férias"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setAlertEmployee(item.employee)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Avisos"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {employeeVacationSummary.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-5xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingVacationId ? "Editar Férias" : "Programar Férias"}
              </h3>

              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Funcionário
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeId: e.target.value ? Number(e.target.value) : "",
                      periodId: "",
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Selecione</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Período
                </label>
                <select
                  value={formData.periodId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      periodId: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  disabled={!formData.employeeId}
                >
                  <option value="">Selecione</option>
                  {selectedEmployeePeriods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {`Período ${period.periodNumber} — ${period.periodReference} (${period.remainingDays} dias disponíveis)`}
                    </option>
                  ))}
                </select>

                {formData.employeeId && selectedEmployeePeriods.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Este funcionário não possui períodos válidos e disponíveis no momento.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Data de início
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Dias de férias
                </label>
                <select
                  value={formData.vacationDays}
                  onChange={(e) => {
                    const value = Number(e.target.value) as 15 | 20 | 30;
                    setFormData({
                      ...formData,
                      vacationDays: value,
                      bonusDays: value === 20 ? formData.bonusDays : 0,
                    });
                  }}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={15}>15 dias</option>
                  <option value={20}>20 dias</option>
                  <option value={30}>30 dias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Dias de abono
                </label>
                <select
                  value={formData.bonusDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bonusDays: Number(e.target.value) as 0 | 10,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  disabled={formData.vacationDays !== 20}
                >
                  <option value={0}>0</option>
                  {formData.vacationDays === 20 && <option value={10}>10</option>}
                </select>
                {formData.vacationDays !== 20 && (
                  <p className="text-xs text-gray-500 mt-1">
                    O abono só é permitido quando as férias forem de 20 dias.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Data de fim
                </label>
                <input
                  value={currentEndDate ? formatDate(currentEndDate) : ""}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as VacationStatus,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Aprovada">Aprovada</option>
                  <option value="Rejeitada">Rejeitada</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 min-h-[100px]"
                />
              </div>
            </div>

            {selectedPeriodSummary && (
              <div
                className={`mt-6 rounded-lg border p-4 text-sm ${
                  selectedPeriodSummary.isExpired
                    ? "bg-red-50 border-red-200"
                    : selectedPeriodSummary.isNearExpiration
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="font-semibold mb-2">
                  Resumo do período selecionado
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="font-medium">Período:</span>{" "}
                    {selectedPeriodSummary.periodNumber}
                  </div>
                  <div>
                    <span className="font-medium">Referência:</span>{" "}
                    {selectedPeriodSummary.periodReference}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span>{" "}
                    {selectedPeriodSummary.totalDays} dias
                  </div>
                  <div>
                    <span className="font-medium">Usados:</span>{" "}
                    {selectedPeriodSummary.usedDays} dias
                  </div>
                  <div>
                    <span className="font-medium">Disponíveis:</span>{" "}
                    {selectedPeriodSummary.remainingDays} dias
                  </div>
                  <div>
                    <span className="font-medium">Conceder até:</span>{" "}
                    {formatDate(selectedPeriodSummary.grantedUntil)}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
              >
                {isSaving
                  ? editingVacationId
                    ? "Salvando alterações..."
                    : "Salvando..."
                  : editingVacationId
                  ? "Salvar alterações"
                  : "Salvar"}
              </button>

              <button
                onClick={closeForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
            </div>

            {mutationError && (
              <div className="mt-3 text-red-600 text-sm">{mutationError}</div>
            )}
          </div>
        </div>
      )}

      {viewingEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setViewingEmployee(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Períodos e histórico de férias — {viewingEmployee.fullName}
              </h3>

              <button
                onClick={() => setViewingEmployee(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Controle de períodos
            </h4>

            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-4">Período</th>
                    <th className="text-left py-3 px-4">Referência</th>
                    <th className="text-left py-3 px-4">Início</th>
                    <th className="text-left py-3 px-4">Término</th>
                    <th className="text-left py-3 px-4">Dias</th>
                    <th className="text-left py-3 px-4">Usados</th>
                    <th className="text-left py-3 px-4">Em aberto</th>
                    <th className="text-left py-3 px-4">Conceder até</th>
                  </tr>
                </thead>
                <tbody>
                  {periodSummaries
                    .filter((summary) => summary.employeeId === viewingEmployee.id)
                    .map((summary) => (
                      <tr
                        key={summary.id}
                        className={`border-b border-gray-200 ${
                          summary.isExpired
                            ? "bg-red-50"
                            : summary.isNearExpiration
                            ? "bg-yellow-50"
                            : ""
                        }`}
                      >
                        <td className="py-4 px-4">{summary.periodNumber}</td>
                        <td className="py-4 px-4">{summary.periodReference}</td>
                        <td className="py-4 px-4">{formatDate(summary.start)}</td>
                        <td className="py-4 px-4">{formatDate(summary.end)}</td>
                        <td className="py-4 px-4">{summary.totalDays}</td>
                        <td className="py-4 px-4">{summary.usedDays}</td>
                        <td className="py-4 px-4">{summary.remainingDays}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span>{formatDate(summary.grantedUntil)}</span>
                            {summary.isExpired && (
                              <span className="text-xs text-red-600 font-medium">
                                Vencido
                              </span>
                            )}
                            {summary.isNearExpiration && !summary.isExpired && (
                              <span className="text-xs text-yellow-700 font-medium">
                                Vence em {summary.daysUntilExpiration} dias
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                  {periodSummaries.filter(
                    (summary) => summary.employeeId === viewingEmployee.id,
                  ).length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        Nenhum período válido encontrado para este funcionário.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Histórico de lançamentos
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-4">Período</th>
                    <th className="text-left py-3 px-4">Referência</th>
                    <th className="text-left py-3 px-4">Início</th>
                    <th className="text-left py-3 px-4">Fim</th>
                    <th className="text-left py-3 px-4">Dias</th>
                    <th className="text-left py-3 px-4">Abono</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingEmployeeHistory.map((vacation) => (
                    <tr key={vacation.id} className="border-b border-gray-200">
                      <td className="py-4 px-4">{vacation.periodNumber}</td>
                      <td className="py-4 px-4">{vacation.periodReference}</td>
                      <td className="py-4 px-4">{formatDate(vacation.startDate)}</td>
                      <td className="py-4 px-4">{formatDate(vacation.endDate)}</td>
                      <td className="py-4 px-4">{vacation.vacationDays}</td>
                      <td className="py-4 px-4">{vacation.bonusDays}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            vacation.status === "Aprovada"
                              ? "bg-green-100 text-green-700"
                              : vacation.status === "Pendente"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {vacation.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">{vacation.notes || "-"}</td>
                    </tr>
                  ))}

                  {viewingEmployeeHistory.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        Nenhum lançamento de férias encontrado para este funcionário.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {alertEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setAlertEmployee(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Avisos de férias — {alertEmployee.fullName}
              </h3>

              <button
                onClick={() => setAlertEmployee(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {employeeAlerts.length === 0 ? (
              <div className="text-gray-500">
                Nenhum aviso de férias para este funcionário.
              </div>
            ) : (
              <div className="space-y-3">
                {employeeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 ${
                      alert.isExpired
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-yellow-50 border-yellow-200 text-yellow-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      {`Período ${alert.periodNumber} — ${alert.periodReference}`}
                    </div>

                    <div className="text-sm space-y-1">
                      <div>
                        Aquisitivo: {formatDate(alert.start)} até{" "}
                        {formatDate(alert.end)}
                      </div>
                      <div>Saldo em aberto: {alert.remainingDays} dias</div>
                      <div>Conceder até: {formatDate(alert.grantedUntil)}</div>
                      {alert.isExpired ? (
                        <div className="font-medium">
                          Situação: período vencido
                        </div>
                      ) : (
                        <div className="font-medium">
                          Situação: vence em {alert.daysUntilExpiration} dias
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
