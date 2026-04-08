import { useEffect, useState } from "react";

type Contract = {
  id: number;
  contractNumber: string;
  year: number;
  clientName: string;
  cnpj: string;
  object: string;
  status: string;
  currentTerm?: {
    totalValue: string;
    endDate: string;
  };
};

type ContractFormItem = {
  description: string;
  quantity: number;
  unitValue: number;
};

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    contractNumber: "",
    year: new Date().getFullYear(),
    clientName: "",
    cnpj: "",
    object: "",
    reajustIndex: "IPCA",
    signatureDate: "",
    startDate: "",
    endDate: "",
    installments: 12,
    items: [{ description: "", quantity: 1, unitValue: 0 }] as ContractFormItem[],
  });

  async function loadContracts() {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contracts");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao carregar contratos.");
      }

      setContracts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Erro ao carregar contratos.");
      setContracts([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadContracts();
  }, []);

  function handleChange(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleItemChange(
    index: number,
    field: keyof ContractFormItem,
    value: string | number,
  ) {
    const newItems = [...form.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setForm((prev) => ({ ...prev, items: newItems }));
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitValue: 0 }],
    }));
  }

  function removeItem(index: number) {
    if (form.items.length === 1) return;

    const newItems = form.items.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, items: newItems }));
  }

  function resetForm() {
    setForm({
      contractNumber: "",
      year: new Date().getFullYear(),
      clientName: "",
      cnpj: "",
      object: "",
      reajustIndex: "IPCA",
      signatureDate: "",
      startDate: "",
      endDate: "",
      installments: 12,
      items: [{ description: "", quantity: 1, unitValue: 0 }],
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao criar contrato.");
      }

      setShowForm(false);
      resetForm();
      loadContracts();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Erro ao criar contrato.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Contratos</h2>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie contratos, itens e termos aditivos.
            </p>
          </div>

          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            {showForm ? "Fechar formulário" : "Novo Contrato"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900 mb-5">
            Cadastro de Contrato
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nº do contrato
                </label>
                <input
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.contractNumber}
                  onChange={(e) => handleChange("contractNumber", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ano
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.year}
                  onChange={(e) => handleChange("year", Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Índice
                </label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.reajustIndex}
                  onChange={(e) => handleChange("reajustIndex", e.target.value)}
                >
                  <option value="IPCA">IPCA</option>
                  <option value="IGPM">IGPM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Parcelas
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.installments}
                  onChange={(e) => handleChange("installments", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Município / cliente
                </label>
                <input
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  CNPJ
                </label>
                <input
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Objeto
              </label>
              <textarea
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm min-h-[100px]"
                value={form.object}
                onChange={(e) => handleChange("object", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de assinatura
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.signatureDate}
                  onChange={(e) => handleChange("signatureDate", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vigência inicial
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vigência final
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-slate-900">
                  Itens do contrato
                </h4>

                <button
                  type="button"
                  onClick={addItem}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-xl transition"
                >
                  + Adicionar item
                </button>
              </div>

              <div className="space-y-4">
                {form.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-slate-200 rounded-xl p-3"
                  >
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Descrição
                      </label>
                      <input
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", Number(e.target.value))
                        }
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Valor unitário
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                        value={item.unitValue}
                        onChange={(e) =>
                          handleItemChange(index, "unitValue", Number(e.target.value))
                        }
                      />
                    </div>

                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-3 py-2 rounded-xl transition"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
              >
                Salvar contrato
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Lista de contratos
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Carregando contratos...</div>
        ) : contracts.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            Nenhum contrato cadastrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Nº
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Ano
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Município
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    CNPJ
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Valor atual
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Vigência final
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-700">
                      {contract.contractNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{contract.year}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {contract.clientName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{contract.cnpj}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {contract.currentTerm?.totalValue ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {contract.currentTerm?.endDate ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                        {contract.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
