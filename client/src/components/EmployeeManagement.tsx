import { useState } from "react";
import { Eye, Edit2, Trash2, Plus, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function EmployeeManagement() {
  const utils = trpc.useUtils();

  const { data: employees = [], isLoading, error } =
    trpc.employees.list.useQuery();

  const createEmployee = trpc.employees.create.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      setShowForm(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        jobTitle: "",
        department: "",
      });
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
  });

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

  const handleView = (employeeName: string) => {
    alert(`Visualizar funcionário: ${employeeName}`);
  };

  const handleEdit = (employeeName: string) => {
    alert(`Editar funcionário: ${employeeName}`);
  };

  const handleDelete = (employeeName: string) => {
    alert(`Excluir funcionário: ${employeeName}`);
  };

  const handleNewEmployee = () => {
    setShowForm(true);
  };

  const handleSave = () => {
    createEmployee.mutate(formData);
  };

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
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Novo Funcionário
            </h3>

            <button
              onClick={() => setShowForm(false)}
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
              placeholder="Setor"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={createEmployee.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {createEmployee.isPending ? "Salvando..." : "Salvar"}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
          </div>

          {createEmployee.error && (
            <div className="mt-3 text-red-600 text-sm">
              {createEmployee.error.message}
            </div>
          )}
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Nome
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Cargo
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Setor
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-4 px-4 text-gray-900 font-medium">
                    {employee.fullName}
                  </td>

                  <td className="py-4 px-4 text-gray-700">{employee.email}</td>

                  <td className="py-4 px-4 text-gray-700">
                    {employee.jobTitle}
                  </td>

                  <td className="py-4 px-4 text-gray-700">
                    {employee.department}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        employee.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleView(employee.fullName)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEdit(employee.fullName)}
                        className="text-amber-500 hover:text-amber-700 transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(employee.fullName)}
                        className="text-red-600 hover:text-red-800 transition"
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
