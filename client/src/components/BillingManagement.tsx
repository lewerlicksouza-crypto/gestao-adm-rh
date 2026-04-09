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

function formatMoney(value?: string | number) {
  if (value === undefined || value === null || value === "") return "-";
  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) return String(value);
  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

export default function BillingManagement({
  companyName,
  contracts,
  billingEntries,
  onBillingEntriesChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("Todos");
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilter>("Todos");
  const [editingId, setEditingId] = useState<number | null>(null);

  const companyContracts = useMemo(
    () => contracts.filter((contract) => contract.companyName === companyName),
    [contracts, companyName],
  );

  const companyEntries = useMemo(
    () =>
      billingEntries
        .filter((entry) => entry.companyName === companyName)
        .map((entry) => ({
          ...entry,
          ...calculateNetValues(entry),
        })),
    [billingEntries, companyName],
  );

  const filteredEntries = useMemo(() => {
    return companyEntries.filter((entry) => {
      const matchesSearch =
        !search.trim() ||
        entry.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
        entry.clientName.toLowerCase().includes(search.toLowerCase()) ||
        entry.groupName.toLowerCase().includes(search.toLowerCase()) ||
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

    return { expected, invoiced, paid, pending, overdue };
  }, [filteredEntries]);

  function updateEntry(id: number, field: keyof BillingEntry, value: any) {
    onBillingEntriesChange((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        const updated = {
          ...entry,
          [field]: value,
        };

        return {
          ...updated,
          ...calculateNetValues(updated),
        };
      }),
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Faturamento - {companyName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Lance NF, competência, pagamento e acompanhe o faturamento operacional da empresa.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            Contratos desta empresa:{" "}
            <span className="font-semibold text-slate-800">
              {companyContracts.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Previsto</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.expected)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Emitido</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.invoiced)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Pago líquido</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.paid)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Pendente</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.pending)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Inadimplente</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(summary.overdue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-sm"
              placeholder="Buscar contrato, cliente, órgão, NF ou referência"
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

          <div className="flex items-center">
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
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Lançamentos de faturamento
          </h3>
          <div className="text-sm text-slate-500">Modo visual ativo para testes</div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            Nenhum lançamento encontrado com os filtros informados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Contrato
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Órgão
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Ref.
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Parcela
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Valor bruto
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Valor líquido
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    NF
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Emissão
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Tributos
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Status NF
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Status Pgto
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Pagamento
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEntries.map((entry) => {
                  const editing = editingId === entry.id;

                  return (
                    <tr key={entry.id} className="border-t border-slate-200 align-top">
                      <td className="px-4 py-3 text-slate-700">{entry.contractNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.clientName}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.groupName}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.referenceMonth}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.installmentNumber}</td>

                      <td className="px-4 py-3 text-slate-700">
                        {editing ? (
                          <input
                            className="w-28 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                            value={entry.invoicedValue || entry.expectedValue || ""}
                            onChange={(e) =>
                              updateEntry(entry.id, "invoicedValue", e.target.value)
                            }
                          />
                        ) : (
                          formatMoney(entry.invoicedValue || entry.expectedValue)
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-700 font-semibold">
                        {formatMoney(entry.netValue)}
                      </td>

                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            className="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                            value={entry.invoiceNumber}
                            onChange={(e) =>
                              updateEntry(entry.id, "invoiceNumber", e.target.value)
                            }
                          />
                        ) : (
                          <span className="text-slate-700">{entry.invoiceNumber || "-"}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            type="date"
                            className="w-36 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                            value={entry.invoiceDate}
                            onChange={(e) =>
                              updateEntry(entry.id, "invoiceDate", e.target.value)
                            }
                          />
                        ) : (
                          <span className="text-slate-700">{entry.invoiceDate || "-"}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editing ? (
                          <div className="space-y-2 text-xs min-w-[150px]">
                            <label className="flex items-center gap-2 text-slate-700">
                              <input
                                type="checkbox"
                                checked={entry.hasIss ?? true}
                                onChange={(e) =>
                                  updateEntry(entry.id, "hasIss", e.target.checked)
                                }
                              />
                              ISS 5%
                            </label>

                            <label className="flex items-center gap-2 text-slate-700">
                              <input
                                type="checkbox"
                                checked={entry.outsideCity ?? false}
                                onChange={(e) =>
                                  updateEntry(entry.id, "outsideCity", e.target.checked)
                                }
                              />
                              Fora do município
                            </label>

                            <label className="flex items-center gap-2 text-slate-700">
                              <input
                                type="checkbox"
                                checked={entry.hasIr ?? true}
                                onChange={(e) =>
                                  updateEntry(entry.id, "hasIr", e.target.checked)
                                }
                              />
                              IR 4,8%
                            </label>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-600 space-y-1 min-w-[140px]">
                            <div>ISS: {formatMoney(entry.issValue)}</div>
                            <div>IR: {formatMoney(entry.irValue)}</div>
                            <div>
                              {entry.outsideCity ? "Serviço fora do município" : "Serviço local"}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editing ? (
                          <select
                            className="w-40 border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                            value={entry.invoiceStatus}
                            onChange={(e) =>
                              updateEntry(entry.id, "invoiceStatus", e.target.value)
                            }
                          >
                            <option>Pendente de emissão</option>
                            <option>Emitida</option>
                            <option>Cancelada</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass(
                              entry.invoiceStatus,
                            )}`}
                          >
                            {entry.invoiceStatus}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editing ? (
                          <select
                            className="w-36 border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                            value={entry.paymentStatus}
                            onChange={(e) =>
                              updateEntry(entry.id, "paymentStatus", e.target.value)
                            }
                          >
                            <option>Pendente</option>
                            <option>Pago</option>
                            <option>Pago em atraso</option>
                            <option>Inadimplente</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass(
                              entry.paymentStatus,
                            )}`}
                          >
                            {entry.paymentStatus}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            type="date"
                            className="w-36 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                            value={entry.paymentDate}
                            onChange={(e) =>
                              updateEntry(entry.id, "paymentDate", e.target.value)
                            }
                          />
                        ) : (
                          <span className="text-slate-700">{entry.paymentDate || "-"}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setEditingId(editing ? null : entry.id)}
                          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-xl transition"
                        >
                          {editing ? <Save size={15} /> : <Pencil size={15} />}
                          {editing ? "Salvar" : "Editar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-3">
          <ReceiptText className="text-blue-600" />
          <div>
            <p className="text-sm text-slate-500">Lançamentos</p>
            <p className="text-2xl font-bold text-slate-900">{filteredEntries.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-3">
          <CheckCircle2 className="text-green-600" />
          <div>
            <p className="text-sm text-slate-500">Pagos</p>
            <p className="text-2xl font-bold text-slate-900">
              {
                filteredEntries.filter(
                  (entry) =>
                    entry.paymentStatus === "Pago" ||
                    entry.paymentStatus === "Pago em atraso",
                ).length
              }
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-3">
          <AlertTriangle className="text-red-600" />
          <div>
            <p className="text-sm text-slate-500">Pendentes/Inadimplentes</p>
            <p className="text-2xl font-bold text-slate-900">
              {
                filteredEntries.filter(
                  (entry) =>
                    entry.paymentStatus === "Pendente" ||
                    entry.paymentStatus === "Inadimplente",
                ).length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
