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

  const { data: employees = [] } = trpc.employees.list.useQuery();

  const createEmployee = trpc.employees.create.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      alert("Funcionário criado com sucesso");
      closeForm();
    },
  });

  const updateEmployee = trpc.employees.update.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      alert("Funcionário atualizado com sucesso");
      closeForm();
    },
  });

  const deleteEmployee = trpc.employees.delete.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      alert("Funcionário excluído");
    },
  });

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(emptyForm);
  const [errors, setErrors] = useState<any>({});

  function closeForm() {
    setShowForm(false);
    setEditingEmployeeId(null);
    setFormData(emptyForm);
    setErrors({});
  }

  // 🔥 MÁSCARAS
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2");
  };

  // 🔥 VALIDAÇÃO
  const validate = () => {
    const newErrors: any = {};

    if (!formData.fullName) newErrors.fullName = "Obrigatório";
    if (!formData.cpf) newErrors.cpf = "Obrigatório";
    if (!formData.email) newErrors.email = "Obrigatório";
    if (!formData.jobTitle) newErrors.jobTitle = "Obrigatório";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editingEmployeeId) {
      updateEmployee.mutate({ id: editingEmployeeId, ...formData });
      return;
    }

    createEmployee.mutate(formData);
  };

  const handleDelete = (employee: any) => {
    if (!confirm(`Excluir ${employee.fullName}?`)) return;
    deleteEmployee.mutate({ id: employee.id });
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">

      {/* TOPO */}
      <div className="flex justify-between mb-4">
        <input
          placeholder="Buscar funcionário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-1/3"
        />

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </button>
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-full max-w-4xl">

            <h3 className="text-xl mb-4">
              {editingEmployeeId ? "Editar Funcionário" : "Novo Funcionário"}
            </h3>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label>Nome</label>
                <input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={`border p-2 w-full ${errors.fullName && "border-red-500"}`}
                />
              </div>

              <div>
                <label>CPF</label>
                <input
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpf: formatCPF(e.target.value),
                    })
                  }
                  className={`border p-2 w-full ${errors.cpf && "border-red-500"}`}
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`border p-2 w-full ${errors.email && "border-red-500"}`}
                />
              </div>

              <div>
                <label>Telefone</label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: formatPhone(e.target.value),
                    })
                  }
                  className="border p-2 w-full"
                />
              </div>

              <div>
                <label>Cargo</label>
                <input
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  className={`border p-2 w-full ${errors.jobTitle && "border-red-500"}`}
                />
              </div>

              <div>
                <label>Setor</label>
                <input
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="border p-2 w-full"
                />
              </div>

              <div>
                <label>Data</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) =>
                    setFormData({ ...formData, admissionDate: e.target.value })
                  }
                  className="border p-2 w-full"
                />
              </div>

              <div>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as EmployeeStatus,
                    })
                  }
                  className="border p-2 w-full"
                >
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>

              <div className="col-span-2">
                <label>Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="border p-2 w-full"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Salvar
              </button>

              <button
                onClick={closeForm}
                className="bg-gray-300 px-4 py-2 rounded"
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
            <th>Nome</th>
            <th>CPF</th>
            <th>Cargo</th>
            <th>Setor</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.map((emp) => (
            <tr key={emp.id} className="border-b">
              <td>{emp.fullName}</td>
              <td>{emp.cpf}</td>
              <td>{emp.jobTitle}</td>
              <td>{emp.department}</td>
              <td className="flex gap-2">
                <Eye onClick={() => setViewingEmployee(emp)} />
                <Edit2
                  onClick={() => {
                    setEditingEmployeeId(emp.id);
                    setFormData(emp);
                    setShowForm(true);
                  }}
                />
                <Trash2 onClick={() => handleDelete(emp)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
