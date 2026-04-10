import { useMemo, useState } from "react";
import {
  Users,
  Calendar,
  Home,
  LogOut,
  FileText,
  ChevronDown,
  ChevronRight,
  Building2,
  ReceiptText,
  Briefcase,
  Wallet,
  AlertTriangle,
  CircleDollarSign,
} from "lucide-react";
import { Button } from "../components/Button";
import EmployeeManagement from "../components/EmployeeManagement";
import VacationManagement from "../components/VacationManagement";
import ContractManagement from "../components/ContractManagement";
import BillingManagement from "../components/BillingManagement";

export type CompanyName = "Conta Soluções" | "Conta Pública" | "Idel Soluções";
export type BillingInvoiceStatus =
  | "Pendente de emissão"
  | "Emitida"
  | "Cancelada";
export type BillingPaymentStatus =
  | "Pendente"
  | "Pago"
  | "Pago em atraso"
  | "Inadimplente";

export type ContractCurrentTerm = {
  termType?: string;
  termNumber?: number;
  totalValue: string;
  endDate: string;
  startDate?: string;
  installments?: number;
  installmentValue?: string;
  reajustPercent?: string;
};

export type ContractGroupItem = {
  id: number;
  description: string;
  quantity: number;
  unitValue: string;
  totalValue: string;
};

export type ContractGroup = {
  id: number;
  name: string;
  items: ContractGroupItem[];
};

