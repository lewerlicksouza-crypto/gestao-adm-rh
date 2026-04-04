import { useState } from "react";
import { Eye, Edit2, Trash2, Plus, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type EmployeeStatus = "Ativo" | "Inativo";

type EmployeeFormData = {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  admissionDate: string;
  status: EmployeeStatus;
  notes: string;
};

const emptyForm: EmployeeFormData = {
  fullName: "",
  cpf: "",
  email: "",
  phone: "",
  jobTitle: "",
  department: "",
  admissionDate: "",
  status: "Ativo",
  notes: "",
};

export default function EmployeeManagement() {
  const utils = trpc.useUtils();

  const { data: employees = [], isLoading, error } =
    trpc.employees.list.useQuery();

  const createEmployee = trpc.employees.create.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      closeForm();
    },
  });

  const updateEmployee = trpc.employees.update.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      closeForm();
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(emptyForm);

  function closeForm() {
    setShowForm(false);
    setEditingEmployeeId(null);
    setFormData(emptyForm);
  }

  if (isLoading) {
    return <div className="p-6">Carregando funcionários...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Erro ao carregar funcionários: {error.message}
      </div>
    );
  }

  const handleNewEmployee = () => {
    setEditingEmployeeId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingEmployeeId) {
      updateEmployee.mutate({
        id: editingEmployeeId,
        ...formData,
      });
      return;
    }

    createEmployee.mutate(formData);
  };

  const handleView = (employee: any) => {
    setViewingEmployee(employee);
  };

  const handleEdit = (employee: any) => {
    setEditingEmployeeId(employee.id);
    setFormData({
      fullName: employee.fullName,
      cpf: employee.cpf,
      email: employee.email,
      phone: employee.phone,
      jobTitle: employee.jobTitle,
      department: employee.department,
      admissionDate: employee.admissionDate,
      status: employee.status,
      notes: employee.notes,
    });
    setShowForm(true);
  };

  const handleDelete = (employeeName: string) => {
    alert(`Excluir funcionário: ${employeeName}`);
  };

  const mutationError = createEmployee.error?.message || updateEmployee.error?.message;
  const isSaving = createEmployee.isPending || updateEmployee.isPending;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Funcionários</h2>

        <button
          onClick={handleNewEmployee}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingEmployeeId ? "Editar Funcionário" : "Cadastro de Funcionário"}
              </h3>

              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="CPF"
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({ ...formData, cpf: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Cargo"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Setor / Departamento"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="date"
                value={formData.admissionDate}
                onChange={(e) =>
                  setFormData({ ...formData, admissionDate: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as EmployeeStatus,
                  })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>

              <textarea
                placeholder="Observações"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2 min-h-[100px]"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
              >
                {isSaving
                  ? editingEmployeeId
                    ? "Salvando alterações..."
                    : "Salvando..."
                  : editingEmployeeId
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
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Dados do Funcionário
              </h3>

              <button
                onClick={() => setViewingEmployee(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Nome:</span>
                <p>{viewingEmployee.fullName}</p>
              </div>

              <div>
                <span className="font-semibold">CPF:</span>
                <p>{viewingEmployee.cpf}</p>
              </div>

              <div>
                <span className="font-semibold">Email:</span>
                <p>{viewingEmployee.email}</p>
              </div>

              <div>
                <span className="font-semibold">Telefone:</span>
                <p>{viewingEmployee.phone}</p>
              </div>

              <div>
                <span className="font-semibold">Cargo:</span>
                <p>{viewingEmployee.jobTitle}</p>
              </div>

              <div>
                <span className="font-semibold">Setor:</span>
                <p>{viewingEmployee.department}</p>
              </div>

              <div>
                <span className="font-semibold">Data de admissão:</span>
                <p>{viewingEmployee.admissionDate || "-"}</p>
              </div>

              <div>
                <span className="font-semibold">Status:</span>
                <p>{viewingEmployee.status}</p>
              </div>

              <div className="md:col-span-2">
                <span className="font-semibold">Observações:</span>
                <p>{viewingEmployee.notes || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">
          Nenhum funcionário encontrado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">CPF</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Cargo</th>
                <th className="text-left py-3 px-4">Setor</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Ações</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b">
                  <td className="py-4 px-4 font-medium">{employee.fullName}</td>
                  <td className="py-4 px-4">{employee.cpf}</td>
                  <td className="py-4 px-4">{employee.email}</td>
                  <td className="py-4 px-4">{employee.jobTitle}</td>
                  <td className="py-4 px-4">{employee.department}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded ${
                        employee.status === "Ativo"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleView(employee)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(employee.fullName)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
