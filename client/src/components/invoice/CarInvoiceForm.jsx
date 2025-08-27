import React, { useEffect, useMemo, useState } from "react"
import { PlusIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

const API_KEY = "K+PWSMhZ3khsoUg8gJTnzA==8gSEMzLHhLbRwqR8"

// Predefined makes list (you can expand this)
const MAKES = [
  "Toyota",
  "Nissan",
  "Honda",
  "Mercedes-Benz",
  "BMW",
  "Ford",
  "Mazda",
  "Mitsubishi",
  "Hyundai",
  "Kia",
]

export default function CarInvoiceForm({ onBack, onContinue, onSave }) {
  const [modelsByMake, setModelsByMake] = useState({})
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
        year: "",
        chassisNo: "",
        hsCode: "",
        qty: 1,
        fob: "",
        insurance: "",
        freight: "",
        cif: "",
      },
    ],
  })

  const totalCIF = useMemo(
    () =>
      invoice.items.reduce((sum, r) => {
        const cif = toNum(r.cif)
        return sum + (isFinite(cif) ? cif : 0)
      }, 0),
    [invoice.items]
  )

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
          year: "",
          chassisNo: "",
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

  // Fetch all models for a make across multiple years
  const fetchModelsForMake = async (make) => {
    if (!make) return
    if (modelsByMake[make]) return
    try {
      setLoadingModel(true)
      const models = new Set()
      for (let year = 2015; year <= 2024; year++) {
        const url = `https://api.api-ninjas.com/v1/cars?make=${encodeURIComponent(
          make
        )}&year=${year}`
        const res = await fetch(url, { headers: { "X-Api-Key": API_KEY } })
        const data = await res.json()
        data.forEach((car) => models.add(car.model))
      }
      setModelsByMake((m) => ({ ...m, [make]: Array.from(models).sort() }))
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
          r.year &&
          r.chassisNo.trim() &&
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
        <div className="space-y-4">
          {invoice.items.map((row, i) => {
            const models = row.make ? modelsByMake[row.make] || [] : []
            return (
              <div
                key={i}
                className="rounded-md border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700"
              >
                <div className="grid md:grid-cols-3 gap-3">
                  <Field
                    label="Make"
                    value={row.make}
                    onChange={async (v) => {
                      handleItemChange(i, "make", v)
                      handleItemChange(i, "model", "")
                      await fetchModelsForMake(v)
                    }}
                    required
                    as="select"
                    options={MAKES}
                  />
                  <Field
                    label={loadingModel ? "Model (loading...)" : "Model"}
                    value={row.model}
                    onChange={(v) => handleItemChange(i, "model", v)}
                    required
                    as="select"
                    options={models}
                    placeholder="Select Model"
                  />
                  <Field
                    label="Year"
                    type="number"
                    value={row.year}
                    onChange={(v) => handleItemChange(i, "year", v)}
                    required
                  />
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

function Field({ label, value, onChange, placeholder, required, type = "text", as, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      {as === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          required={required}
        >
          <option value="">{placeholder || "Select"}</option>
          {options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          required={required}
        />
      )}
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
