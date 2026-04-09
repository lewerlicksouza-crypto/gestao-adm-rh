import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  LogOut,
  CheckCircle,
  Clock3,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ReceiptText,
  Building2,
} from "lucide-react";
import EmployeeManagement from "../components/EmployeeManagement";
import VacationManagement from "../components/VacationManagement";
import ContractManagement from "../components/ContractManagement";
import BillingManagement from "../components/BillingManagement";

export type CompanyName = "Conta Soluções" | "Conta Pública" | "Idel Soluções";

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

export type BillingInvoiceStatus = "Pendente de emissão" | "Emitida" | "Cancelada";
export type BillingPaymentStatus = "Pendente" | "Pago" | "Pago em atraso" | "Inadimplente";

export type BillingEntry = {
  id: number;
  companyName: CompanyName;
  contractId: number;
  contractNumber: string;
  clientName: string;
  groupName: string;
  installmentNumber: number;
  referenceMonth: string;
  expectedValue: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoicedValue: string;
  invoiceStatus: BillingInvoiceStatus;
  paymentStatus: BillingPaymentStatus;
  paymentDate: string;
  notes?: string;
};

type Employee = {
  id: number;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  admissionDate: string;
  status: "Ativo" | "Inativo";
  notes: string;
};

type VacationPeriod = {
  id: number;
  employeeId: number;
  periodNumber: number;
  start: string;
  end: string;
  totalDays: number;
  grantedUntil: string;
};

type VacationRecord = {
  id: number;
  employeeId: number;
  periodId: number;
  startDate: string;
  endDate: string;
  vacationDays: number;
  bonusDays: number;
  status: "Programado" | "Aprovada" | "Rejeitada" | "Pendente";
  notes: string;
};

type Section =
  | "dashboard"
  | "employees"
  | "vacations"
  | "contracts-conta"
  | "contracts-publica"
  | "contracts-idel"
  | "billing-conta"
  | "billing-publica"
  | "billing-idel";

