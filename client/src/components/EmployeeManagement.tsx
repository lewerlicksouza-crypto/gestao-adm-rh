import { useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { Button } from "./Button";

interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  status: "active" | "inactive";
}

const mockEmployees: Employee[] = [
  {
    id: 1,
    fullName: "Sebastião Expedito De Freitas Neto",
    email: "sebastiaofreitas@contasolucoes.com.br",
    phone: "(22) 3822-2919",
    position: "Consultor Técnico",
    status: "active",
  },
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Funcionários</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </Button>
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Cargo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{emp.fullName}</td>
                <td className="py-3 px-4 text-sm">{emp.email}</td>
                <td className="py-3 px-4">{emp.position}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      emp.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {emp.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
