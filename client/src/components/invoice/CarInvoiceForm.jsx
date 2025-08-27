import React, { useEffect, useMemo, useState } from "react"
import { PlusIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

export default function CarInvoiceForm({ onBack, onContinue, onSave }) {
  const [makes, setMakes] = useState([])
  const [modelsByMake, setModelsByMake] = useState({})
  const [loadingMake, setLoadingMake] = useState(false)
  const [loadingModel, setLoadingModel] = useState(false)

  const [invoice, setInvoice] = useState({
    consigneeName: "",
    invoiceNo: "",
    date: new Date().toISOString().slice(0, 10),
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    description: "USED MOTOR VEHICLES",
    currency: "LKR",
    items: [
      {
        make: "",
        model: "",
        chassisNo: "",
        year: "",
        hsCode: "",
        qty: 1,
        fob: "",
        insurance: "",
        freight: "",
        cif: "",
      },
    ],
    paymentTerm: "Irrevocable L/C at sight draft within 2 weeks",
    advisingBank: "",
    swiftCode: "",
    availableWith: "Any bank in Japan by negotiation",
    lcExpiryDays: 90,
    latestShipmentDays: 70,
    draft: "At Sight",
    partialShipmentsAllowed: "No",
    transshipmentAllowed: "Yes",
    portLoading: "",
    portDischarge: "",
    presentationDays: 21,
    remarks:
      "Beneficiary’s certificate, Certificate of Origin, Packing List not required. Funds to be transferred within 3 working days upon receipt of conforming docs. L/C draft to be sent for review before issuance.",
    beneficiary: "",
    beneficiaryAddress: "",
  })

  const totalCIF = useMemo(
    () =>
      invoice.items.reduce((sum, r) => {
        const cif = toNum(r.cif)
        return sum + (isFinite(cif) ? cif : 0)
      }, 0),
    [invoice.items]
  )

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        setLoadingMake(true)
        const url =
          "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json"
        const res = await fetch(url)
        const data = await res.json()
        const names = (data?.Results || [])
          .map((r) => r.MakeName)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
        setMakes(names)
      } finally {
        setLoadingMake(false)
      }
    }
    fetchMakes()
  }, [])

  const handleItemChange = (index, key, value) => {
    setInvoice((prev) => {
      const next = { ...prev }
      next.items = prev.items.map((it, i) =>
        i === index ? { ...it, [key]: value } : it
      )
      if (["fob", "insurance", "freight"].includes(key)) {
        const row = next.items[index]
        const cif = toNum(row.fob) + toNum(row.insurance) + toNum(row.freight)
        next.items[index].cif = Number.isFinite(cif) && cif > 0 ? String(cif) : ""
      }
      return next
    })
  }

  const addRow = () =>
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          make: "",
          model: "",
          chassisNo: "",
          year: "",
          hsCode: "",
          qty: 1,
          fob: "",
          insurance: "",
          freight: "",
          cif: "",
        },
      ],
    }))

  const removeRow = (index) =>
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))

  const fetchModelsForMake = async (make) => {
    if (!make || modelsByMake[make]) return
    try {
      setLoadingModel(true)
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(
        make
      )}?format=json`
      const res = await fetch(url)
      const data = await res.json()
      const names = (data?.Results || [])
        .map((r) => r.Model_Name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
      setModelsByMake((m) => ({ ...m, [make]: names }))
    } finally {
      setLoadingModel(false)
    }
  }

  const isValid = useMemo(() => {
    const headerOk =
      invoice.consigneeName.trim() &&
      invoice.invoiceNo.trim() &&
      invoice.date &&
      invoice.currency.trim()

    const rowsOk =
      invoice.items.length > 0 &&
      invoice.items.every(
        (r) =>
          r.make &&
          r.model &&
          r.chassisNo.trim() &&
          r.year &&
          r.hsCode.trim() &&
          Number(r.qty) > 0 &&
          toNum(r.fob) >= 0 &&
          toNum(r.insurance) >= 0 &&
          toNum(r.freight) >= 0 &&
          toNum(r.cif) > 0
      )

    return Boolean(headerOk && rowsOk)
  }, [invoice])

  const save = () => onSave?.(invoice)
  const next = () => onContinue?.(invoice)

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Car Invoice (Manual Entry)
        </h1>
        <span className="inline-flex items-center px-3 py-1 text-sm rounded-md bg-orange-100 text-orange-700 dark:bg-orange-200">
          Total CIF: {invoice.currency} {formatMoney(totalCIF)}
        </span>
      </header>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Consignee & Invoice
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="Consignee (Company)"
            value={invoice.consigneeName}
            onChange={(v) => setInvoice((s) => ({ ...s, consigneeName: v }))}
            required
          />
          <Field
            label="Invoice No."
            value={invoice.invoiceNo}
            onChange={(v) => setInvoice((s) => ({ ...s, invoiceNo: v }))}
            required
          />
          <Field
            label="Date"
            type="date"
            value={invoice.date}
            onChange={(v) => setInvoice((s) => ({ ...s, date: v }))}
            required
          />
          <Field
            label="Currency"
            value={invoice.currency}
            onChange={(v) => setInvoice((s) => ({ ...s, currency: v }))}
            placeholder="e.g., LKR, USD, JPY"
            required
          />
          <Field
            label="Address line 1"
            value={invoice.addressLine1}
            onChange={(v) => setInvoice((s) => ({ ...s, addressLine1: v }))}
          />
          <Field
            label="Address line 2"
            value={invoice.addressLine2}
            onChange={(v) => setInvoice((s) => ({ ...s, addressLine2: v }))}
          />
          <Field
            label="Address line 3"
            value={invoice.addressLine3}
            onChange={(v) => setInvoice((s) => ({ ...s, addressLine3: v }))}
          />
          <Field
            label="Description"
            value={invoice.description}
            onChange={(v) => setInvoice((s) => ({ ...s, description: v }))}
          />
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Vehicle Details
          </h2>
          <button
            onClick={addRow}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
          >
            <PlusIcon className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        <div className="space-y-4">
          {invoice.items.map((row, i) => {
            const models = row.make ? modelsByMake[row.make] || [] : []
            return (
              <div
                key={i}
                className="rounded-md border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Item {i + 1}
                  </h3>
                  <button
                    onClick={() => removeRow(i)}
                    className="text-red-600 hover:text-red-700"
                    title="Remove"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-1 gap-3">
                  <SelectField
                    label={loadingMake ? "Make (loading...)" : "Make"}
                    value={row.make}
                    onChange={async (v) => {
                      handleItemChange(i, "make", v)
                      handleItemChange(i, "model", "")
                      await fetchModelsForMake(v)
                    }}
                    options={makes}
                    required
                  />
                  <SelectField
                    label={
                      loadingModel && !modelsByMake[row.make]
                        ? "Model (loading...)"
                        : "Model"
                    }
                    value={row.model}
                    onChange={(v) => handleItemChange(i, "model", v)}
                    options={models}
                    disabled={!row.make}
                    required
                  />
                  <Field
                    label="Chassis No."
                    value={row.chassisNo}
                    onChange={(v) => handleItemChange(i, "chassisNo", v)}
                    required
                  />
                  <Field
                    label="Year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={row.year}
                    onChange={(v) => handleItemChange(i, "year", v)}
                    required
                  />
                  <Field
                    label="HS Code"
                    value={row.hsCode}
                    onChange={(v) => handleItemChange(i, "hsCode", v)}
                    placeholder="e.g., 8703.40.35"
                    required
                  />
                  <Field
                    label="Qty"
                    type="number"
                    min="1"
                    value={row.qty}
                    onChange={(v) => handleItemChange(i, "qty", Number(v))}
                    required
                  />
                </div>

                <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-3 mt-3">
                  <MoneyField
                    label="FOB"
                    value={row.fob}
                    currency={invoice.currency}
                    onChange={(v) => handleItemChange(i, "fob", v)}
                  />
                  <MoneyField
                    label="Insurance"
                    value={row.insurance}
                    currency={invoice.currency}
                    onChange={(v) => handleItemChange(i, "insurance", v)}
                  />
                  <MoneyField
                    label="Freight"
                    value={row.freight}
                    currency={invoice.currency}
                    onChange={(v) => handleItemChange(i, "freight", v)}
                  />
                  <MoneyField
                    label="CIF"
                    value={row.cif}
                    currency={invoice.currency}
                    onChange={(v) => handleItemChange(i, "cif", v)}
                    readOnly
                  />
                  <div className="hidden lg:block" />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={save}
            className="px-6 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Save
          </button>
          <button
            onClick={next}
            disabled={!isValid}
            className={`flex items-center px-6 py-2 rounded-md ${
              isValid
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required, type = "text", textarea = false, className = "", min, max }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
          required={required}
        />
      )}
    </div>
  )
}

function MoneyField({ label, value, onChange, currency, readOnly }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex items-center">
        <span className="mr-2 font-semibold text-gray-600 dark:text-gray-300">
          {currency}
        </span>
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 ${readOnly ? "bg-gray-50 dark:bg-gray-700" : ""}`}
        />
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options, required, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
      >
        <option value="">{disabled ? "Select make first" : "Select"}</option>
        {options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function toNum(x) {
  const n = typeof x === "string" ? Number(x.replace(/,/g, "")) : Number(x)
  return Number.isFinite(n) ? n : 0
}

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0)
}
