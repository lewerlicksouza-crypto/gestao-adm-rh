<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
  <div>
    <span className="text-slate-500">Tipo:</span>
    <div className="font-medium text-slate-900 mt-1">
      {getTermLabel(selectedContract.currentTerm)}
    </div>
  </div>

  <div>
    <span className="text-slate-500">Número do termo:</span>
    <div className="font-medium text-slate-900 mt-1">
      {selectedContract.currentTerm?.termType === "initial"
        ? "0"
        : selectedContract.currentTerm?.termNumber ?? "-"}
    </div>
  </div>

  <div>
    <span className="text-slate-500">Índice aplicado:</span>
    <div className="font-medium text-slate-900 mt-1">
      {selectedContract.reajustIndex ?? "-"}
    </div>
  </div>

  <div>
    <span className="text-slate-500">Percentual:</span>
    <div className="font-medium text-slate-900 mt-1">
      {selectedContract.currentTerm?.reajustPercent ?? "0.00"}%
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
