import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Pencil,
  Save,
  ReceiptText,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import type {
  BillingEntry,
  BillingInvoiceStatus,
  BillingPaymentStatus,
  CompanyName,
  Contract,
} from "../pages/AdminDashboard";

type Props = {
  companyName: CompanyName;
  contracts: Contract[];
  billingEntries: BillingEntry[];
  onBillingEntriesChange: Dispatch<SetStateAction<BillingEntry[]>>;
};

type PaymentFilter = "Todos" | BillingPaymentStatus;
type InvoiceFilter = "Todos" | BillingInvoiceStatus;

type EditFormState = {
  invoicedValue: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceStatus: BillingInvoiceStatus;
  paymentStatus: BillingPaymentStatus;
  paymentDate: string;
  hasIss: boolean;
  outsideCity: boolean;
  hasIr: boolean;
};

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
  return value;
}

function competenceToInput(value: string) {
  const [month, year] = value.split("/");
  if (!month || !year) return "";
  return `${year}-${month}`;
}

function inputToCompetence(value: string) {
  const [year, month] = value.split("-");
  if (!month || !year) return "";
  return `${month}/${year}`;
}

function getBadgeClass(status: string) {
  if (status === "Pago") return "bg-green-50 text-green-700";
  if (status === "Pago em atraso") return "bg-amber-50 text-amber-700";
  if (status === "Inadimplente") return "bg-red-50 text-red-700";
  if (status === "Emitida") return "bg-blue-50 text-blue-700";
  if (status === "Cancelada") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

function calculateNetValues(entry: BillingEntry) {
  const gross = Number(entry.invoicedValue || entry.expectedValue || 0);

  const hasIss = entry.hasIss ?? true;
  const outsideCity = entry.outsideCity ?? false;
  const hasIr = entry.hasIr ?? true;

  const issRate = hasIss ? Number(entry.issRate || 5) : 0;
  const irRate = hasIr ? Number(entry.irRate || 4.8) : 0;

  const issValue = outsideCity ? 0 : gross * (issRate / 100);
  const irValue = gross * (irRate / 100);
  const netValue = gross - issValue - irValue;

  return {
    grossValue: gross.toFixed(2),
    issRate: String(issRate),
    issValue: issValue.toFixed(2),
    irRate: String(irRate),
    irValue: irValue.toFixed(2),
    netValue: netValue.toFixed(2),
  };
}

function compactCardClass() {
  return "bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4";
}

function getEntryKey(entry: Pick<BillingEntry, "contractId" | "groupName" | "referenceMonth"> & { itemDescription?: string }) {
  return [
    entry.contractId,
    entry.groupName,
    entry.itemDescription || "",
    entry.referenceMonth,
  ].join("__");
}

function createStableId(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return 900000 + (hash % 1000000);
}

function getInstallmentNumber(contract: Contract, competence: string) {
  const [monthText, yearText] = competence.split("/");
  const month = Number(monthText);
  const year = Number(yearText);
  if (!month || !year) return 1;

  const startDateText = contract.currentTerm?.startDate || contract.signatureDate;
  if (!startDateText) return 1;

  const [startYearText, startMonthText] = startDateText.split("-");
  const startYear = Number(startYearText);
  const startMonth = Number(startMonthText);
  if (!startYear || !startMonth) return 1;

  const diff = (year - startYear) * 12 + (month - startMonth) + 1;
  if (diff < 1) return 1;
  return diff;
}

export default function BillingManagement({
  companyName,
  contracts,
  billingEntries,
  onBillingEntriesChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("Todos");
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilter>("Todos");
  const [competence, setCompetence] = useState("01/2026");

  const [editingEntry, setEditingEntry] = useState<BillingEntry | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    invoicedValue: "",
    invoiceNumber: "",
    invoiceDate: "",
    invoiceStatus: "Pendente de emissão",
    paymentStatus: "Pendente",
    paymentDate: "",
    hasIss: true,
    outsideCity: false,
    hasIr: true,
  });

  const companyContracts = useMemo(
    () => contracts.filter((contract) => contract.companyName === companyName),
    [contracts, companyName],
  );

  const generatedBaseEntries = useMemo(() => {
    const entries: BillingEntry[] = [];

    companyContracts.forEach((contract) => {
      (contract.groups || []).forEach((group) => {
        group.items
          .filter((item) => item.billingStatus === "faturando")
          .forEach((item) => {
            const key = getEntryKey({
              contractId: contract.id,
              groupName: group.name,
              itemDescription: item.description,
              referenceMonth: competence,
            });

            const existing = billingEntries.find(
              (entry) =>
                entry.companyName === companyName &&
                entry.contractId === contract.id &&
                entry.groupName === group.name &&
                (entry.itemDescription || "") === item.description &&
                entry.referenceMonth === competence,
            );

            if (existing) {
              entries.push(existing);
              return;
            }

            entries.push({
              id: createStableId(key),
              companyName,
              contractId: contract.id,
              contractNumber: `${contract.contractNumber}/${contract.year}`,
              clientName: contract.clientName,
              groupName: group.name,
              itemDescription: item.description,
              referenceMonth: competence,
              installmentNumber: getInstallmentNumber(contract, competence),
              expectedValue: item.totalValue,
              invoiceNumber: "",
              invoiceDate: "",
              invoicedValue: item.totalValue,
              invoiceStatus: "Pendente de emissão",
              paymentStatus: "Pendente",
              paymentDate: "",
              hasIss: true,
              outsideCity: false,
              hasIr: true,
            });
          });
      });
    });

    return entries;
  }, [billingEntries, companyContracts, companyName, competence]);

  const preservedExistingEntries = useMemo(() => {
    const generatedKeys = new Set(generatedBaseEntries.map((entry) => getEntryKey(entry)));

    return billingEntries.filter((entry) => {
      if (entry.companyName !== companyName) return false;
      if (entry.referenceMonth !== competence) return false;
      return !generatedKeys.has(getEntryKey(entry));
    });
  }, [billingEntries, companyName, competence, generatedBaseEntries]);

  const companyEntries = useMemo(
    () => [...generatedBaseEntries, ...preservedExistingEntries].map((entry) => ({
      ...entry,
      ...calculateNetValues(entry),
    })),
    [generatedBaseEntries, preservedExistingEntries],
  );

  const filteredEntries = useMemo(() => {
    return companyEntries.filter((entry) => {
      const matchesSearch =
        !search.trim() ||
        entry.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
        entry.clientName.toLowerCase().includes(search.toLowerCase()) ||
        entry.groupName.toLowerCase().includes(search.toLowerCase()) ||
        (entry.itemDescription || "").toLowerCase().includes(search.toLowerCase()) ||
        entry.referenceMonth.toLowerCase().includes(search.toLowerCase()) ||
        (entry.invoiceNumber || "").toLowerCase().includes(search.toLowerCase());

      const matchesPayment =
        paymentFilter === "Todos" || entry.paymentStatus === paymentFilter;

      const matchesInvoice =
        invoiceFilter === "Todos" || entry.invoiceStatus === invoiceFilter;

      return matchesSearch && matchesPayment && matchesInvoice;
    });
  }, [companyEntries, search, paymentFilter, invoiceFilter]);

  const summary = useMemo(() => {
    const expected = filteredEntries.reduce(
      (acc, item) => acc + Number(item.expectedValue || 0),
      0,
    );

    const invoiced = filteredEntries
      .filter((item) => item.invoiceStatus === "Emitida")
      .reduce(
        (acc, item) => acc + Number(item.invoicedValue || item.expectedValue || 0),
        0,
      );

    const paid = filteredEntries
      .filter(
        (item) =>
          item.paymentStatus === "Pago" || item.paymentStatus === "Pago em atraso",
      )
      .reduce((acc, item) => acc + Number(item.netValue || 0), 0);

    const pending = filteredEntries
      .filter((item) => item.paymentStatus === "Pendente")
      .reduce((acc, item) => acc + Number(item.expectedValue || 0), 0);

    const overdue = filteredEntries
      .filter((item) => item.paymentStatus === "Inadimplente")
      .reduce((acc, item) => acc + Number(item.expectedValue || 0), 0);

    const paidCount = filteredEntries.filter(
      (entry) =>
        entry.paymentStatus === "Pago" || entry.paymentStatus === "Pago em atraso",
    ).length;

    const openCount = filteredEntries.filter(
      (entry) =>
        entry.paymentStatus === "Pendente" || entry.paymentStatus === "Inadimplente",
    ).length;

    return {
      expected,
      invoiced,
      paid,
      pending,
      overdue,
      totalEntries: filteredEntries.length,
      paidCount,
      openCount,
    };
  }, [filteredEntries]);

  const editPreview = useMemo(() => {
    if (!editingEntry) return null;

    const preview = calculateNetValues({
      ...editingEntry,
      invoicedValue: editForm.invoicedValue,
      invoiceNumber: editForm.invoiceNumber,
      invoiceDate: editForm.invoiceDate,
      invoiceStatus: editForm.invoiceStatus,
      paymentStatus: editForm.paymentStatus,
      paymentDate: editForm.paymentDate,
      hasIss: editForm.hasIss,
      outsideCity: editForm.outsideCity,
      hasIr: editForm.hasIr,
    });

    return preview;
  }, [editingEntry, editForm]);

  function openEditModal(entry: BillingEntry) {
    setEditingEntry(entry);
    setEditForm({
      invoicedValue: entry.invoicedValue || entry.expectedValue || "",
      invoiceNumber: entry.invoiceNumber || "",
      invoiceDate: entry.invoiceDate || "",
      invoiceStatus: entry.invoiceStatus,
      paymentStatus: entry.paymentStatus,
      paymentDate: entry.paymentDate || "",
      hasIss: entry.hasIss ?? true,
      outsideCity: entry.outsideCity ?? false,
      hasIr: entry.hasIr ?? true,
    });
  }

  function closeEditModal() {
    setEditingEntry(null);
  }

  function saveEditModal() {
    if (!editingEntry) return;

    const updatedEntry: BillingEntry = {
      ...editingEntry,
      invoicedValue: editForm.invoicedValue,
      invoiceNumber: editForm.invoiceNumber,
      invoiceDate: editForm.invoiceDate,
      invoiceStatus: editForm.invoiceStatus,
      paymentStatus: editForm.paymentStatus,
      paymentDate: editForm.paymentDate,
      hasIss: editForm.hasIss,
      outsideCity: editForm.outsideCity,
      hasIr: editForm.hasIr,
      ...calculateNetValues({
        ...editingEntry,
        invoicedValue: editForm.invoicedValue,
        invoiceNumber: editForm.invoiceNumber,
        invoiceDate: editForm.invoiceDate,
        invoiceStatus: editForm.invoiceStatus,
        paymentStatus: editForm.paymentStatus,
        paymentDate: editForm.paymentDate,
        hasIss: editForm.hasIss,
        outsideCity: editForm.outsideCity,
        hasIr: editForm.hasIr,
      }),
    };

    onBillingEntriesChange((prev) => {
      const targetKey = getEntryKey(updatedEntry);
      const exists = prev.some((entry) => getEntryKey(entry) === targetKey);

      if (exists) {
        return prev.map((entry) =>
          getEntryKey(entry) === targetKey ? updatedEntry : entry,
        );
      }

      return [...prev, updatedEntry];
    });

    closeEditModal();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Faturamento - {companyName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              A competência selecionada mostra automaticamente os itens marcados como faturando no contrato.
            </p>
          </div>

          <div className="text-sm text-slate-500 lg:text-right">
            Contratos desta empresa:{" "}
            <span className="font-semibold text-slate-800">
              {companyContracts.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
        <div className={`${compactCardClass()} xl:col-span-2`}>
          <p className="text-sm text-slate-500">Previsto</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.expected)}
          </p>
        </div>

        <div className={`${compactCardClass()} xl:col-span-2`}>
          <p className="text-sm text-slate-500">Emitido</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.invoiced)}
          </p>
        </div>

        <div className={`${compactCardClass()} xl:col-span-2`}>
          <p className="text-sm text-slate-500">Pago líquido</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.paid)}
          </p>
        </div>

        <div className={`${compactCardClass()} xl:col-span-2`}>
          <p className="text-sm text-slate-500">Pendente</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.pending)}
          </p>
        </div>

        <div className={compactCardClass()}>
          <div className="flex items-center gap-3">
            <ReceiptText className="text-blue-600 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-500">Lançamentos</p>
              <p className="text-xl font-bold text-slate-900">
                {summary.totalEntries}
              </p>
            </div>
          </div>
        </div>

        <div className={compactCardClass()}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-500">Pagos</p>
              <p className="text-xl font-bold text-slate-900">
                {summary.paidCount}
              </p>
            </div>
          </div>
        </div>

        <div className={compactCardClass()}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-500">Em aberto</p>
              <p className="text-xl font-bold text-slate-900">
                {summary.openCount}
              </p>
            </div>
          </div>
        </div>

        <div className={compactCardClass()}>
          <p className="text-sm text-slate-500">Inadimplente</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.overdue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 xl:grid-cols-[170px_minmax(220px,1.3fr)_minmax(200px,1fr)_minmax(220px,1fr)_auto] gap-3 items-center">
          <div>
            <input
              type="month"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white"
              value={competenceToInput(competence)}
              onChange={(e) => setCompetence(inputToCompetence(e.target.value))}
            />
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-sm"
              placeholder="Buscar contrato, cliente, órgão, item ou NF"
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
              value={invoiceFilter}
              onChange={(e) => setInvoiceFilter(e.target.value as InvoiceFilter)}
            >
              <option value="Todos">Todas as NFs</option>
              <option value="Pendente de emissão">Pendente de emissão</option>
              <option value="Emitida">Emitida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              className="w-full border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-sm appearance-none bg-white"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            >
              <option value="Todos">Todos os pagamentos</option>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
              <option value="Pago em atraso">Pago em atraso</option>
              <option value="Inadimplente">Inadimplente</option>
            </select>
          </div>

          <div className="flex xl:justify-end">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setInvoiceFilter("Todos");
                setPaymentFilter("Todos");
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <h3 className="text-lg font-semibold text-slate-900">
            Lançamentos de faturamento
          </h3>
          <div className="text-sm text-slate-500">
            Competência ativa: {competence}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            Nenhum item marcado como faturando foi encontrado para a competência selecionada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Contrato</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Órgão</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Item</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Ref.</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Parcela</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Bruto</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Líquido</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">NF</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Emissão</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Tributos</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Status NF</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Status Pgto</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Pagamento</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={`${entry.id}-${entry.referenceMonth}-${entry.itemDescription || ""}`} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3 text-slate-700">{entry.contractNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.clientName}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.groupName}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.itemDescription || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.referenceMonth}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.installmentNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{formatMoney(entry.invoicedValue || entry.expectedValue)}</td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{formatMoney(entry.netValue)}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.invoiceNumber || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDateBR(entry.invoiceDate)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-600 space-y-1 min-w-[140px]">
                        <div>ISS: {formatMoney(entry.issValue)}</div>
                        <div>IR: {formatMoney(entry.irValue)}</div>
                        <div>{entry.outsideCity ? "Serviço fora do município" : "Serviço local"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass(entry.invoiceStatus)}`}>
                        {entry.invoiceStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass(entry.paymentStatus)}`}>
                        {entry.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatDateBR(entry.paymentDate)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(entry)}
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-xl transition"
                      >
                        <Pencil size={15} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingEntry && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Editar faturamento</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {editingEntry.contractNumber} • {editingEntry.clientName} • {editingEntry.groupName}
                  {editingEntry.itemDescription ? ` • ${editingEntry.itemDescription}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor bruto</label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={editForm.invoicedValue}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, invoicedValue: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Número da NF</label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={editForm.invoiceNumber}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Data de emissão</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={editForm.invoiceDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, invoiceDate: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status da NF</label>
                  <select
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white"
                    value={editForm.invoiceStatus}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        invoiceStatus: e.target.value as BillingInvoiceStatus,
                      }))
                    }
                  >
                    <option value="Pendente de emissão">Pendente de emissão</option>
                    <option value="Emitida">Emitida</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status do pagamento</label>
                  <select
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white"
                    value={editForm.paymentStatus}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        paymentStatus: e.target.value as BillingPaymentStatus,
                      }))
                    }
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Pago em atraso">Pago em atraso</option>
                    <option value="Inadimplente">Inadimplente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Data do pagamento</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={editForm.paymentDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, paymentDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4">Tributos</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={editForm.hasIss}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, hasIss: e.target.checked }))
                      }
                    />
                    Descontar ISS 5%
                  </label>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={editForm.outsideCity}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, outsideCity: e.target.checked }))
                      }
                    />
                    Serviço fora do município
                  </label>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={editForm.hasIr}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, hasIr: e.target.checked }))
                      }
                    />
                    Descontar IR 4,8%
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">ISS</p>
                    <p className="text-xl font-bold text-slate-900 mt-2">{formatMoney(editPreview?.issValue)}</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">IR</p>
                    <p className="text-xl font-bold text-slate-900 mt-2">{formatMoney(editPreview?.irValue)}</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Valor líquido</p>
                    <p className="text-xl font-bold text-slate-900 mt-2">{formatMoney(editPreview?.netValue)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={saveEditModal}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  <Save size={15} />
                  Salvar alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
