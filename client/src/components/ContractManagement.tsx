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

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);

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
    items: [{ description: "", quantity: 1, unitValue: 0 }],
  });

  async function loadContracts() {
    setLoading(true);
    try {
      const res = await fetch("/api/contracts");
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadContracts();
  }, []);

  function handleChange(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleItemChange(index: number, field: string, value: any) {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm((prev) => ({ ...prev, items: newItems }));
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitValue: 0 }],
    }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    try {
      await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      setShowForm(false);
      loadContracts();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar contrato");
    }
  }

  return (
    <div>
      <h2>Contratos</h2>

      <button onClick={() => setShowForm(true)}>Novo Contrato</button>

      {loading && <p>Carregando...</p>}

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Nº</th>
            <th>Ano</th>
            <th>Município</th>
            <th>CNPJ</th>
            <th>Valor Atual</th>
            <th>Vigência Final</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.id}>
              <td>{c.contractNumber}</td>
              <td>{c.year}</td>
              <td>{c.clientName}</td>
              <td>{c.cnpj}</td>
              <td>{c.currentTerm?.totalValue}</td>
              <td>{c.currentTerm?.endDate}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div style={{ marginTop: 20 }}>
          <h3>Novo Contrato</h3>

          <form onSubmit={handleSubmit}>
            <input
              placeholder="Número"
              value={form.contractNumber}
              onChange={(e) => handleChange("contractNumber", e.target.value)}
            />

            <input
              placeholder="Município"
              value={form.clientName}
              onChange={(e) => handleChange("clientName", e.target.value)}
            />

            <input
              placeholder="CNPJ"
              value={form.cnpj}
              onChange={(e) => handleChange("cnpj", e.target.value)}
            />

            <input
              placeholder="Objeto"
              value={form.object}
              onChange={(e) => handleChange("object", e.target.value)}
            />

            <input
              type="date"
              value={form.signatureDate}
              onChange={(e) => handleChange("signatureDate", e.target.value)}
            />

            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />

            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />

            <input
              type="number"
              value={form.installments}
              onChange={(e) => handleChange("installments", Number(e.target.value))}
            />

            <h4>Itens</h4>

            {form.items.map((item, index) => (
              <div key={index}>
                <input
                  placeholder="Descrição"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Qtd"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                />

                <input
                  type="number"
                  placeholder="Valor"
                  value={item.unitValue}
                  onChange={(e) =>
                    handleItemChange(index, "unitValue", Number(e.target.value))
                  }
                />
              </div>
            ))}

            <button type="button" onClick={addItem}>
              + Item
            </button>

            <br />
            <br />

            <button type="submit">Salvar</button>
          </form>
        </div>
      )}
    </div>
  );
}