export type ContractTerm = {
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

export type Contract = {
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

export type BillingEntry = {
  id: number;
  companyName: CompanyName;
  contractId: number;
  contractNumber: string;
  clientName: string;
  groupName: string;
  referenceMonth: string;
  installmentNumber: number;
  expectedValue: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoicedValue: string;
  invoiceStatus: BillingInvoiceStatus;
  paymentStatus: BillingPaymentStatus;
  paymentDate: string;
  notes?: string;
  grossValue?: string;
  netValue?: string;
  hasIss?: boolean;
  issRate?: string;
  issValue?: string;
  outsideCity?: boolean;
  hasIr?: boolean;
  irRate?: string;
  irValue?: string;
};

type ActiveTab =
  | "home"
  | "employees"
  | "vacations"
  | "contracts-conta"
  | "contracts-publica"
  | "contracts-idel"
  | "billing-conta"
  | "billing-publica"
  | "billing-idel";

const contractsMock: Contract[] = [
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

const billingEntriesMock: BillingEntry[] = [
  {
    id: 1,
    companyName: "Conta Soluções",
    contractId: 1,
    contractNumber: "008/2026",
    clientName: "Município de Areal",
    groupName: "Prefeitura Municipal",
    referenceMonth: "01/2026",
    installmentNumber: 1,
    expectedValue: "6300.00",
    invoiceNumber: "1001",
    invoiceDate: "2026-01-05",
    invoicedValue: "6300.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pago",
    paymentDate: "2026-01-18",
    grossValue: "6300.00",
    netValue: "5706.60",
    hasIss: true,
    issRate: "5",
    issValue: "315.00",
    outsideCity: false,
    hasIr: true,
    irRate: "4.8",
    irValue: "302.40",
  },
  {
    id: 2,
    companyName: "Conta Soluções",
    contractId: 1,
    contractNumber: "008/2026",
    clientName: "Município de Areal",
    groupName: "Fundo Municipal de Saúde",
    referenceMonth: "01/2026",
    installmentNumber: 1,
    expectedValue: "2709.00",
    invoiceNumber: "1002",
    invoiceDate: "2026-01-05",
    invoicedValue: "2709.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pendente",
    paymentDate: "",
    grossValue: "2709.00",
    netValue: "2453.78",
    hasIss: true,
    issRate: "5",
    issValue: "135.45",
    outsideCity: false,
    hasIr: true,
    irRate: "4.8",
    irValue: "130.03",
  },
  {
    id: 3,
    companyName: "Conta Soluções",
    contractId: 1,
    contractNumber: "008/2026",
    clientName: "Município de Areal",
    groupName: "Câmara Municipal",
    referenceMonth: "01/2026",
    installmentNumber: 1,
    expectedValue: "3465.00",
    invoiceNumber: "",
    invoiceDate: "",
    invoicedValue: "3465.00",
    invoiceStatus: "Pendente de emissão",
    paymentStatus: "Pendente",
    paymentDate: "",
    grossValue: "3465.00",
    netValue: "3138.29",
    hasIss: true,
    issRate: "5",
    issValue: "173.25",
    outsideCity: false,
    hasIr: true,
    irRate: "4.8",
    irValue: "166.32",
  },
  {
    id: 4,
    companyName: "Conta Pública",
    contractId: 2,
    contractNumber: "014/2026",
    clientName: "Município de Carmo",
    groupName: "Prefeitura Municipal",
    referenceMonth: "02/2026",
    installmentNumber: 1,
    expectedValue: "6000.00",
    invoiceNumber: "2201",
    invoiceDate: "2026-02-20",
    invoicedValue: "6000.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pago",
    paymentDate: "2026-03-05",
    grossValue: "6000.00",
    netValue: "5430.00",
    hasIss: true,
    issRate: "5",
    issValue: "300.00",
    outsideCity: false,
    hasIr: true,
    irRate: "4.8",
    irValue: "270.00",
  },
  {
    id: 5,
    companyName: "Conta Pública",
    contractId: 2,
    contractNumber: "014/2026",
    clientName: "Município de Carmo",
    groupName: "Câmara Municipal",
    referenceMonth: "02/2026",
    installmentNumber: 1,
    expectedValue: "3600.00",
    invoiceNumber: "2202",
    invoiceDate: "2026-02-20",
    invoicedValue: "3600.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pago em atraso",
    paymentDate: "2026-04-10",
    grossValue: "3600.00",
    netValue: "3258.00",
    hasIss: true,
    issRate: "5",
    issValue: "180.00",
    outsideCity: false,
    hasIr: true,
    irRate: "4.8",
    irValue: "162.00",
  },
  {
    id: 6,
    companyName: "Idel Soluções",
    contractId: 3,
    contractNumber: "021/2025",
    clientName: "Município de Trajano de Moraes",
    groupName: "Prefeitura Municipal",
    referenceMonth: "06/2025",
    installmentNumber: 6,
    expectedValue: "5040.00",
    invoiceNumber: "3301",
    invoiceDate: "2025-06-08",
    invoicedValue: "5040.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Inadimplente",
    paymentDate: "",
    grossValue: "5040.00",
    netValue: "4563.22",
    hasIss: true,
    issRate: "5",
    issValue: "252.00",
    outsideCity: false,
    hasIr: true,
    irRate: "4.8",
    irValue: "241.92",
  },
  {
    id: 7,
    companyName: "Idel Soluções",
    contractId: 3,
    contractNumber: "021/2025",
    clientName: "Município de Trajano de Moraes",
    groupName: "Fundo Municipal de Saúde",
    referenceMonth: "06/2025",
    installmentNumber: 6,
    expectedValue: "3780.00",
    invoiceNumber: "3302",
    invoiceDate: "2025-06-08",
    invoicedValue: "3780.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pendente",
    paymentDate: "",
    grossValue: "3780.00",
    netValue: "3422.52",
    hasIss: true,
    issRate: "5",
    issValue: "189.00",
    outsideCity: false,
    hasIr: true,
    irRate: "4.8",
    irValue: "181.44",
  },
];

function formatMoney(value?: string | number) {
  if (value === undefined || value === null || value === "") return "R$ 0,00";
  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) return String(value);
  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function summaryCardClass() {
  return "bg-white rounded-2xl border border-slate-200 shadow-sm p-5";
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [contractsMenuOpen, setContractsMenuOpen] = useState(false);
  const [billingMenuOpen, setBillingMenuOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>(contractsMock);
  const [billingEntries, setBillingEntries] =
    useState<BillingEntry[]>(billingEntriesMock);

  const currentContractsCompany =
    activeTab === "contracts-conta"
      ? "Conta Soluções"
      : activeTab === "contracts-publica"
        ? "Conta Pública"
        : activeTab === "contracts-idel"
          ? "Idel Soluções"
          : null;

  const currentBillingCompany =
    activeTab === "billing-conta"
      ? "Conta Soluções"
      : activeTab === "billing-publica"
        ? "Conta Pública"
        : activeTab === "billing-idel"
          ? "Idel Soluções"
          : null;

  const dashboardSummary = useMemo(() => {
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter((item) => item.status === "Vigente").length;
    const closedContracts = contracts.filter((item) => item.status === "Encerrado").length;

    const contractsByCompany = {
      conta: contracts.filter((item) => item.companyName === "Conta Soluções").length,
      publica: contracts.filter((item) => item.companyName === "Conta Pública").length,
      idel: contracts.filter((item) => item.companyName === "Idel Soluções").length,
    };

    const invoicePending = billingEntries.filter(
      (item) => item.invoiceStatus === "Pendente de emissão",
    ).length;

    const billingPendingCount = billingEntries.filter(
      (item) => item.paymentStatus === "Pendente",
    ).length;

    const billingOverdueCount = billingEntries.filter(
      (item) => item.paymentStatus === "Inadimplente",
    ).length;

    const expectedTotal = billingEntries.reduce(
      (acc, item) => acc + Number(item.expectedValue || 0),
      0,
    );

    const invoicedTotal = billingEntries
      .filter((item) => item.invoiceStatus === "Emitida")
      .reduce((acc, item) => acc + Number(item.invoicedValue || item.expectedValue || 0), 0);

    const paidTotal = billingEntries
      .filter(
        (item) =>
          item.paymentStatus === "Pago" || item.paymentStatus === "Pago em atraso",
      )
      .reduce((acc, item) => acc + Number(item.netValue || item.invoicedValue || 0), 0);

    const pendingTotal = billingEntries
      .filter((item) => item.paymentStatus === "Pendente")
      .reduce((acc, item) => acc + Number(item.expectedValue || 0), 0);

    const overdueTotal = billingEntries
      .filter((item) => item.paymentStatus === "Inadimplente")
      .reduce((acc, item) => acc + Number(item.expectedValue || 0), 0);

    return {
      totalContracts,
      activeContracts,
      closedContracts,
      contractsByCompany,
      invoicePending,
      billingPendingCount,
      billingOverdueCount,
      expectedTotal,
      invoicedTotal,
      paidTotal,
      pendingTotal,
      overdueTotal,
      employeesTotal: 0,
      vacationsGranted: 0,
      vacationsScheduled: 0,
      vacationsPending: 0,
      vacationsToExpire: 0,
    };
  }, [contracts, billingEntries]);

  function menuButtonClass(isActive: boolean) {
    return `w-full flex items-center gap-3 rounded-2xl transition text-left ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-white hover:bg-white/10"
    } px-4 py-3.5 text-base lg:text-lg`;
  }

  function submenuButtonClass(isActive: boolean) {
    return `w-full flex items-center gap-3 rounded-xl transition text-left ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-200 hover:bg-white/10"
    } px-4 py-3 text-sm lg:text-base`;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-[250px] lg:w-[280px] xl:w-[300px] bg-[#031633] text-white shadow-xl flex flex-col min-h-screen">
        <div className="px-5 lg:px-6 pt-6 lg:pt-7 pb-5">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Admin</h1>
        </div>

        <nav className="flex-1 px-3 lg:px-4 pb-6 overflow-y-auto">
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab("home")}
              className={menuButtonClass(activeTab === "home")}
            >
              <Home className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("employees")}
              className={menuButtonClass(activeTab === "employees")}
            >
              <Users className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />
              <span>Funcionários</span>
            </button>

            <button
              onClick={() => setActiveTab("vacations")}
              className={menuButtonClass(activeTab === "vacations")}
            >
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />
              <span>Férias</span>
            </button>

            <div className="space-y-2">
              <button
                onClick={() => setContractsMenuOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between rounded-2xl transition text-left px-4 py-3.5 text-base lg:text-lg ${
                  activeTab.startsWith("contracts-")
                    ? "bg-white/14 text-white"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-3">
                  <FileText className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />
                  <span>Contratos</span>
                </span>

                {contractsMenuOpen ? (
                  <ChevronDown className="w-5 h-5 shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 shrink-0" />
                )}
              </button>

              {contractsMenuOpen && (
                <div className="ml-4 pl-4 border-l border-white/10 space-y-2">
                  <button
                    onClick={() => setActiveTab("contracts-conta")}
                    className={submenuButtonClass(activeTab === "contracts-conta")}
                  >
                    <Building2 className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span>Conta Soluções</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("contracts-publica")}
                    className={submenuButtonClass(activeTab === "contracts-publica")}
                  >
                    <Building2 className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span>Conta Pública</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("contracts-idel")}
                    className={submenuButtonClass(activeTab === "contracts-idel")}
                  >
                    <Building2 className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span>Idel Soluções</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setBillingMenuOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between rounded-2xl transition text-left px-4 py-3.5 text-base lg:text-lg ${
                  activeTab.startsWith("billing-")
                    ? "bg-white/14 text-white"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-3">
                  <ReceiptText className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />
                  <span>Faturamento</span>
                </span>

                {billingMenuOpen ? (
                  <ChevronDown className="w-5 h-5 shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 shrink-0" />
                )}
              </button>

              {billingMenuOpen && (
                <div className="ml-4 pl-4 border-l border-white/10 space-y-2">
                  <button
                    onClick={() => setActiveTab("billing-conta")}
                    className={submenuButtonClass(activeTab === "billing-conta")}
                  >
                    <Building2 className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span>Conta Soluções</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("billing-publica")}
                    className={submenuButtonClass(activeTab === "billing-publica")}
                  >
                    <Building2 className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span>Conta Pública</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("billing-idel")}
                    className={submenuButtonClass(activeTab === "billing-idel")}
                  >
                    <Building2 className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span>Idel Soluções</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <Button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 rounded-xl py-3 text-sm lg:text-base">
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              Sair
            </Button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 overflow-x-auto">
        {activeTab === "home" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-slate-200">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Bem-vindo ao Painel Admin
              </h2>
              <p className="text-slate-600 text-base lg:text-lg">
                Acompanhe rapidamente a situação geral de férias, contratos e faturamento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className={summaryCardClass()}>
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-500">Funcionários</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {dashboardSummary.employeesTotal}
                    </p>
                  </div>
                </div>
              </div>

              <div className={summaryCardClass()}>
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-amber-600" />
                  <div>
                    <p className="text-sm text-slate-500">Férias pendentes</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {dashboardSummary.vacationsPending}
                    </p>
                  </div>
                </div>
              </div>

              <div className={summaryCardClass()}>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-indigo-600" />
                  <div>
                    <p className="text-sm text-slate-500">Contratos vigentes</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {dashboardSummary.activeContracts}
                    </p>
                  </div>
                </div>
              </div>

              <div className={summaryCardClass()}>
                <div className="flex items-center gap-3">
                  <ReceiptText className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-slate-500">NFs pendentes</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {dashboardSummary.invoicePending}
                    </p>
                  </div>
                </div>
              </div>

              <div className={summaryCardClass()}>
                <div className="flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-500">A receber</p>
                    <p className="text-xl font-bold text-slate-900">
                      {formatMoney(
                        dashboardSummary.pendingTotal + dashboardSummary.overdueTotal,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Calendar className="w-6 h-6 text-amber-600" />
                  <h3 className="text-xl font-bold text-slate-900">Resumo de Férias</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500">Concedidas</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {dashboardSummary.vacationsGranted}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500">Programadas</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {dashboardSummary.vacationsScheduled}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500">Pendentes</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {dashboardSummary.vacationsPending}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500">A vencer</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {dashboardSummary.vacationsToExpire}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900">Resumo de Contratos</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">Total de contratos</span>
                    <strong className="text-slate-900">{dashboardSummary.totalContracts}</strong>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">Vigentes</span>
                    <strong className="text-slate-900">{dashboardSummary.activeContracts}</strong>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">Encerrados</span>
                    <strong className="text-slate-900">{dashboardSummary.closedContracts}</strong>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500 mb-3">Por empresa</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Conta Soluções</span>
                        <strong className="text-slate-900">
                          {dashboardSummary.contractsByCompany.conta}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Conta Pública</span>
                        <strong className="text-slate-900">
                          {dashboardSummary.contractsByCompany.publica}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Idel Soluções</span>
                        <strong className="text-slate-900">
                          {dashboardSummary.contractsByCompany.idel}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <ReceiptText className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-slate-900">Resumo de Faturamento</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">Previsto</span>
                    <strong className="text-slate-900">
                      {formatMoney(dashboardSummary.expectedTotal)}
                    </strong>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">Emitido</span>
                    <strong className="text-slate-900">
                      {formatMoney(dashboardSummary.invoicedTotal)}
                    </strong>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">Pago</span>
                    <strong className="text-slate-900">
                      {formatMoney(dashboardSummary.paidTotal)}
                    </strong>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">Pendente</span>
                    <strong className="text-slate-900">
                      {formatMoney(dashboardSummary.pendingTotal)}
                    </strong>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">Inadimplente</span>
                    <strong className="text-slate-900">
                      {formatMoney(dashboardSummary.overdueTotal)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-slate-900">Alertas rápidos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <p className="text-sm text-red-700">Inadimplentes</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {dashboardSummary.billingOverdueCount}
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    Lançamentos com pagamento em atraso ou não recebido.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <p className="text-sm text-amber-700">Pagamentos pendentes</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">
                    {dashboardSummary.billingPendingCount}
                  </p>
                  <p className="text-sm text-amber-700 mt-2">
                    Faturamentos emitidos ou previstos aguardando pagamento.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <p className="text-sm text-blue-700">NFs a emitir</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {dashboardSummary.invoicePending}
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Lançamentos ainda sem emissão de nota fiscal.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <CircleDollarSign className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-slate-900">Empresas</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-700">Conta Soluções</span>
                    <span className="font-semibold text-slate-900">
                      {formatMoney(
                        billingEntries
                          .filter((item) => item.companyName === "Conta Soluções")
                          .reduce((acc, item) => acc + Number(item.expectedValue || 0), 0),
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-700">Conta Pública</span>
                    <span className="font-semibold text-slate-900">
                      {formatMoney(
                        billingEntries
                          .filter((item) => item.companyName === "Conta Pública")
                          .reduce((acc, item) => acc + Number(item.expectedValue || 0), 0),
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-700">Idel Soluções</span>
                    <span className="font-semibold text-slate-900">
                      {formatMoney(
                        billingEntries
                          .filter((item) => item.companyName === "Idel Soluções")
                          .reduce((acc, item) => acc + Number(item.expectedValue || 0), 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <ReceiptText className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900">Situação financeira</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Emitido sobre previsto</span>
                      <span>
                        {dashboardSummary.expectedTotal > 0
                          ? `${(
                              (dashboardSummary.invoicedTotal /
                                dashboardSummary.expectedTotal) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${
                            dashboardSummary.expectedTotal > 0
                              ? Math.min(
                                  (dashboardSummary.invoicedTotal /
                                    dashboardSummary.expectedTotal) *
                                    100,
                                  100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Pago sobre emitido</span>
                      <span>
                        {dashboardSummary.invoicedTotal > 0
                          ? `${(
                              (dashboardSummary.paidTotal /
                                dashboardSummary.invoicedTotal) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{
                          width: `${
                            dashboardSummary.invoicedTotal > 0
                              ? Math.min(
                                  (dashboardSummary.paidTotal /
                                    dashboardSummary.invoicedTotal) *
                                    100,
                                  100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-sm text-slate-600">
                    <p>
                      O painel mostra um resumo consolidado da operação atual com base
                      nos contratos e lançamentos de faturamento cadastrados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "employees" && <EmployeeManagement />}
        {activeTab === "vacations" && <VacationManagement />}

        {currentContractsCompany && (
          <ContractManagement companyName={currentContractsCompany} />
        )}

        {currentBillingCompany && (
          <BillingManagement
            companyName={currentBillingCompany}
            contracts={contracts}
            billingEntries={billingEntries}
            onBillingEntriesChange={setBillingEntries}
          />
        )}
      </main>
    </div>
  );
}
