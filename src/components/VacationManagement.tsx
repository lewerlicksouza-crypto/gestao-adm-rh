import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "./Button";

interface Vacation {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  type: "30" | "20+10" | "15+15";
  status: "pending" | "approved" | "rejected";
}

const mockVacations: Vacation[] = [];

export default function VacationManagement() {
  const [vacations, setVacations] = useState<Vacation[]>(mockVacations);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Férias</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Nova Féria
        </Button>
      </div>

      {vacations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma féria registrada</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Funcionário</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Início</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fim</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vacations.map((vac) => (
                <tr key={vac.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Funcionário {vac.employeeId}</td>
                  <td className="py-3 px-4">{vac.startDate}</td>
                  <td className="py-3 px-4">{vac.endDate}</td>
                  <td className="py-3 px-4">{vac.type} dias</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        vac.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : vac.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {vac.status === "approved"
                        ? "Aprovado"
                        : vac.status === "rejected"
                          ? "Rejeitado"
                          : "Pendente"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
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
      )}
    </div>
  );
}
