import React from "react";

const INVOICE_TYPE_LABELS = {
  type1: "PERFORMA INVOICE",
  type2: "COMMERCIAL INVOICE",
  type3: "INVOICE",
  type4: "CASH RECEIPT",
};

function toNum(x) {
  const n = typeof x === "string" ? Number(x.replace(/,/g, "")) : Number(x);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n) {
  const v = toNum(n);
  return v
    ? new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(v)
    : n || "-";
}

function sumCIF(items) {
  return (items || []).reduce((s, r) => s + toNum(r?.cif), 0);
}

export default function InvoicePreview({ invoiceData, templateData }) {
  // Extract template design settings
  const design = templateData?.design || {};
  const accentColor = design.accentColor || "#3B82F6";
  const letterheadUrl = design.letterheadUrl || null;
  const termsText = design.termsText || "";
  const bottomLayerUrl = design.bottomLayerUrl || null;

  // Check for dark mode (you might want to use a context or prop for this)
  const isDarkMode = 
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <div
      className="relative mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
      style={{
        maxWidth: 800,
        minHeight: 900,
        boxShadow:
          "0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.07)",
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        className="flex items-center justify-center border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 h-32 md:h-36 px-6"
        style={{
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
          minHeight: 110,
        }}
      >
        {letterheadUrl ? (
          <img
            src={letterheadUrl}
            alt="Letterhead"
            className="max-h-28 md:max-h-32 w-auto object-contain"
            style={{ maxWidth: "100%" }}
          />
        ) : (
          <div className="h-20 flex items-center justify-center text-gray-400 w-full">
            No letterhead selected
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div
        className="p-8 md:p-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600"
        style={{ minHeight: 400 }}
      >
        {/* Invoice Type Title */}
        <div className="flex justify-center mb-6">
          <span
            className="font-bold text-2xl underline"
            style={{ color: accentColor }}
          >
            {INVOICE_TYPE_LABELS[invoiceData?.invoiceType] ||
              invoiceData?.invoiceType ||
              "INVOICE"}
          </span>
        </div>

        <div className="flex justify-between items-start mb-4">
          {/* Consignee Block */}
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
              Consignee:
            </span>
            <div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">
                {invoiceData?.consigneeName || "--"}
              </div>
              <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                {[
                  invoiceData?.addressLine1,
                  invoiceData?.addressLine2,
                  invoiceData?.addressLine3,
                ]
                  .filter(Boolean)
                  .join("\n") || "--"}
              </div>
            </div>
          </div>
          {/* Invoice No. & Date Block */}
          <div className="flex flex-col items-end text-sm">
            <div className="text-gray-700 dark:text-gray-300 mb-1">
              <span className="font-medium">Invoice No.:</span>{" "}
              {invoiceData?.invoiceNo || "--"}
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Date:</span>{" "}
              {invoiceData?.date || "--"}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="font-medium text-gray-800 dark:text-gray-100">
            Description:{" "}
          </span>
          <span className="text-gray-800 dark:text-gray-100">
            {invoiceData?.description || "USED MOTOR VEHICLES"}
          </span>
        </div>

        {/* Vehicles table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-xs md:text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <tr>
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
              </tr>
            </thead>
            <tbody>
              {(invoiceData?.items || []).map((r, i) => (
                <tr key={i} className="text-gray-900 dark:text-gray-100">
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{r.make || "-"}</td>
                  <td className="border px-2 py-1">{r.model || "-"}</td>
                  <td className="border px-2 py-1">{r.chassisNo || "-"}</td>
                  <td className="border px-2 py-1">{r.year || "-"}</td>
                  <td className="border px-2 py-1">{r.hsCode || "-"}</td>
                  <td className="border px-2 py-1">{r.qty || "-"}</td>
                  <td className="border px-2 py-1">{fmt(r.fob)}</td>
                  <td className="border px-2 py-1">{fmt(r.insurance)}</td>
                  <td className="border px-2 py-1">{fmt(r.freight)}</td>
                  <td className="border px-2 py-1">{fmt(r.cif)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total CIF */}
        <div className="text-right mt-4 font-bold text-gray-900 dark:text-gray-100">
          Total CIF: {fmt(sumCIF(invoiceData?.items || []))}
        </div>
      </div>

      {/* FOOTER - Terms & Conditions */}
      {termsText && (
        <div
          className="p-8 md:p-10"
          style={{
            background: accentColor + (isDarkMode ? "22" : "0A"),
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderBottomLeftRadius: bottomLayerUrl ? 0 : 18,
            borderBottomRightRadius: bottomLayerUrl ? 0 : 18,
            borderTop: "1px solid #e5e7eb",
            minHeight: 120,
          }}
        >
          <h3
            className="font-semibold mb-2"
            style={{ color: accentColor, fontSize: 18 }}
          >
            Terms & Conditions
          </h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
            {termsText}
          </pre>
        </div>
      )}

      {/* BOTTOM IMAGE */}
      {bottomLayerUrl && (
        <div
          className="flex justify-end items-end px-8 pb-6 pt-2"
          style={{
            background: isDarkMode ? "#222" : "#f9fafb",
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
          }}
        >
          <img
            src={bottomLayerUrl}
            alt="Bottom layer"
            className="h-16 md:h-20 object-contain"
            style={{ maxWidth: 220 }}
          />
        </div>
      )}
    </div>
  );
}