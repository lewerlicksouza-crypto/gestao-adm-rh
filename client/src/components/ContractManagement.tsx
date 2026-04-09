import { useEffect, useMemo, useState } from "react";
import {
  X,
  Eye,
  Pencil,
  FilePlus2,
  Trash2,
  Search,
  Filter,
  Plus,
  Building2,
} from "lucide-react";

type CompanyName = "Conta Soluções" | "Conta Pública" | "Idel Soluções";

type ContractManagementProps = {
  companyName: CompanyName;
};

type ContractCurrentTerm = {
  termType?: string;
  termNumber?: number;
  totalValue: string;
  endDate: string;
  startDate?: string;
  installments?: number;
  installmentValue?: string;
  reajustPercent?: string;
};

type ContractGroupItem = {
  id: number;
  description: string;
  quantity: number;
  unitValue: string;
  totalValue: string;
};

type ContractGroup = {
  id: number;
  name: string;
  items: ContractGroupItem[];
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

type Contract = {
  id: number;
  companyName: CompanyName;
  contractNumber: string;
  year: number;
  clientName: string;
  cnpj: string;
  object: string;
  status: string;
  reajustIndex?: string;
  signatureDate?: string;
  initialTerm?: ContractTerm;
  currentTerm?: ContractCurrentTerm;
  initialGroups?: ContractGroup[];
  groups?: ContractGroup[];
  terms?: ContractTerm[];
};

type ContractFormGroupItem = {
  description: string;
  quantity: number;
  unitValue: string;
};

type ContractFormGroup = {
  name: string;
  items: ContractFormGroupItem[];
};

type ViewTab = "general" | "items" | "terms";
type StatusFilter = "Todos" | "Vigente" | "Encerrado";

const defaultGroupName = "Prefeitura Municipal";

const mockContracts: Contract[] = [
  {
    id: 1,
    companyName: "Conta Soluções",
    contractNumber: "008",
    year: 2026,
    clientName: "Município de Areal",
    cnpj: "39.560.000/0001-00",
    object: "Licenciamento de sistemas de gestão pública municipal.",
    status: "Vigente",
    reajustIndex: "IPCA",
    signatureDate: "2026-01-03",
    initialTerm: {
      id: 1,
      termType: "initial",
      termNumber: 0,
      termDate: "2026-01-03",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      totalValue: "11880.00",
      installments: 12,
      installmentValue: "990.00",
      reajustIndex: "IPCA",
      reajustPercent: "0.00",
      notes: "Termo inicial.",
    },
    currentTerm: {
      termType: "additive",
      termNumber: 1,
      totalValue: "12474.00",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      installments: 12,
      installmentValue: "1039.50",
      reajustPercent: "5.00",
    },
    initialGroups: [
      {
        id: 1,
        name: "Prefeitura Municipal",
        items: [
          {
            id: 1,
            description: "Sistema de Contabilidade",
            quantity: 12,
            unitValue: "300.00",
            totalValue: "3600.00",
          },
          {
            id: 2,
            description: "Sistema de Tesouraria",
            quantity: 12,
            unitValue: "200.00",
            totalValue: "2400.00",
          },
        ],
      },
      {
        id: 2,
        name: "Fundo Municipal de Saúde",
        items: [
          {
            id: 1,
            description: "Sistema de Contabilidade",
            quantity: 12,
            unitValue: "120.00",
            totalValue: "1440.00",
          },
          {
            id: 2,
            description: "Sistema de Pessoal",
            quantity: 12,
            unitValue: "95.00",
            totalValue: "1140.00",
          },
        ],
      },
      {
        id: 3,
        name: "Câmara Municipal",
        items: [
          {
            id: 1,
            description: "Portal da Transparência",
            quantity: 12,
            unitValue: "275.00",
            totalValue: "3300.00",
          },
        ],
      },
    ],
    groups: [
      {
        id: 1,
        name: "Prefeitura Municipal",
        items: [
          {
            id: 1,
            description: "Sistema de Contabilidade",
            quantity: 12,
            unitValue: "315.00",
            totalValue: "3780.00",
          },
          {
            id: 2,
            description: "Sistema de Tesouraria",
            quantity: 12,
            unitValue: "210.00",
            totalValue: "2520.00",
          },
        ],
      },
      {
        id: 2,
        name: "Fundo Municipal de Saúde",
        items: [
          {
            id: 1,
            description: "Sistema de Contabilidade",
            quantity: 12,
            unitValue: "126.00",
            totalValue: "1512.00",
          },
          {
            id: 2,
            description: "Sistema de Pessoal",
            quantity: 12,
            unitValue: "99.75",
            totalValue: "1197.00",
          },
        ],
      },
      {
        id: 3,
        name: "Câmara Municipal",
        items: [
          {
            id: 1,
            description: "Portal da Transparência",
            quantity: 12,
            unitValue: "288.75",
            totalValue: "3465.00",
          },
        ],
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
        totalValue: "11880.00",
        installments: 12,
        installmentValue: "990.00",
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
        totalValue: "12474.00",
        installments: 12,
        installmentValue: "1039.50",
        reajustIndex: "IPCA",
        reajustPercent: "5.00",
        notes: "1º Termo Aditivo com reajuste.",
      },
    ],
  },
  {
    id: 2,
    companyName: "Conta Pública",
    contractNumber: "014",
    year: 2026,
    clientName: "Município de Carmo",
    cnpj: "28.645.122/0001-10",
    object: "Assessoria técnica em gestão pública e acompanhamento administrativo.",
    status: "Vigente",
    reajustIndex: "IGPM",
    signatureDate: "2026-02-15",
    initialTerm: {
      id: 3,
      termType: "initial",
      termNumber: 0,
      termDate: "2026-02-15",
      startDate: "2026-02-15",
      endDate: "2027-02-14",
      totalValue: "9600.00",
      installments: 12,
      installmentValue: "800.00",
      reajustIndex: "IGPM",
      reajustPercent: "0.00",
      notes: "Termo inicial.",
    },
    currentTerm: {
      termType: "initial",
      termNumber: 0,
      totalValue: "9600.00",
      startDate: "2026-02-15",
      endDate: "2027-02-14",
      installments: 12,
      installmentValue: "800.00",
      reajustPercent: "0.00",
    },
    initialGroups: [
      {
        id: 1,
        name: "Prefeitura Municipal",
        items: [
          {
            id: 1,
            description: "Assessoria Administrativa",
            quantity: 12,
            unitValue: "500.00",
            totalValue: "6000.00",
          },
        ],
      },
      {
        id: 2,
        name: "Câmara Municipal",
        items: [
          {
            id: 1,
            description: "Assessoria Legislativa",
            quantity: 12,
            unitValue: "300.00",
            totalValue: "3600.00",
          },
        ],
      },
    ],
    groups: [
      {
        id: 1,
        name: "Prefeitura Municipal",
        items: [
          {
            id: 1,
            description: "Assessoria Administrativa",
            quantity: 12,
            unitValue: "500.00",
            totalValue: "6000.00",
          },
        ],
      },
      {
        id: 2,
        name: "Câmara Municipal",
        items: [
          {
            id: 1,
            description: "Assessoria Legislativa",
            quantity: 12,
            unitValue: "300.00",
            totalValue: "3600.00",
          },
        ],
      },
    ],
    terms: [
      {
        id: 3,
        termType: "initial",
        termNumber: 0,
        termDate: "2026-02-15",
        startDate: "2026-02-15",
        endDate: "2027-02-14",
        totalValue: "9600.00",
        installments: 12,
        installmentValue: "800.00",
        reajustIndex: "IGPM",
        reajustPercent: "0.00",
        notes: "Termo inicial.",
      },
    ],
  },
  {
    id: 3,
    companyName: "Idel Soluções",
    contractNumber: "021",
    year: 2025,
    clientName: "Município de Trajano de Moraes",
    cnpj: "29.114.673/0001-55",
    object: "Serviços técnicos especializados de apoio à administração pública.",
    status: "Encerrado",
    reajustIndex: "IPCA",
    signatureDate: "2025-01-10",
    initialTerm: {
      id: 4,
      termType: "initial",
      termNumber: 0,
      termDate: "2025-01-10",
      startDate: "2025-01-10",
      endDate: "2025-12-31",
      totalValue: "8400.00",
      installments: 12,
      installmentValue: "700.00",
      reajustIndex: "IPCA",
      reajustPercent: "0.00",
      notes: "Termo inicial.",
    },
    currentTerm: {
      termType: "additive",
      termNumber: 1,
      totalValue: "8820.00",
      startDate: "2025-01-10",
      endDate: "2025-12-31",
      installments: 12,
      installmentValue: "735.00",
      reajustPercent: "5.00",
    },
    initialGroups: [
      {
        id: 1,
        name: "Prefeitura Municipal",
        items: [
          {
            id: 1,
            description: "Assessoria Contábil",
            quantity: 12,
            unitValue: "400.00",
            totalValue: "4800.00",
          },
        ],
      },
      {
        id: 2,
        name: "Fundo Municipal de Saúde",
        items: [
          {
            id: 1,
            description: "Assessoria em Prestação de Contas",
            quantity: 12,
            unitValue: "300.00",
            totalValue: "3600.00",
          },
        ],
      },
    ],
    groups: [
      {
        id: 1,
        name: "Prefeitura Municipal",
        items: [
          {
            id: 1,
            description: "Assessoria Contábil",
            quantity: 12,
            unitValue: "420.00",
            totalValue: "5040.00",
          },
        ],
      },
      {
        id: 2,
        name: "Fundo Municipal de Saúde",
        items: [
          {
            id: 1,
            description: "Assessoria em Prestação de Contas",
            quantity: 12,
            unitValue: "315.00",
            totalValue: "3780.00",
          },
        ],
      },
    ],
    terms: [
      {
        id: 4,
        termType: "initial",
        termNumber: 0,
        termDate: "2025-01-10",
        startDate: "2025-01-10",
        endDate: "2025-12-31",
        totalValue: "8400.00",
        installments: 12,
        installmentValue: "700.00",
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
        totalValue: "8820.00",
        installments: 12,
        installmentValue: "735.00",
        reajustIndex: "IPCA",
        reajustPercent: "5.00",
        notes: "1º Termo Aditivo.",
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

function formatMoney(value?: string | number) {
  if (value === undefined || value === null || value === "") return "-";
  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) return String(value);

  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateBR(value?: string) {
  if (!value) return "-";

  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR");
}

function getTermLabel(term?: { termType?: string; termNumber?: number }) {
  if (!term) return "-";
  if (term.termType === "initial") return "Inicial";
  return `${term.termNumber}º Aditivo`;
}

function getStatusBadgeClass(status: string) {
  return status === "Vigente"
    ? "bg-blue-50 text-blue-700"
    : "bg-slate-100 text-slate-700";
}

function calculateDifference(current?: string, initial?: string) {
  const currentValue = Number(current ?? 0);
  const initialValue = Number(initial ?? 0);
  return currentValue - initialValue;
}

function calculatePercentDifference(current?: string, initial?: string) {
  const currentValue = Number(current ?? 0);
  const initialValue = Number(initial ?? 0);

  if (!initialValue) return 0;
  return ((currentValue - initialValue) / initialValue) * 100;
}

function getGroupTotal(group: ContractFormGroup | ContractGroup) {
  return group.items.reduce((total, item) => {
    const quantity = Number(item.quantity || 0);
    const unitValue =
      "totalValue" in item
        ? Number(item.totalValue) / (quantity || 1)
        : parseMoney(item.unitValue);

    return total + quantity * unitValue;
  }, 0);
}

function getContractTotal(
  groups: Array<ContractFormGroup | ContractGroup> | undefined,
) {
  if (!groups?.length) return 0;
  return groups.reduce((total, group) => total + getGroupTotal(group), 0);
}

function createEmptyGroup(name = defaultGroupName): ContractFormGroup {
  return {
    name,
    items: [{ description: "", quantity: 1, unitValue: "" }],
  };
}

function normalizeContractGroups(groups?: ContractGroup[]) {
  return (
    groups?.map((group) => ({
      name: group.name,
      items: group.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitValue: Number(item.unitValue).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      })),
    })) ?? [createEmptyGroup()]
  );
}

export default function ContractManagement({
  companyName,
}: ContractManagementProps) {
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
    companyName,
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
    groups: [createEmptyGroup()] as ContractFormGroup[],
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

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      companyName,
    }));
  }, [companyName]);

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
      companyName,
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
      groups: [createEmptyGroup()],
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

  function handleChange(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleGroupChange(
    groupIndex: number,
    field: keyof ContractFormGroup,
    value: string,
  ) {
    const updated = [...form.groups];
    updated[groupIndex] = {
      ...updated[groupIndex],
      [field]: value,
    };

    setForm((prev) => ({ ...prev, groups: updated }));
  }

  function handleItemChange(
    groupIndex: number,
    itemIndex: number,
    field: keyof ContractFormGroupItem,
    value: string | number,
  ) {
    const updated = [...form.groups];
    updated[groupIndex].items[itemIndex] = {
      ...updated[groupIndex].items[itemIndex],
      [field]: value,
    };

    setForm((prev) => ({ ...prev, groups: updated }));
  }

  function addGroup() {
    setForm((prev) => ({
      ...prev,
      groups: [...prev.groups, createEmptyGroup("Nova unidade")],
    }));
  }

  function removeGroup(groupIndex: number) {
    if (form.groups.length === 1) return;

    setForm((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, index) => index !== groupIndex),
    }));
  }

  function addItem(groupIndex: number) {
    const updated = [...form.groups];
    updated[groupIndex].items.push({
      description: "",
      quantity: 1,
      unitValue: "",
    });

    setForm((prev) => ({
      ...prev,
      groups: updated,
    }));
  }

  function removeItem(groupIndex: number, itemIndex: number) {
    const updated = [...form.groups];
    if (updated[groupIndex].items.length === 1) return;

    updated[groupIndex].items = updated[groupIndex].items.filter(
      (_, index) => index !== itemIndex,
    );

    setForm((prev) => ({
      ...prev,
      groups: updated,
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
      companyName: contract.companyName,
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
      groups: normalizeContractGroups(contract.groups),
    });
    setShowForm(true);
  }

  function openViewModal(contract: Contract) {
    setSelectedContract(contract);
    setViewTab("general");
    setShowViewModal(true);
  }

  function openTermModal(contract: Contract) {
    if (contract.status === "Encerrado") {
      setErrorMessage("Não é possível criar termo para contrato encerrado.");
      return;
    }

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

    if (!form.groups.length) {
      setErrorMessage("Adicione ao menos um órgão/unidade.");
      return;
    }

    const normalizedGroups = form.groups.map((group, groupIndex) => ({
      id: groupIndex + 1,
      name: group.name.trim(),
      items: group.items.map((item, itemIndex) => {
        const quantity = Number(item.quantity);
        const unitValue = parseMoney(item.unitValue);

        return {
          id: itemIndex + 1,
          description: item.description.trim(),
          quantity,
          unitValue: unitValue.toFixed(2),
          totalValue: (quantity * unitValue).toFixed(2),
        };
      }),
    }));

    if (normalizedGroups.some((group) => !group.name)) {
      setErrorMessage("Preencha o nome de todos os órgãos/unidades.");
      return;
    }

    if (
      normalizedGroups.some(
        (group) => !group.items.length || group.items.some((item) => !item.description),
      )
    ) {
      setErrorMessage("Preencha a descrição de todos os itens.");
      return;
    }

    if (
      normalizedGroups.some((group) =>
        group.items.some((item) => !item.quantity || item.quantity <= 0),
      )
    ) {
      setErrorMessage("A quantidade dos itens deve ser maior que zero.");
      return;
    }

    if (
      normalizedGroups.some((group) =>
        group.items.some((item) => Number(item.unitValue) <= 0),
      )
    ) {
      setErrorMessage("O valor unitário dos itens deve ser maior que zero.");
      return;
    }

    const totalValue = normalizedGroups.reduce((groupAcc, group) => {
      return (
        groupAcc +
        group.items.reduce(
          (itemAcc, item) => itemAcc + Number(item.quantity) * Number(item.unitValue),
          0,
        )
      );
    }, 0);

    if (usingMockData) {
      const fakeContract: Contract = {
        id: editingContractId ?? Date.now(),
        companyName,
        contractNumber: form.contractNumber,
        year: form.year,
        clientName: form.clientName,
        cnpj: form.cnpj,
        object: form.object,
        status: "Vigente",
        reajustIndex: form.reajustIndex,
        signatureDate: form.signatureDate,
        initialTerm: {
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
        initialGroups: normalizedGroups,
        groups: normalizedGroups,
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
        groups: normalizedGroups,
      };

      const res = await fetch("/api/contracts", {
        method: editingContractId ? "PUT" : "POST",
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

    if (!termForm.termDate || !termForm.startDate || !termForm.endDate) {
      setErrorMessage("Preencha as datas do termo aditivo.");
      return;
    }

    if (
      !termForm.installments ||
      Number(termForm.installments) < 1 ||
      Number(termForm.installments) > 12
    ) {
      setErrorMessage("As parcelas do termo devem ser entre 1 e 12.");
      return;
    }

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
      const initialGroups = selectedContract.initialGroups ?? selectedContract.groups ?? [];
      const currentGroups = selectedContract.groups ?? [];

      const updatedGroups = currentGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          const updatedUnitValue =
            Number(item.unitValue) * (1 + reajustPercentNumber / 100);
          const updatedTotalValue = updatedUnitValue * item.quantity;

          return {
            ...item,
            unitValue: updatedUnitValue.toFixed(2),
            totalValue: updatedTotalValue.toFixed(2),
          };
        }),
      }));

      const updatedContract: Contract = {
        ...selectedContract,
        reajustIndex: termForm.reajustIndex,
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
        initialGroups,
        groups: updatedGroups,
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

  const companyContracts = useMemo(() => {
    return contracts.filter((contract) => contract.companyName === companyName);
  }, [contracts, companyName]);

  const filteredContracts = useMemo(() => {
    return companyContracts.filter((contract) => {
      const matchesSearch =
        !search.trim() ||
        contract.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
        contract.clientName.toLowerCase().includes(search.toLowerCase()) ||
        contract.cnpj.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "Todos" || contract.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [companyContracts, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: filteredContracts.length,
      vigentes: filteredContracts.filter((item) => item.status === "Vigente").length,
      encerrados: filteredContracts.filter((item) => item.status === "Encerrado").length,
    };
  }, [filteredContracts]);

  const additiveTerms =
    selectedContract?.terms?.filter((term) => term.termType === "additive") ?? [];

  const contractInitialValue = selectedContract?.initialTerm?.totalValue ?? "0.00";
  const contractCurrentValue = selectedContract?.currentTerm?.totalValue ?? "0.00";
  const contractDifference = calculateDifference(contractCurrentValue, contractInitialValue);
  const contractDifferencePercent = calculatePercentDifference(
    contractCurrentValue,
    contractInitialValue,
  );

  const groupComparisons = useMemo(() => {
    if (!selectedContract) return [];

    const initialGroups = selectedContract.initialGroups ?? [];
    const currentGroups = selectedContract.groups ?? [];

    return currentGroups.map((currentGroup) => {
      const initialGroup = initialGroups.find(
        (group) => group.name === currentGroup.name,
      );

      const itemComparisons = currentGroup.items.map((currentItem) => {
        const initialItem = initialGroup?.items.find(
          (item) => item.description === currentItem.description,
        );

        const initialUnitValue = Number(initialItem?.unitValue ?? 0);
        const currentUnitValue = Number(currentItem.unitValue ?? 0);
        const initialTotalValue = Number(initialItem?.totalValue ?? 0);
        const currentTotalValue = Number(currentItem.totalValue ?? 0);

        return {
          description: currentItem.description,
          quantity: currentItem.quantity,
          initialUnitValue,
          currentUnitValue,
          unitDifference: currentUnitValue - initialUnitValue,
          initialTotalValue,
          currentTotalValue,
          totalDifference: currentTotalValue - initialTotalValue,
        };
      });

      const initialTotal = itemComparisons.reduce(
        (acc, item) => acc + item.initialTotalValue,
        0,
      );
      const currentTotal = itemComparisons.reduce(
        (acc, item) => acc + item.currentTotalValue,
        0,
      );

      return {
        name: currentGroup.name,
        items: itemComparisons,
        initialTotal,
        currentTotal,
        difference: currentTotal - initialTotal,
      };
    });
  }, [selectedContract]);

  const itemsSummary = useMemo(() => {
    const initialTotal = groupComparisons.reduce(
      (acc, group) => acc + group.initialTotal,
      0,
    );
    const currentTotal = groupComparisons.reduce(
      (acc, group) => acc + group.currentTotal,
      0,
    );
    const count = groupComparisons.reduce((acc, group) => acc + group.items.length, 0);

    return {
      count,
      initialTotal,
      currentTotal,
      difference: currentTotal - initialTotal,
    };
  }, [groupComparisons]);

  const formContractTotal = useMemo(() => {
    return getContractTotal(form.groups);
  }, [form.groups]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Contratos - {companyName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie os contratos da empresa selecionada, com órgãos/unidades
              faturadas e termos aditivos.
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
            Nenhum contrato encontrado para {companyName}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Nº</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Ano</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Município
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">CNPJ</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Termo atual
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
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-700">{contract.contractNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{contract.year}</td>
                    <td className="px-4 py-3 text-slate-700">{contract.clientName}</td>
                    <td className="px-4 py-3 text-slate-700">{contract.cnpj}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {getTermLabel(contract.currentTerm)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatMoney(contract.currentTerm?.totalValue)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDateBR(contract.currentTerm?.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                          contract.status,
                        )}`}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(contract)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition"
                          title="Ver"
                        >
                          <Eye size={16} className="text-slate-600" />
                        </button>

                        <button
                          onClick={() => openEditModal(contract)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition"
                          title="Editar"
                        >
                          <Pencil size={16} className="text-slate-600" />
                        </button>

                        <button
                          onClick={() => openTermModal(contract)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition"
                          title="Novo termo"
                        >
                          <FilePlus2 size={16} className="text-slate-600" />
                        </button>

                        <button
                          onClick={() => handleDeleteContract(contract.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition"
                          title="Excluir"
                        >
                          <Trash2 size={16} className="text-red-600" />
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
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingContractId ? "Editar contrato" : "Novo contrato"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Empresa responsável: {companyName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nº do contrato
                  </label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={form.contractNumber}
                    onChange={(e) => handleChange("contractNumber", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Ano
                  </label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={form.year}
                    onChange={(e) => handleChange("year", Number(e.target.value))}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Município / Cliente
                  </label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={form.clientName}
                    onChange={(e) => handleChange("clientName", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    CNPJ
                  </label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={form.cnpj}
                    onChange={(e) => handleChange("cnpj", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Índice
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white"
                    value={form.reajustIndex}
                    onChange={(e) => handleChange("reajustIndex", e.target.value)}
                  >
                    <option value="IPCA">IPCA</option>
                    <option value="IGPM">IGPM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Data de assinatura
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={form.signatureDate}
                    onChange={(e) => handleChange("signatureDate", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Parcelas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={form.installments}
                    onChange={(e) => handleChange("installments", Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Objeto
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm resize-none"
                  value={form.object}
                  onChange={(e) => handleChange("object", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Vigência inicial
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Vigência final
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">
                      Órgãos / unidades faturadas
                    </h4>
                    <p className="text-sm text-slate-500">
                      Separe os itens por prefeitura, fundos, câmara ou outras unidades.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addGroup}
                    className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl transition"
                  >
                    <Plus size={16} />
                    Adicionar órgão/unidade
                  </button>
                </div>

                <div className="space-y-5">
                  {form.groups.map((group, groupIndex) => {
                    const groupTotal = group.items.reduce((acc, item) => {
                      return acc + Number(item.quantity || 0) * parseMoney(item.unitValue);
                    }, 0);

                    return (
                      <div
                        key={groupIndex}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
                      >
                        <div className="px-4 py-4 border-b border-slate-200 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                              <Building2 size={18} className="text-blue-600" />
                            </div>

                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                Nome do órgão / unidade
                              </label>
                              <input
                                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                                value={group.name}
                                onChange={(e) =>
                                  handleGroupChange(groupIndex, "name", e.target.value)
                                }
                                placeholder="Ex.: Prefeitura Municipal"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => addItem(groupIndex)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition"
                            >
                              Adicionar item
                            </button>

                            <button
                              type="button"
                              onClick={() => removeGroup(groupIndex)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium px-3 py-2 rounded-xl transition"
                            >
                              Remover órgão
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left px-4 py-3 font-semibold text-slate-700">
                                  Descrição
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-700 w-28">
                                  Qtd
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-700 w-40">
                                  Valor unit.
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-700 w-40">
                                  Valor total
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-700 w-28">
                                  Ações
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.items.map((item, itemIndex) => {
                                const itemTotal =
                                  Number(item.quantity || 0) * parseMoney(item.unitValue);

                                return (
                                  <tr
                                    key={itemIndex}
                                    className="border-t border-slate-200"
                                  >
                                    <td className="px-4 py-3">
                                      <input
                                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                                        value={item.description}
                                        onChange={(e) =>
                                          handleItemChange(
                                            groupIndex,
                                            itemIndex,
                                            "description",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Descrição do item"
                                      />
                                    </td>

                                    <td className="px-4 py-3">
                                      <input
                                        type="number"
                                        min={1}
                                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                                        value={item.quantity}
                                        onChange={(e) =>
                                          handleItemChange(
                                            groupIndex,
                                            itemIndex,
                                            "quantity",
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-3">
                                      <input
                                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                                        value={item.unitValue}
                                        onChange={(e) =>
                                          handleItemChange(
                                            groupIndex,
                                            itemIndex,
                                            "unitValue",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="0,00"
                                      />
                                    </td>

                                    <td className="px-4 py-3 text-slate-700 font-medium">
                                      {formatMoney(itemTotal)}
                                    </td>

                                    <td className="px-4 py-3">
                                      <button
                                        type="button"
                                        onClick={() => removeItem(groupIndex, itemIndex)}
                                        className="bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium px-3 py-2 rounded-xl transition"
                                      >
                                        Remover
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
                          <div className="text-sm">
                            <span className="text-slate-500 mr-2">Subtotal do órgão:</span>
                            <span className="font-semibold text-slate-900">
                              {formatMoney(groupTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Valor total do contrato</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Soma de todos os órgãos/unidades e seus respectivos itens.
                  </p>
                </div>

                <p className="text-2xl font-bold text-blue-900">
                  {formatMoney(formContractTotal)}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  {saving ? "Salvando..." : editingContractId ? "Salvar alterações" : "Salvar contrato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedContract && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Contrato nº {selectedContract.contractNumber}/{selectedContract.year}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedContract.clientName} • {selectedContract.companyName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeViewModal}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="px-6 pt-5">
              <div className="flex flex-wrap gap-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewTab("general")}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                    viewTab === "general"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Dados gerais
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab("items")}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                    viewTab === "items"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Itens por órgão
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab("terms")}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                    viewTab === "terms"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Histórico de termos
                </button>
              </div>
            </div>

            <div className="p-6">
              {viewTab === "general" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Valor inicial</p>
                      <p className="text-xl font-bold text-slate-900 mt-2">
                        {formatMoney(contractInitialValue)}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Valor atual</p>
                      <p className="text-xl font-bold text-slate-900 mt-2">
                        {formatMoney(contractCurrentValue)}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Diferença</p>
                      <p className="text-xl font-bold text-slate-900 mt-2">
                        {formatMoney(contractDifference)}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Variação</p>
                      <p className="text-xl font-bold text-slate-900 mt-2">
                        {contractDifferencePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                      <h4 className="text-base font-semibold text-slate-900 mb-4">
                        Dados do contrato
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Empresa responsável</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {selectedContract.companyName}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Cliente</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {selectedContract.clientName}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">CNPJ</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {selectedContract.cnpj}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Índice</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {selectedContract.reajustIndex || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {selectedContract.status}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Assinatura</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {formatDateBR(selectedContract.signatureDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Termo atual</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {getTermLabel(selectedContract.currentTerm)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Vigência atual</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {formatDateBR(selectedContract.currentTerm?.startDate)} até{" "}
                            {formatDateBR(selectedContract.currentTerm?.endDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Parcelas</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {selectedContract.currentTerm?.installments ?? "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                      <h4 className="text-base font-semibold text-slate-900 mb-4">
                        Objeto
                      </h4>
                      <p className="text-sm text-slate-700 leading-6">
                        {selectedContract.object}
                      </p>

                      <div className="mt-5 pt-5 border-t border-slate-200">
                        <h5 className="text-sm font-semibold text-slate-900 mb-3">
                          Resumo do termo atual
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Percentual de reajuste</p>
                            <p className="text-slate-900 font-medium mt-1">
                              {selectedContract.currentTerm?.reajustPercent ?? "0.00"}%
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-500">Valor da parcela</p>
                            <p className="text-slate-900 font-medium mt-1">
                              {formatMoney(selectedContract.currentTerm?.installmentValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewTab === "items" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Órgãos / grupos</p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {groupComparisons.length}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Itens</p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {itemsSummary.count}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Total inicial</p>
                      <p className="text-xl font-bold text-slate-900 mt-2">
                        {formatMoney(itemsSummary.initialTotal)}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Total atual</p>
                      <p className="text-xl font-bold text-slate-900 mt-2">
                        {formatMoney(itemsSummary.currentTotal)}
                      </p>
                    </div>
                  </div>

                  {groupComparisons.map((group, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-slate-900">
                            {group.name}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">
                            Comparativo entre valores iniciais e atuais.
                          </p>
                        </div>

                        <div className="text-sm text-right">
                          <p className="text-slate-500">
                            Inicial:{" "}
                            <span className="font-medium text-slate-900">
                              {formatMoney(group.initialTotal)}
                            </span>
                          </p>
                          <p className="text-slate-500 mt-1">
                            Atual:{" "}
                            <span className="font-medium text-slate-900">
                              {formatMoney(group.currentTotal)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-left px-4 py-3 font-semibold text-slate-700">
                                Descrição
                              </th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-700">
                                Qtd
                              </th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-700">
                                Valor inicial
                              </th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-700">
                                Valor atual
                              </th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-700">
                                Diferença
                              </th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-700">
                                Total inicial
                              </th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-700">
                                Total atual
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items.map((item, index) => (
                              <tr key={index} className="border-t border-slate-200">
                                <td className="px-4 py-3 text-slate-700">{item.description}</td>
                                <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                                <td className="px-4 py-3 text-slate-700">
                                  {formatMoney(item.initialUnitValue)}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                  {formatMoney(item.currentUnitValue)}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                  {formatMoney(item.unitDifference)}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                  {formatMoney(item.initialTotalValue)}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                  {formatMoney(item.currentTotalValue)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <div className="text-sm text-right">
                          <p className="text-slate-500">
                            Diferença do grupo:{" "}
                            <span className="font-semibold text-slate-900">
                              {formatMoney(group.difference)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewTab === "terms" && (
                <div className="space-y-4">
                  {additiveTerms.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
                      Este contrato ainda não possui termos aditivos.
                    </div>
                  ) : (
                    additiveTerms.map((term, index) => (
                      <div
                        key={term.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div>
                            <p className="text-sm text-blue-700 font-semibold">
                              {index + 1}º evento da timeline
                            </p>
                            <h4 className="text-lg font-bold text-slate-900 mt-1">
                              {term.termNumber}º Termo Aditivo
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">
                              Data do termo: {formatDateBR(term.termDate)}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm min-w-[280px]">
                            <div>
                              <p className="text-slate-500">Índice</p>
                              <p className="text-slate-900 font-medium mt-1">
                                {term.reajustIndex}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">Reajuste</p>
                              <p className="text-slate-900 font-medium mt-1">
                                {term.reajustPercent}%
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">Vigência</p>
                              <p className="text-slate-900 font-medium mt-1">
                                {formatDateBR(term.startDate)} até {formatDateBR(term.endDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">Valor</p>
                              <p className="text-slate-900 font-medium mt-1">
                                {formatMoney(term.totalValue)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {term.notes && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-sm text-slate-500">Observações</p>
                            <p className="text-sm text-slate-700 mt-1">{term.notes}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTermModal && selectedContract && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Novo termo aditivo</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Contrato nº {selectedContract.contractNumber}/{selectedContract.year}
                </p>
              </div>

              <button
                type="button"
                onClick={closeTermModal}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateTerm} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Data do termo
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={termForm.termDate}
                    onChange={(e) =>
                      setTermForm((prev) => ({ ...prev, termDate: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Índice
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white"
                    value={termForm.reajustIndex}
                    onChange={(e) =>
                      setTermForm((prev) => ({ ...prev, reajustIndex: e.target.value }))
                    }
                  >
                    <option value="IPCA">IPCA</option>
                    <option value="IGPM">IGPM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nova vigência inicial
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={termForm.startDate}
                    onChange={(e) =>
                      setTermForm((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nova vigência final
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={termForm.endDate}
                    onChange={(e) =>
                      setTermForm((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Percentual de reajuste
                  </label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    placeholder="Ex.: 5,00"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Parcelas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Observações
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm resize-none"
                  value={termForm.notes}
                  onChange={(e) =>
                    setTermForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-sm text-slate-500">Valor atual do contrato</p>
                <p className="text-xl font-bold text-slate-900 mt-2">
                  {formatMoney(selectedContract.currentTerm?.totalValue)}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeTermModal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Salvar termo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
