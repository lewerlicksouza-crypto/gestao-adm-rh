import { useEffect, useMemo, useState } from "react";
import {
  X,
  Eye,
  Pencil,
  FilePlus2,
  Trash2,
  Search,
  Filter,
  FileText,
  Landmark,
  CalendarDays,
  BadgeDollarSign,
} from "lucide-react";

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

type ViewTab = "general" | "items" | "terms";
type StatusFilter = "Todos" | "Vigente" | "Encerrado";

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

function getStatusBadgeClass(status: string) {
  return status === "Vigente"
    ? "bg-blue-50 text-blue-700"
    : "bg-slate-100 text-slate-700";
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
  const [viewTab, setViewTab] = useState<ViewTab>("general");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");

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
    setViewTab("general");
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
    setViewTab("general");
    setShowViewModal(true);
  }

  function openTermModal(contract: Contract) {
    setSelectedContract(contract);
    resetTermForm(contract);
    setShowTermModal(true);
  }

  function handleDeleteContract(contractId: number) {
    const confirmed = window.confirm(
      "Deseja excluir este contrato fictício da visualização?",
    );

    if (!confirmed) return;

    setContracts((prev) => prev.filter((item) => item.id !== contractId));

    if (selectedContract?.id === contractId) {
      closeViewModal();
    }
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

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const matchesSearch =
        !search.trim() ||
        contract.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
        contract.clientName.toLowerCase().includes(search.toLowerCase()) ||
        contract.cnpj.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "Todos" || contract.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contracts, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: filteredContracts.length,
      vigentes: filteredContracts.filter((item) => item.status === "Vigente").length,
      encerrados: filteredContracts.filter((item) => item.status === "Encerrado").length,
    };
  }, [filteredContracts]);

  const additiveTerms =
    selectedContract?.terms?.filter((term) => term.termType === "additive") ?? [];

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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-sm"
              placeholder="Buscar por número, município ou CNPJ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              className="w-full border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-sm appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="Todos">Todos os status</option>
              <option value="Vigente">Vigente</option>
              <option value="Encerrado">Encerrado</option>
            </select>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("Todos");
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total de contratos</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{summary.total}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Vigentes</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{summary.vigentes}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Encerrados</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{summary.encerrados}</p>
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
        ) : filteredContracts.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            Nenhum contrato encontrado com os filtros informados.
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
                {filteredContracts.map((contract) => (
                  <tr
