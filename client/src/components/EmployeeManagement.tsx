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

  if (isLoading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">{error.message}</div>;

  const handleSave = () => {
    if (editingEmployeeId) {
      updateEmployee.mutate({ id: editingEmployeeId, ...formData });
      return;
    }
    createEmployee.mutate(formData);
  };

  const handleEdit = (employee: any) => {
    setEditingEmployeeId(employee.id);
    setFormData(employee);
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Funcionários</h2>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </button>
      </div>

      {/* MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeForm}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {editingEmployeeId ? "Editar Funcionário" : "Novo Funcionário"}
              </h3>

              <X onClick={closeForm} className="cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* Nome */}
              <div>
                <label className="text-sm text-gray-600">Nome completo</label>
                <input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* CPF */}
              <div>
                <label className="text-sm text-gray-600">CPF</label>
                <input
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({ ...formData, cpf: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="text-sm text-gray-600">Telefone</label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Cargo */}
              <div>
                <label className="text-sm text-gray-600">Cargo</label>
                <input
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Setor */}
              <div>
                <label className="text-sm text-gray-600">Setor</label>
                <input
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Data */}
              <div>
                <label className="text-sm text-gray-600">Data de admissão</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) =>
                    setFormData({ ...formData, admissionDate: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as EmployeeStatus,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>

              {/* Observações */}
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editingEmployeeId ? "Salvar alterações" : "Salvar"}
              </button>

              <button
                onClick={closeForm}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABELA */}
      <table className="w-full mt-4">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Nome</th>
            <th className="text-left py-2">CPF</th>
            <th className="text-left py-2">Cargo</th>
            <th className="text-left py-2">Setor</th>
            <th className="text-left py-2">Ações</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="border-b">
              <td className="py-2">{emp.fullName}</td>
              <td>{emp.cpf}</td>
              <td>{emp.jobTitle}</td>
              <td>{emp.department}</td>
              <td className="flex gap-2 py-2">
                <Edit2
                  className="cursor-pointer text-yellow-600"
                  onClick={() => handleEdit(emp)}
                />
                <Trash2 className="cursor-pointer text-red-600" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
