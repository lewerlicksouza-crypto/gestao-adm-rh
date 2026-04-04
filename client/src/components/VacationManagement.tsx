import { useMemo, useState } from "react";
import { Eye, Edit2, Trash2, Plus, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type VacationStatus = "Pendente" | "Aprovada" | "Rejeitada";

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

  const deleteVacation = trpc.vacations.delete.useMutation({
    onSuccess: () => {
      utils.vacations.list.invalidate();
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [viewingVacation, setViewingVacation] = useState<any | null>(null);
  const [editingVacationId, setEditingVacationId] = useState<number | null>(null);
  const [formData, setFormData] = useState<VacationFormData>(emptyForm);

  const isLoading = employeesLoading || periodsLoading || vacationsLoading;

  function closeForm() {
    setShowForm(false);
    setEditingVacationId(null);
    setFormData(emptyForm);
  }

  const selectedEmployeePeriods = useMemo(() => {
    if (!formData.employeeId) return [];
    return periods.filter((period) => period.employeeId === Number(formData.employeeId));
  }, [formData.employeeId, periods]);

  const selectedPeriod = useMemo(() => {
    if (!formData.periodId) return null;
    return periods.find((period) => period.id === Number(formData.periodId)) ?? null;
  }, [formData.periodId, periods]);

  const currentEndDate = useMemo(() => {
    return calculateEndDate(formData.startDate, formData.vacationDays);
  }, [formData.startDate, formData.vacationDays]);

  const periodSummaries = useMemo(() => {
    return periods.map((period) => {
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

      return {
        ...period,
        employeeName: employee?.fullName ?? "Funcionário não encontrado",
        usedDays,
        remainingDays: period.totalDays - usedDays,
      };
    });
  }, [periods, vacations, employees]);

  const selectedPeriodSummary = useMemo(() => {
    if (!selectedPeriod) return null;
    return periodSummaries.find((item) => item.id === selectedPeriod.id) ?? null;
  }, [selectedPeriod, periodSummaries]);

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

  const handleNewVacation = () => {
    setEditingVacationId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (vacation: any) => {
    setEditingVacationId(vacation.id);
    setFormData({
      employeeId: vacation.employeeId,
      periodId: vacation.periodId,
      startDate: vacation.startDate,
      vacationDays: vacation.vacationDays,
      bonusDays: vacation.bonusDays,
      status: vacation.status,
      notes: vacation.notes ?? "",
    });
    setShowForm(true);
  };

  const handleView = (vacation: any) => {
    setViewingVacation(vacation);
  };

  const handleDelete = (vacation: any) => {
    const confirmed = window.confirm(
      `Deseja excluir o lançamento de férias do funcionário selecionado?`,
    );

    if (!confirmed) return;

    deleteVacation.mutate({ id: vacation.id });
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
    createVacation.error?.message ||
    updateVacation.error?.message ||
    deleteVacation.error?.message;

  const isSaving = createVacation.isPending || updateVacation.isPending;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Férias</h2>

        <button
          onClick={handleNewVacation}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nova Férias
        </button>
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
                {editingVacationId ? "Editar Férias" : "Cadastrar Férias"}
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
                      {`Período ${period.periodNumber}`}
                    </option>
                  ))}
                </select>
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
              <div className="mt-6 rounded-lg border bg-blue-50 p-4 text-sm">
                <div className="font-semibold text-blue-900 mb-2">
                  Resumo do período selecionado
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="font-medium">Período:</span>{" "}
                    {selectedPeriodSummary.periodNumber}
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
                    <span className="font-medium">Aquisitivo:</span>{" "}
                    {formatDate(selectedPeriodSummary.start)} até{" "}
                    {formatDate(selectedPeriodSummary.end)}
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

      {viewingVacation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setViewingVacation(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Detalhes das Férias
              </h3>

              <button
                onClick={() => setViewingVacation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Funcionário:</strong>
                <p>
                  {employees.find((e) => e.id === viewingVacation.employeeId)
                    ?.fullName ?? "-"}
                </p>
              </div>

              <div>
                <strong>Período:</strong>
                <p>
                  {periods.find((p) => p.id === viewingVacation.periodId)
                    ?.periodNumber ?? "-"}
                </p>
              </div>

              <div>
                <strong>Início:</strong>
                <p>{formatDate(viewingVacation.startDate)}</p>
              </div>

              <div>
                <strong>Fim:</strong>
                <p>{formatDate(viewingVacation.endDate)}</p>
              </div>

              <div>
                <strong>Dias de férias:</strong>
                <p>{viewingVacation.vacationDays}</p>
              </div>

              <div>
                <strong>Dias de abono:</strong>
                <p>{viewingVacation.bonusDays}</p>
              </div>

              <div>
                <strong>Status:</strong>
                <p>{viewingVacation.status}</p>
              </div>

              <div className="md:col-span-2">
                <strong>Observações:</strong>
                <p>{viewingVacation.notes || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse mb-10">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-3 px-4">Funcionário</th>
              <th className="text-left py-3 px-4">Período</th>
              <th className="text-left py-3 px-4">Início</th>
              <th className="text-left py-3 px-4">Fim</th>
              <th className="text-left py-3 px-4">Dias</th>
              <th className="text-left py-3 px-4">Abono</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-center py-3 px-4">Ações</th>
            </tr>
          </thead>

          <tbody>
            {vacations.map((vacation) => {
              const employee = employees.find((item) => item.id === vacation.employeeId);
              const period = periods.find((item) => item.id === vacation.periodId);

              return (
                <tr key={vacation.id} className="border-b border-gray-200">
                  <td className="py-4 px-4">{employee?.fullName ?? "-"}</td>
                  <td className="py-4 px-4">
                    {period ? `Período ${period.periodNumber}` : "-"}
                  </td>
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
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleView(vacation)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEdit(vacation)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(vacation)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {vacations.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  Nenhum lançamento de férias encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Controle de períodos
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-3 px-4">Funcionário</th>
              <th className="text-left py-3 px-4">Período</th>
              <th className="text-left py-3 px-4">Início</th>
              <th className="text-left py-3 px-4">Término</th>
              <th className="text-left py-3 px-4">Dias</th>
              <th className="text-left py-3 px-4">Usados</th>
              <th className="text-left py-3 px-4">Em aberto</th>
              <th className="text-left py-3 px-4">Conceder até</th>
            </tr>
          </thead>

          <tbody>
            {periodSummaries.map((summary) => (
              <tr key={summary.id} className="border-b border-gray-200">
                <td className="py-4 px-4">{summary.employeeName}</td>
                <td className="py-4 px-4">{summary.periodNumber}</td>
                <td className="py-4 px-4">{formatDate(summary.start)}</td>
                <td className="py-4 px-4">{formatDate(summary.end)}</td>
                <td className="py-4 px-4">{summary.totalDays}</td>
                <td className="py-4 px-4">{summary.usedDays}</td>
                <td className="py-4 px-4">{summary.remainingDays}</td>
                <td className="py-4 px-4">{formatDate(summary.grantedUntil)}</td>
              </tr>
            ))}

            {periodSummaries.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  Nenhum período cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
