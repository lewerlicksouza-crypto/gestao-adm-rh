import { useEffect, useMemo, useState } from "react";
import { X, Eye, Pencil, FilePlus2 } from "lucide-react";

type Contract = {
  id: number;
  contractNumber: string;
  year: number;
  clientName: string;
  cnpj: string;
  object: string;
  status: string;
  reajustIndex?: string;
  signatureDate?: string;
  currentTerm?: {
    termType?: string;
    termNumber?: number;
    totalValue: string;
    endDate: string;
    startDate?: string;
    installments?: number;
    installmentValue?: string;
    reajustPercent?: string;
  };
  terms?: ContractTerm[];
  items?: ContractItem[];
};

type ContractItem = {
  id: number;
  description: string;
  quantity: number;
  unitValue: string;
  totalValue: string;
};

type ContractTerm = {
  id: number;
  termType: "initial" | "additive";
  termNumber: number;
  termDate: string;
  startDate: string;
  endDate: string;
  totalValue: string;
  installments: number;
  installmentValue: string;
  reajustIndex: string;
  reajustPercent: string;
  notes?: string;
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
    reajustIndex: "IPCA",
    signatureDate: "2026-01-03",
    currentTerm: {
      termType: "additive",
      termNumber: 1,
      totalValue: "3500.00",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      installments: 12,
      installmentValue: "291.67",
      reajustPercent: "5.00",
    },
    items: [
      {
        id: 1,
        description: "Sistema de Contabilidade",
        quantity: 1,
        unitValue: "1500.00",
        totalValue: "1500.00",
      },
      {
        id: 2,
        description: "Sistema de Arrecadação",
        quantity: 1,
        unitValue: "2000.00",
        totalValue: "2000.00",
      },
    ],
    terms: [
      {
        id: 1,
        termType: "initial",
        termNumber: 0,
        termDate: "2026-01-03",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        totalValue: "3300.00",
        installments: 12,
        installmentValue: "275.00",
        reajustIndex: "IPCA",
        reajustPercent: "0.00",
        notes: "Termo inicial.",
      },
      {
        id: 2,
        termType: "additive",
        termNumber: 1,
        termDate: "2026-06-01",
        startDate: "2026-06-01",
        endDate: "2026-12-31",
        totalValue: "3500.00",
        installments: 12,
        installmentValue: "291.67",
        reajustIndex: "IPCA",
        reajustPercent: "5.00",
        notes: "1º Termo Aditivo com reajuste.",
      },
    ],
  },
  {
    id: 2,
    contractNumber: "002",
    year: 2026,
    clientName: "Câmara Municipal de Paraíba do Sul",
    cnpj: "29.138.385/0001-30",
    object: "Fornecimento de sistemas administrativos e suporte técnico.",
    status: "Vigente",
    reajustIndex: "IGPM",
    signatureDate: "2026-02-10",
    currentTerm: {
      termType: "initial",
      termNumber: 0,
      totalValue: "2200.00",
      startDate: "2026-02-10",
      endDate: "2026-12-31",
      installments: 10,
      installmentValue: "220.00",
      reajustPercent: "0.00",
    },
    items: [
      {
        id: 1,
        description: "Sistema de Pessoal",
        quantity: 1,
        unitValue: "1200.00",
        totalValue: "1200.00",
      },
      {
        id: 2,
        description: "Sistema de Tesouraria",
        quantity: 1,
        unitValue: "1000.00",
        totalValue: "1000.00",
      },
    ],
    terms: [
      {
        id: 3,
        termType: "initial",
        termNumber: 0,
        termDate: "2026-02-10",
        startDate: "2026-02-10",
        endDate: "2026-12-31",
        totalValue: "2200.00",
        installments: 10,
        installmentValue: "220.00",
        reajustIndex: "IGPM",
        reajustPercent: "0.00",
        notes: "Termo inicial.",
      },
    ],
  },
  {
    id: 3,
    contractNumber: "015",
    year: 2025,
    clientName: "Município de Santa Maria Madalena",
    cnpj: "28.741.736/0001-85",
    object: "Implantação, treinamento e manutenção de sistemas.",
    status: "Encerrado",
    reajustIndex: "IPCA",
    signatureDate: "2025-01-15",
    currentTerm: {
      termType: "additive",
      termNumber: 2,
      totalValue: "4800.00",
      startDate: "2025-01-15",
      endDate: "2025-12-31",
      installments: 12,
      installmentValue: "400.00",
      reajustPercent: "4.20",
    },
    items: [
      {
        id: 1,
        description: "Sistema Tributário",
        quantity: 1,
        unitValue: "2500.00",
        totalValue: "2500.00",
      },
      {
        id: 2,
        description: "Portal da Transparência",
        quantity: 1,
        unitValue: "2300.00",
        totalValue: "2300.00",
      },
    ],
    terms: [
      {
        id: 4,
        termType: "initial",
        termNumber: 0,
        termDate: "2025-01-15",
        startDate: "2025-01-15",
        endDate: "2025-12-31",
        totalValue: "4500.00",
        installments: 12,
        installmentValue: "375.00",
        reajustIndex: "IPCA",
        reajustPercent: "0.00",
        notes: "Termo inicial.",
      },
      {
        id: 5,
        termType: "additive",
        termNumber: 1,
        termDate: "2025-06-01",
        startDate: "2025-06-01",
        endDate: "2025-12-31",
        totalValue: "4650.00",
        installments: 12,
        installmentValue: "387.50",
        reajustIndex: "IPCA",
        reajustPercent: "3.30",
        notes: "1º Termo Aditivo.",
      },
      {
        id: 6,
        termType: "additive",
        termNumber: 2,
        termDate: "2025-09-01",
        startDate: "2025-09-01",
        endDate: "2025-12-31",
        totalValue: "4800.00",
        installments: 12,
        installmentValue: "400.00",
        reajustIndex: "IPCA",
        reajustPercent: "4.20",
        notes: "2º Termo Aditivo.",
      },
    ],
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

function getTermLabel(term?: { termType?: string; termNumber?: number }) {
  if (!term) return "-";
  if (term.termType === "initial") return "Termo Inicial";
  return `${term.termNumber}º Termo Aditivo`;
}

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [usingMockData, setUsingMockData] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [editingContractId, setEditingContractId] = useState<number | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

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

  const [termForm, setTermForm] = useState({
    termDate: "",
    startDate: "",
    endDate: "",
    reajustIndex: "IPCA",
    reajustPercent: "",
    installments: 12,
    notes: "",
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
    setEditingContractId(null);
  }

  function resetTermForm(contract?: Contract | null) {
    setTermForm({
      termDate: "",
      startDate: contract?.currentTerm?.startDate ?? "",
      endDate: contract?.currentTerm?.endDate ?? "",
      reajustIndex: contract?.reajustIndex ?? "IPCA",
      reajustPercent: "",
      installments: contract?.currentTerm?.installments ?? 12,
      notes: "",
    });
  }

  function closeFormModal() {
    setShowForm(false);
    resetForm();
  }

  function closeViewModal() {
    setShowViewModal(false);
    setSelectedContract(null);
  }

  function closeTermModal() {
    setShowTermModal(false);
    resetTermForm(null);
  }

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

  function openNewContractModal() {
    resetForm();
    setErrorMessage(
      usingMockData
        ? "Modo visual ativo: os contratos cadastrados agora são fictícios e servem apenas para pré-visualização."
        : "",
    );
    setShowForm(true);
  }

  function openEditModal(contract: Contract) {
    setEditingContractId(contract.id);
    setForm({
      contractNumber: contract.contractNumber,
      year: contract.year,
      clientName: contract.clientName,
      cnpj: contract.cnpj,
      object: contract.object,
      reajustIndex: contract.reajustIndex ?? "IPCA",
      signatureDate: contract.signatureDate ?? "",
      startDate: contract.currentTerm?.startDate ?? "",
      endDate: contract.currentTerm?.endDate ?? "",
      installments: contract.currentTerm?.installments ?? 12,
      items:
        contract.items?.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitValue: Number(item.unitValue).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        })) ?? [{ description: "", quantity: 1, unitValue: "" }],
    });
    setShowForm(true);
  }

  function openViewModal(contract: Contract) {
    setSelectedContract(contract);
    setShowViewModal(true);
  }

  function openTermModal(contract: Contract) {
    setSelectedContract(contract);
    resetTermForm(contract);
    setShowTermModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!form.contractNumber.trim()) {
      setErrorMessage("Informe o número do contrato.");
      return;
    }

    if (!form.clientName.trim()) {
      setErrorMessage("Informe o município/cliente.");
      return;
    }

    if (!form.cnpj.trim()) {
      setErrorMessage("Informe o CNPJ.");
      return;
    }

    if (!form.object.trim()) {
      setErrorMessage("Informe o objeto.");
      return;
    }

    if (!form.signatureDate) {
      setErrorMessage("Informe a data de assinatura.");
      return;
    }

    if (!form.startDate) {
      setErrorMessage("Informe a vigência inicial.");
      return;
    }

    if (!form.endDate) {
      setErrorMessage("Informe a vigência final.");
      return;
    }

    if (!form.installments || form.installments < 1 || form.installments > 12) {
      setErrorMessage("A quantidade de parcelas deve ser entre 1 e 12.");
      return;
    }

    const normalizedItems = form.items.map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitValue: parseMoney(item.unitValue),
    }));

    if (normalizedItems.some((item) => !item.description)) {
      setErrorMessage("Preencha a descrição de todos os itens.");
      return;
    }

    if (normalizedItems.some((item) => !item.quantity || item.quantity <= 0)) {
      setErrorMessage("A quantidade dos itens deve ser maior que zero.");
      return;
    }

    const totalValue = normalizedItems.reduce((total, item) => {
      return total + item.quantity * item.unitValue;
    }, 0);

    if (usingMockData) {
      const fakeContract: Contract = {
        id: editingContractId ?? Date.now(),
        contractNumber: form.contractNumber,
        year: form.year,
        clientName: form.clientName,
        cnpj: form.cnpj,
        object: form.object,
        status: "Vigente",
        reajustIndex: form.reajustIndex,
        signatureDate: form.signatureDate,
        currentTerm: {
          termType: "initial",
          termNumber: 0,
          totalValue: totalValue.toFixed(2),
          startDate: form.startDate,
          endDate: form.endDate,
          installments: form.installments,
          installmentValue: (totalValue / form.installments).toFixed(2),
          reajustPercent: "0.00",
        },
        items: normalizedItems.map((item, index) => ({
          id: index + 1,
          description: item.description,
          quantity: item.quantity,
          unitValue: item.unitValue.toFixed(2),
          totalValue: (item.quantity * item.unitValue).toFixed(2),
        })),
        terms: [
          {
            id: 1,
            termType: "initial",
            termNumber: 0,
            termDate: form.signatureDate,
            startDate: form.startDate,
            endDate: form.endDate,
            totalValue: totalValue.toFixed(2),
            installments: form.installments,
            installmentValue: (totalValue / form.installments).toFixed(2),
            reajustIndex: form.reajustIndex,
            reajustPercent: "0.00",
            notes: "Termo inicial.",
          },
        ],
      };

      if (editingContractId) {
        setContracts((prev) =>
          prev.map((item) => (item.id === editingContractId ? fakeContract : item)),
        );
      } else {
        setContracts((prev) => [fakeContract, ...prev]);
      }

      closeFormModal();
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        items: normalizedItems,
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

      closeFormModal();
      await loadContracts();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Erro ao salvar contrato.");
    } finally {
      setSaving(false);
    }
  }

  function handleCreateTerm(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedContract) return;

    const reajustPercentNumber = parseMoney(termForm.reajustPercent || "0");
    const currentValue = Number(selectedContract.currentTerm?.totalValue ?? 0);
    const newValue = currentValue * (1 + reajustPercentNumber / 100);

    const nextTermNumber =
      (selectedContract.terms?.filter((term) => term.termType === "additive").length ?? 0) + 1;

    const newTerm: ContractTerm = {
      id: Date.now(),
      termType: "additive",
      termNumber: nextTermNumber,
      termDate: termForm.termDate,
      startDate: termForm.startDate,
      endDate: termForm.endDate,
      totalValue: newValue.toFixed(2),
      installments: Number(termForm.installments),
      installmentValue: (newValue / Number(termForm.installments)).toFixed(2),
      reajustIndex: termForm.reajustIndex,
      reajustPercent: reajustPercentNumber.toFixed(2),
      notes: termForm.notes,
    };

    if (usingMockData) {
      const updatedContract: Contract = {
        ...selectedContract,
        currentTerm: {
          termType: "additive",
          termNumber: nextTermNumber,
          totalValue: newValue.toFixed(2),
          startDate: termForm.startDate,
          endDate: termForm.endDate,
          installments: Number(termForm.installments),
          installmentValue: (newValue / Number(termForm.installments)).toFixed(2),
          reajustPercent: reajustPercentNumber.toFixed(2),
        },
        terms: [...(selectedContract.terms ?? []), newTerm],
      };

      setContracts((prev) =>
        prev.map((item) => (item.id === selectedContract.id ? updatedContract : item)),
      );
      setSelectedContract(updatedContract);
      closeTermModal();
      return;
    }

    setErrorMessage("O termo aditivo real será ativado após a configuração do banco.");
    closeTermModal();
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
            onClick={openNewContractModal}
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
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Ações</th>
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
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openViewModal(contract)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition"
                        >
                          <Eye size={14} />
                          Ver
                        </button>

                        <button
                          onClick={() => openEditModal(contract)}
                          className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium px-3 py-2 rounded-lg transition"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>

                        <button
                          onClick={() => openTermModal(contract)}
                          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg transition"
                        >
                          <FilePlus2 size={14} />
                          + Termo
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

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingContractId ? "Editar Contrato" : "Cadastro de Contrato"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Preencha os dados principais e os itens do contrato.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
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
                      ? editingContractId
                        ? "Salvar edição"
                        : "Salvar visualização"
                      : saving
                        ? "Salvando..."
                        : "Salvar contrato"}
                  </button>

                  <button
                    type="button"
                    onClick={closeFormModal}
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

      {showViewModal && selectedContract && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Visualização do Contrato
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Dados gerais, termo atual, itens e histórico.
                </p>
              </div>

              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-xl p-2 hover:bg-slate-100 transition"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Nº do contrato</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {selectedContract.contractNumber}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Ano</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {selectedContract.year}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {selectedContract.status}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Índice</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {selectedContract.reajustIndex ?? "-"}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4">
                  Dados do contrato
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Município / cliente:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {selectedContract.clientName}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">CNPJ:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {selectedContract.cnpj}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">Data de assinatura:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {selectedContract.signatureDate ?? "-"}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">Objeto:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {selectedContract.object}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4">
                  Termo atual
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Tipo:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {getTermLabel(selectedContract.currentTerm)}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">Valor global:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {formatMoney(selectedContract.currentTerm?.totalValue)}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">Parcelas:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {selectedContract.currentTerm?.installments ?? "-"}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">Valor da parcela:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {formatMoney(selectedContract.currentTerm?.installmentValue)}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">Vigência inicial:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {selectedContract.currentTerm?.startDate ?? "-"}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">Vigência final:</span>
                    <div className="font-medium text-slate-900 mt-1">
                      {selectedContract.currentTerm?.endDate ?? "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4">
                  Itens do contrato
                </h4>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">
                          Descrição
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">
                          Quantidade
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">
                          Valor unitário
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedContract.items ?? []).map((item) => (
                        <tr key={item.id} className="border-t border-slate-200">
                          <td className="px-4 py-3 text-slate-700">{item.description}</td>
                          <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatMoney(item.unitValue)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatMoney(item.totalValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4">
                  Histórico de termos
                </h4>

                <div className="space-y-3">
                  {(selectedContract.terms ?? []).map((term) => (
                    <div
                      key={term.id}
                      className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {term.termType === "initial"
                            ? "Termo Inicial"
                            : `${term.termNumber}º Termo Aditivo`}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {term.startDate} até {term.endDate}
                        </p>
                      </div>

                      <div className="text-sm text-slate-700">
                        <div>Valor: {formatMoney(term.totalValue)}</div>
                        <div>Parcelas: {term.installments}</div>
                        <div>Reajuste: {term.reajustPercent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    closeViewModal();
                    openEditModal(selectedContract);
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Editar contrato
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeViewModal();
                    openTermModal(selectedContract);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Novo termo aditivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTermModal && selectedContract && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Novo Termo Aditivo
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedContract.contractNumber} - {selectedContract.clientName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeTermModal}
                className="rounded-xl p-2 hover:bg-slate-100 transition"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">
                Esta tela está em modo de visualização. O termo será criado de forma fictícia para você validar o fluxo.
              </div>

              <form onSubmit={handleCreateTerm} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Próximo termo
                    </label>
                    <input
                      disabled
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={`${
                        (selectedContract.terms?.filter((term) => term.termType === "additive").length ?? 0) + 1
                      }º Termo Aditivo`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Índice
                    </label>
                    <select
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={termForm.reajustIndex}
                      onChange={(e) =>
                        setTermForm((prev) => ({ ...prev, reajustIndex: e.target.value }))
                      }
                    >
                      <option value="IPCA">IPCA</option>
                      <option value="IGPM">IGPM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Data do termo
                    </label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={termForm.termDate}
                      onChange={(e) =>
                        setTermForm((prev) => ({ ...prev, termDate: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vigência inicial
                    </label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={termForm.startDate}
                      onChange={(e) =>
                        setTermForm((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vigência final
                    </label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={termForm.endDate}
                      onChange={(e) =>
                        setTermForm((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Percentual de reajuste
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex.: 5,00"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={termForm.reajustPercent}
                      onChange={(e) =>
                        setTermForm((prev) => ({
                          ...prev,
                          reajustPercent: e.target.value,
                        }))
                      }
                    />
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
                      value={termForm.installments}
                      onChange={(e) =>
                        setTermForm((prev) => ({
                          ...prev,
                          installments: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Valor atual:</span>
                    <span className="font-medium text-slate-900">
                      {formatMoney(selectedContract.currentTerm?.totalValue)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Novo valor estimado:</span>
                    <span className="font-medium text-slate-900">
                      {formatMoney(
                        (
                          Number(selectedContract.currentTerm?.totalValue ?? 0) *
                          (1 + parseMoney(termForm.reajustPercent || "0") / 100)
                        ).toFixed(2),
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Valor estimado da parcela:</span>
                    <span className="font-medium text-slate-900">
                      {formatMoney(
                        (
                          (Number(selectedContract.currentTerm?.totalValue ?? 0) *
                            (1 + parseMoney(termForm.reajustPercent || "0") / 100)) /
                          Number(termForm.installments || 1)
                        ).toFixed(2),
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Observação
                  </label>
                  <textarea
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm min-h-[90px]"
                    value={termForm.notes}
                    onChange={(e) =>
                      setTermForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    Salvar termo fictício
                  </button>

                  <button
                    type="button"
                    onClick={closeTermModal}
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
