import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

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
  unitValue: string;
};

const mockContracts: Contract[] = [
  {
    id: 1,
    contractNumber: "001",
    year: 2026,
    clientName: "Município de Comendador Levy Gasparian",
    cnpj: "39.559.395/0001-38",
    object: "Licenciamento de sistemas de gestão pública municipal.",
    status: "Vigente",
    currentTerm: {
      totalValue: "3500.00",
      endDate: "2026-12-31",
    },
  },
  {
    id: 2,
    contractNumber: "002",
    year: 2026,
    clientName: "Câmara Municipal de Paraíba do Sul",
    cnpj: "29.138.385/0001-30",
    object: "Fornecimento de sistemas administrativos e suporte técnico.",
    status: "Vigente",
    currentTerm: {
      totalValue: "2200.00",
      endDate: "2026-12-31",
    },
  },
  {
    id: 3,
    contractNumber: "015",
    year: 2025,
    clientName: "Município de Santa Maria Madalena",
    cnpj: "28.741.736/0001-85",
    object: "Implantação, treinamento e manutenção de sistemas.",
    status: "Encerrado",
    currentTerm: {
      totalValue: "4800.00",
      endDate: "2025-12-31",
    },
  },
];

function parseMoney(value: string) {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatMoney(value?: string) {
  if (!value) return "-";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;

  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [usingMockData, setUsingMockData] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

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
    items: [{ description: "", quantity: 1, unitValue: "" }] as ContractFormItem[],
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
      setUsingMockData(false);
    } catch (err) {
      console.error(err);
      setContracts(mockContracts);
      setUsingMockData(true);
      setErrorMessage(
        "Exibindo dados fictícios para visualização até a configuração do banco de contratos.",
      );
    } finally {
      setLoading(false);
    }
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
    const updatedItems = [...form.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setForm((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitValue: "" }],
    }));
  }

  function removeItem(index: number) {
    if (form.items.length === 1) return;

    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
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
      items: [{ description: "", quantity: 1, unitValue: "" }],
    });
  }

  function closeModal() {
    setShowForm(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (usingMockData) {
      const totalValue = form.items.reduce((total, item) => {
        return total + Number(item.quantity) * parseMoney(item.unitValue);
      }, 0);

      const fakeNewContract: Contract = {
        id: Date.now(),
        contractNumber: form.contractNumber,
        year: form.year,
        clientName: form.clientName,
        cnpj: form.cnpj,
        object: form.object,
        status: "Vigente",
        currentTerm: {
          totalValue: totalValue.toFixed(2),
          endDate: form.endDate || "-",
        },
      };

      setContracts((prev) => [fakeNewContract, ...prev]);
      closeModal();
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        items: form.items.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitValue: parseMoney(item.unitValue),
        })),
      };

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao salvar contrato.");
      }

      closeModal();
      await loadContracts();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Erro ao salvar contrato.");
    } finally {
      setSaving(false);
    }
  }

  const totalContracts = useMemo(() => contracts.length, [contracts]);

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
            onClick={() => {
              setErrorMessage(usingMockData
                ? "Modo visual ativo: os contratos cadastrados agora são fictícios e servem apenas para pré-visualização."
                : "");
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            Novo Contrato
          </button>
        </div>
      </div>

      {(errorMessage || usingMockData) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          {errorMessage || "Exibindo dados fictícios para visualização."}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total de contratos</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalContracts}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Vigentes</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {contracts.filter((item) => item.status === "Vigente").length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Encerrados</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {contracts.filter((item) => item.status === "Encerrado").length}
          </p>
        </div>
      </div>

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
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Nº</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Ano</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Município</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">CNPJ</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Valor atual</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Vigência final</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-700">{contract.contractNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{contract.year}</td>
                    <td className="px-4 py-3 text-slate-700">{contract.clientName}</td>
                    <td className="px-4 py-3 text-slate-700">{contract.cnpj}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatMoney(contract.currentTerm?.totalValue)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {contract.currentTerm?.endDate ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          contract.status === "Vigente"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
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

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Cadastro de Contrato
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Preencha os dados principais e os itens do contrato.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 hover:bg-slate-100 transition"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              {usingMockData && (
                <div className="mb-5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">
                  Você está em modo de visualização. Ao salvar, o contrato será exibido na lista de forma fictícia.
                </div>
              )}

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
                      onChange={(e) =>
                        handleChange("installments", Number(e.target.value))
                      }
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
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm min-h-[90px]"
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

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border-separate border-spacing-y-2">
                      <thead>
                        <tr>
                          <th className="text-left text-slate-700 font-semibold px-2 py-2">
                            Descrição
                          </th>
                          <th className="text-left text-slate-700 font-semibold px-2 py-2 w-[140px]">
                            Quantidade
                          </th>
                          <th className="text-left text-slate-700 font-semibold px-2 py-2 w-[180px]">
                            Valor unitário
                          </th>
                          <th className="text-left text-slate-700 font-semibold px-2 py-2 w-[160px]">
                            Total
                          </th>
                          <th className="text-left text-slate-700 font-semibold px-2 py-2 w-[100px]">
                            Ação
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.items.map((item, index) => {
                          const total =
                            Number(item.quantity || 0) * parseMoney(item.unitValue);

                          return (
                            <tr key={index}>
                              <td className="px-2">
                                <input
                                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                                  value={item.description}
                                  onChange={(e) =>
                                    handleItemChange(index, "description", e.target.value)
                                  }
                                />
                              </td>

                              <td className="px-2">
                                <input
                                  type="number"
                                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "quantity",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>

                              <td className="px-2">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="Ex.: 500,00"
                                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                                  value={item.unitValue}
                                  onChange={(e) =>
                                    handleItemChange(index, "unitValue", e.target.value)
                                  }
                                />
                              </td>

                              <td className="px-2 text-slate-700 font-medium">
                                {formatMoney(total.toFixed(2))}
                              </td>

                              <td className="px-2">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-3 py-2 rounded-xl transition"
                                >
                                  X
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
                      <span className="text-slate-500 mr-2">Valor total do contrato:</span>
                      <span className="font-semibold text-slate-900">
                        {formatMoney(
                          form.items
                            .reduce((total, item) => {
                              return total + Number(item.quantity || 0) * parseMoney(item.unitValue);
                            }, 0)
                            .toFixed(2),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    {usingMockData
                      ? "Salvar visualização"
                      : saving
                      ? "Salvando..."
                      : "Salvar contrato"}
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
