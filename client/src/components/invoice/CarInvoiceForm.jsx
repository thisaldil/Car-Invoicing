import React, { useMemo, useState } from "react"
import { PlusIcon, TrashIcon } from "lucide-react"

export default function ProformaInvoiceForm({ onSave }) {
  const [invoice, setInvoice] = useState({
    consigneeName: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    invoiceNo: "",
    date: new Date().toISOString().slice(0, 10),
    description: "USED MOTOR VEHICLES",
    items: [
      {
        make: "",
        model: "",
        chassisNo: "",
        year: "",
        hsCode: "",
        qty: "1 UNIT",
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
        const cif =
          toNum(row.fob) + toNum(row.insurance) + toNum(row.freight)
        next.items[index].cif =
          Number.isFinite(cif) && cif > 0 ? String(cif) : ""
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
          qty: "1 UNIT",
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

  return (
    <div className="space-y-8">
      {/* Customer/Consignee Details */}
      <section className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Customer Details
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
            label="Description"
            value={invoice.description}
            onChange={(v) => setInvoice((s) => ({ ...s, description: v }))}
          />
          <Field
            label="Address Line 1"
            value={invoice.addressLine1}
            onChange={(v) => setInvoice((s) => ({ ...s, addressLine1: v }))}
          />
          <Field
            label="Address Line 2"
            value={invoice.addressLine2}
            onChange={(v) => setInvoice((s) => ({ ...s, addressLine2: v }))}
          />
          <Field
            label="Address Line 3"
            value={invoice.addressLine3}
            onChange={(v) => setInvoice((s) => ({ ...s, addressLine3: v }))}
          />
        </div>
      </section>

      {/* Vehicle Details */}
      <section className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Vehicle Details
          </h2>
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
          >
            <PlusIcon className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-400 dark:border-gray-600 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Make</th>
                <th className="border px-2 py-1">Model</th>
                <th className="border px-2 py-1">Chassis No</th>
                <th className="border px-2 py-1">Year</th>
                <th className="border px-2 py-1">HS Code</th>
                <th className="border px-2 py-1">Qty</th>
                <th className="border px-2 py-1">FOB</th>
                <th className="border px-2 py-1">Insurance</th>
                <th className="border px-2 py-1">Freight</th>
                <th className="border px-2 py-1">CIF</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((row, i) => (
                <tr key={i} className="text-gray-900 dark:text-gray-100">
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={row.make}
                      onChange={(e) =>
                        handleItemChange(i, "make", e.target.value)
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={row.model}
                      onChange={(e) =>
                        handleItemChange(i, "model", e.target.value)
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={row.chassisNo}
                      onChange={(e) =>
                        handleItemChange(i, "chassisNo", e.target.value)
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={row.year}
                      onChange={(e) =>
                        handleItemChange(i, "year", e.target.value)
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={row.hsCode}
                      onChange={(e) =>
                        handleItemChange(i, "hsCode", e.target.value)
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={row.qty}
                      onChange={(e) =>
                        handleItemChange(i, "qty", e.target.value)
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={row.fob}
                      onChange={(e) =>
                        handleItemChange(i, "fob", e.target.value)
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={row.insurance}
                      onChange={(e) =>
                        handleItemChange(i, "insurance", e.target.value)
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={row.freight}
                      onChange={(e) =>
                        handleItemChange(i, "freight", e.target.value)
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">{row.cif}</td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => removeRow(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right mt-4 font-bold text-gray-900 dark:text-white">
          Total CIF: {formatMoney(totalCIF)}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => onSave?.(invoice)}
          className="px-6 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
        >
          Save Invoice
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        required={required}
      />
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