const initialContracts: Contract[] = [
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
          { id: 1, description: "Sistema de Contabilidade", quantity: 12, unitValue: "300.00", totalValue: "3600.00" },
          { id: 2, description: "Sistema de Tesouraria", quantity: 12, unitValue: "200.00", totalValue: "2400.00" },
        ],
      },
      {
        id: 2,
        name: "Fundo Municipal de Saúde",
        items: [
          { id: 1, description: "Sistema de Contabilidade", quantity: 12, unitValue: "120.00", totalValue: "1440.00" },
          { id: 2, description: "Sistema de Pessoal", quantity: 12, unitValue: "95.00", totalValue: "1140.00" },
        ],
      },
      {
        id: 3,
        name: "Câmara Municipal",
        items: [{ id: 1, description: "Portal da Transparência", quantity: 12, unitValue: "275.00", totalValue: "3300.00" }],
      },
    ],
    groups: [
      {
        id: 1,
        name: "Prefeitura Municipal",
        items: [
          { id: 1, description: "Sistema de Contabilidade", quantity: 12, unitValue: "315.00", totalValue: "3780.00" },
          { id: 2, description: "Sistema de Tesouraria", quantity: 12, unitValue: "210.00", totalValue: "2520.00" },
        ],
      },
      {
        id: 2,
        name: "Fundo Municipal de Saúde",
        items: [
          { id: 1, description: "Sistema de Contabilidade", quantity: 12, unitValue: "126.00", totalValue: "1512.00" },
          { id: 2, description: "Sistema de Pessoal", quantity: 12, unitValue: "99.75", totalValue: "1197.00" },
        ],
      },
      {
        id: 3,
        name: "Câmara Municipal",
        items: [{ id: 1, description: "Portal da Transparência", quantity: 12, unitValue: "288.75", totalValue: "3465.00" }],
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
      { id: 1, name: "Prefeitura Municipal", items: [{ id: 1, description: "Assessoria Administrativa", quantity: 12, unitValue: "500.00", totalValue: "6000.00" }] },
      { id: 2, name: "Câmara Municipal", items: [{ id: 1, description: "Assessoria Legislativa", quantity: 12, unitValue: "300.00", totalValue: "3600.00" }] },
    ],
    groups: [
      { id: 1, name: "Prefeitura Municipal", items: [{ id: 1, description: "Assessoria Administrativa", quantity: 12, unitValue: "500.00", totalValue: "6000.00" }] },
      { id: 2, name: "Câmara Municipal", items: [{ id: 1, description: "Assessoria Legislativa", quantity: 12, unitValue: "300.00", totalValue: "3600.00" }] },
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
      { id: 1, name: "Prefeitura Municipal", items: [{ id: 1, description: "Assessoria Contábil", quantity: 12, unitValue: "400.00", totalValue: "4800.00" }] },
      { id: 2, name: "Fundo Municipal de Saúde", items: [{ id: 1, description: "Assessoria em Prestação de Contas", quantity: 12, unitValue: "300.00", totalValue: "3600.00" }] },
    ],
    groups: [
      { id: 1, name: "Prefeitura Municipal", items: [{ id: 1, description: "Assessoria Contábil", quantity: 12, unitValue: "420.00", totalValue: "5040.00" }] },
      { id: 2, name: "Fundo Municipal de Saúde", items: [{ id: 1, description: "Assessoria em Prestação de Contas", quantity: 12, unitValue: "315.00", totalValue: "3780.00" }] },
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

const initialBillingEntries: BillingEntry[] = [
  {
    id: 1,
    companyName: "Conta Soluções",
    contractId: 1,
    contractNumber: "008/2026",
    clientName: "Município de Areal",
    groupName: "Prefeitura Municipal",
    installmentNumber: 1,
    referenceMonth: "01/2026",
    expectedValue: "6300.00",
    invoiceNumber: "1001",
    invoiceDate: "2026-01-05",
    invoicedValue: "6300.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pago",
    paymentDate: "2026-01-18",
    notes: "Pagamento dentro do prazo.",
  },
  {
    id: 2,
    companyName: "Conta Soluções",
    contractId: 1,
    contractNumber: "008/2026",
    clientName: "Município de Areal",
    groupName: "Fundo Municipal de Saúde",
    installmentNumber: 1,
    referenceMonth: "01/2026",
    expectedValue: "2709.00",
    invoiceNumber: "1002",
    invoiceDate: "2026-01-05",
    invoicedValue: "2709.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pendente",
    paymentDate: "",
    notes: "Aguardando pagamento.",
  },
  {
    id: 3,
    companyName: "Conta Soluções",
    contractId: 1,
    contractNumber: "008/2026",
    clientName: "Município de Areal",
    groupName: "Câmara Municipal",
    installmentNumber: 1,
    referenceMonth: "01/2026",
    expectedValue: "3465.00",
    invoiceNumber: "",
    invoiceDate: "",
    invoicedValue: "",
    invoiceStatus: "Pendente de emissão",
    paymentStatus: "Pendente",
    paymentDate: "",
    notes: "NF ainda não emitida.",
  },
  {
    id: 4,
    companyName: "Conta Pública",
    contractId: 2,
    contractNumber: "014/2026",
    clientName: "Município de Carmo",
    groupName: "Prefeitura Municipal",
    installmentNumber: 1,
    referenceMonth: "03/2026",
    expectedValue: "6000.00",
    invoiceNumber: "2101",
    invoiceDate: "2026-03-04",
    invoicedValue: "6000.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pago em atraso",
    paymentDate: "2026-04-12",
    notes: "Pagamento recebido após vencimento.",
  },
  {
    id: 5,
    companyName: "Conta Pública",
    contractId: 2,
    contractNumber: "014/2026",
    clientName: "Município de Carmo",
    groupName: "Câmara Municipal",
    installmentNumber: 1,
    referenceMonth: "03/2026",
    expectedValue: "3600.00",
    invoiceNumber: "2102",
    invoiceDate: "2026-03-04",
    invoicedValue: "3600.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pendente",
    paymentDate: "",
    notes: "Sem baixa até o momento.",
  },
  {
    id: 6,
    companyName: "Idel Soluções",
    contractId: 3,
    contractNumber: "021/2025",
    clientName: "Município de Trajano de Moraes",
    groupName: "Prefeitura Municipal",
    installmentNumber: 8,
    referenceMonth: "08/2025",
    expectedValue: "5040.00",
    invoiceNumber: "3308",
    invoiceDate: "2025-08-05",
    invoicedValue: "5040.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Pago",
    paymentDate: "2025-08-20",
    notes: "Competência quitada.",
  },
  {
    id: 7,
    companyName: "Idel Soluções",
    contractId: 3,
    contractNumber: "021/2025",
    clientName: "Município de Trajano de Moraes",
    groupName: "Fundo Municipal de Saúde",
    installmentNumber: 8,
    referenceMonth: "08/2025",
    expectedValue: "3780.00",
    invoiceNumber: "3309",
    invoiceDate: "2025-08-05",
    invoicedValue: "3780.00",
    invoiceStatus: "Emitida",
    paymentStatus: "Inadimplente",
    paymentDate: "",
    notes: "Cliente sem pagamento até hoje.",
  },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [contractsMenuOpen, setContractsMenuOpen] = useState(true);
  const [billingMenuOpen, setBillingMenuOpen] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const [vacations, setVacations] = useState<VacationRecord[]>([]);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [billingEntries, setBillingEntries] = useState<BillingEntry[]>(initialBillingEntries);

  const stats = useMemo(() => {
    const today = new Date();
    const approvedCount = vacations.filter((vacation) => vacation.status === "Aprovada").length;
    const scheduledCount = vacations.filter((vacation) => vacation.status === "Programado").length;
    const pendingCount = vacations.filter((vacation) => vacation.status === "Pendente").length;
    const expiringCount = vacationPeriods.filter((period) => {
      const grantedUntil = new Date(period.grantedUntil);
      const diffInMs = grantedUntil.getTime() - today.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      return diffInDays >= 0 && diffInDays <= 60;
    }).length;

    return {
      employees: employees.length,
      approved: approvedCount,
      scheduled: scheduledCount,
      expiring: expiringCount,
      pending: pendingCount,
    };
  }, [employees, vacationPeriods, vacations]);

  const currentCompany: CompanyName | null =
    activeSection === "contracts-conta" || activeSection === "billing-conta"
      ? "Conta Soluções"
      : activeSection === "contracts-publica" || activeSection === "billing-publica"
        ? "Conta Pública"
        : activeSection === "contracts-idel" || activeSection === "billing-idel"
          ? "Idel Soluções"
          : null;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-72 bg-[#06122b] text-white flex flex-col">
        <div className="px-7 py-8">
          <h1 className="text-4xl font-bold">Admin</h1>
        </div>

        <nav className="px-4 flex-1 space-y-3 overflow-y-auto pb-6">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`w-full flex items-center gap-3 rounded-xl px-5 py-4 text-left text-2xl transition ${
              activeSection === "dashboard" ? "bg-blue-600 text-white" : "text-white hover:bg-white/10"
            }`}
          >
            <LayoutDashboard size={26} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveSection("employees")}
            className={`w-full flex items-center gap-3 rounded-xl px-5 py-4 text-left text-2xl transition ${
              activeSection === "employees" ? "bg-blue-600 text-white" : "text-white hover:bg-white/10"
            }`}
          >
            <Users size={26} />
            Funcionários
          </button>

          <button
            onClick={() => setActiveSection("vacations")}
            className={`w-full flex items-center gap-3 rounded-xl px-5 py-4 text-left text-2xl transition ${
              activeSection === "vacations" ? "bg-blue-600 text-white" : "text-white hover:bg-white/10"
            }`}
          >
            <Calendar size={26} />
            Férias
          </button>

          <div className="space-y-2">
            <button
              onClick={() => setContractsMenuOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between rounded-xl px-5 py-4 text-left text-2xl transition ${
                activeSection.startsWith("contracts-") ? "bg-white/10 text-white" : "text-white hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText size={26} />
                Contratos
              </span>
              {contractsMenuOpen ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
            </button>

            {contractsMenuOpen && (
              <div className="ml-5 pl-4 border-l border-white/15 space-y-2">
                {[
                  ["contracts-conta", "Conta Soluções"],
                  ["contracts-publica", "Conta Pública"],
                  ["contracts-idel", "Idel Soluções"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key as Section)}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-lg transition ${
                      activeSection === key ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <Building2 size={18} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setBillingMenuOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between rounded-xl px-5 py-4 text-left text-2xl transition ${
                activeSection.startsWith("billing-") ? "bg-white/10 text-white" : "text-white hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <ReceiptText size={26} />
                Faturamento
              </span>
              {billingMenuOpen ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
            </button>

            {billingMenuOpen && (
              <div className="ml-5 pl-4 border-l border-white/15 space-y-2">
                {[
                  ["billing-conta", "Conta Soluções"],
                  ["billing-publica", "Conta Pública"],
                  ["billing-idel", "Idel Soluções"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key as Section)}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-lg transition ${
                      activeSection === key ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <Building2 size={18} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-8">
            <div className="border-t border-white/20" />
          </div>
        </nav>

        <div className="p-6">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl px-5 py-4 text-2xl flex items-center justify-center gap-3 transition">
            <LogOut size={24} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-9 overflow-x-hidden">
        {activeSection === "dashboard" && (
          <div className="space-y-8">
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-5xl font-bold text-slate-900 mb-4">Bem-vindo ao Painel Admin</h2>
              <p className="text-3xl text-slate-600">Acompanhe os principais indicadores de funcionários, férias, contratos e faturamento.</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-blue-600 flex items-center justify-between">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">Funcionários</p>
                  <p className="text-6xl font-bold text-slate-900">{stats.employees}</p>
                </div>
                <Users size={52} className="text-blue-600" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-green-600 flex items-center justify-between">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">Concedidas</p>
                  <p className="text-6xl font-bold text-slate-900">{stats.approved}</p>
                </div>
                <CheckCircle size={52} className="text-green-600" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-sky-500 flex items-center justify-between">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">Programadas</p>
                  <p className="text-6xl font-bold text-slate-900">{stats.scheduled}</p>
                </div>
                <Calendar size={52} className="text-sky-500" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-amber-500 flex items-center justify-between">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">A vencer</p>
                  <p className="text-6xl font-bold text-slate-900">{stats.expiring}</p>
                </div>
                <Clock3 size={52} className="text-amber-500" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-red-600 flex items-center justify-between md:col-span-1">
                <div>
                  <p className="text-3xl text-slate-600 mb-3">Pendentes</p>
                  <p className="text-6xl font-bold text-slate-900">{stats.pending}</p>
                </div>
                <AlertTriangle size={52} className="text-red-600" />
              </div>
            </section>
          </div>
        )}

        {activeSection === "employees" && <EmployeeManagement onEmployeesChange={setEmployees} />}
        {activeSection === "vacations" && (
          <VacationManagement
            employees={employees}
            onVacationPeriodsChange={setVacationPeriods}
            onVacationsChange={setVacations}
          />
        )}

        {currentCompany && activeSection.startsWith("contracts-") && (
          <ContractManagement
            companyName={currentCompany}
            contracts={contracts}
            onContractsChange={setContracts}
            billingEntries={billingEntries}
          />
        )}

        {currentCompany && activeSection.startsWith("billing-") && (
          <BillingManagement
            companyName={currentCompany}
            contracts={contracts}
            billingEntries={billingEntries}
            onBillingEntriesChange={setBillingEntries}
          />
        )}
      </main>
    </div>
  );
}
