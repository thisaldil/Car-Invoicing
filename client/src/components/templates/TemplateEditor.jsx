import React, { useState, useEffect, useRef } from "react";
import {
  SaveIcon,
  XIcon,
  PlusIcon,
  LayoutIcon,
  TypeIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import axios from "axios";
import api from "../../utils/axios";
import { Buffer } from "buffer";
import { useParams, useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import PdfInvoice from "../PdfInvoice";
import toast from "react-hot-toast";
import { ImageIcon } from "lucide-react";

const INVOICE_TYPE_LABELS = {
  type1: "PERFORMA INVOICE",
  type2: "COMMERCIAL INVOICE",
  type3: "INVOICE",
  type4: "CASH RECEIPT",
};

function TemplateEditor({ invoiceData, onSave, onCancel }) {
  if (typeof window !== "undefined" && !window.Buffer) {
    window.Buffer = Buffer;
  }
  // Internal theme state - no external context needed
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const [letterheadUrl, setLetterheadUrl] = useState(""); // top bar image
  const [termsText, setTermsText] = useState(
    "Payment: 100% of the total amount shall be paid by irrevocable L/C at sight within 2 weeks from date of contract.\n\n" +
      "Advising Bank: MUFG BANK, LTD. (SWIFT: BOTKJPJT)\n" +
      "Available With By: Any bank in Japan by negotiation\n" +
      "Draft: At sight\n" +
      "Partial Shipments: Not allowed   Transhipment: Allowed\n" +
      "Port of Loading: Any port, Japan   Port of Discharge: Any port, Sri Lanka\n" +
      "Latest Date of Shipment: 70 days from L/C issuing date\n" +
      "Documents Required: Invoice, Full set B/L, Insurance (if CIP/CIF)\n" +
      "Charges: All outside Japan including reimbursing charges are for applicant account.\n" +
      "Period for Presentation: 21 days from shipment but within validity."
  );
  const [templateName, setTemplateName] = useState("New Template");

  const [accentColor, setAccentColor] = useState("#3B82F6");

  const [selectedSection, setSelectedSection] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const userId = localStorage.getItem("userId");
  const previewRef = useRef();
  const [uploading, setUploading] = useState(false);
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const [bottomLayerUrl, setBottomLayerUrl] = useState("");

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      api
        .get(`/template/getTemplateById/${id}`)
        .then((res) => {
          const t = res.data;
          setTemplateName(t.name);

          setAccentColor(t.design.accentColor);

          // NEW: safe reads
          setLetterheadUrl(t.design?.letterheadUrl || "");
          setTermsText(t.design?.termsText || termsText);
          setBottomLayerUrl(t.design?.bottomLayerUrl || "");
        })
        .catch((err) => {
          console.error("Error loading template:", err);
          toast.error("Failed to load template for editing.");
          navigate("/template-manager");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const checkDuplicateInvoice = async (userId, invoiceNo) => {
    try {
      const { data } = await api.get(
        `/invoice/getInvoiceDetailsByUserId/${userId}`
      );
      return (
        Array.isArray(data) &&
        data.some((inv) => inv?.invoiceDetails?.invoiceNo === invoiceNo)
      );
    } catch (error) {
      if (error?.response?.status === 404) {
        return false;
      }
      console.error("Error checking duplicates:", error);
      throw new Error("Unable to verify existing invoices");
    }
  };

  const handleSave = async () => {
    let saveInvoicePayload;
    const updatedTemplate = {
      userId,
      name: templateName,
      description: "Custom invoice template",
      isDefault: false,

      design: {
        accentColor,

        letterheadUrl,
        termsText,
        bottomLayerUrl, // stored with the template
      },
    };

    setUploading(true);

    try {
      // --- INVOICE GENERATION MODE ---
      if (invoiceData) {
        // Use invoiceNo for car invoices
        const invoiceNo = invoiceData.invoiceNo;
        if (!invoiceNo) {
          toast.error("Invoice number is required.");
          setUploading(false);
          return;
        }
        const currentDate = new Date().toISOString().split("T")[0];
        const safeRef = String(invoiceNo).replace(/[^\w\-]+/g, "_");
        const fileName = `${safeRef}-invoice-${currentDate}.pdf`;

        // Duplicate check only if we have a real invoiceNo
        let duplicateExists = false;
        if (invoiceNo && invoiceNo !== "DRAFT") {
          try {
            duplicateExists = await checkDuplicateInvoice(userId, invoiceNo);
          } catch (err) {
            toast.error(err.message || "Duplicate check failed");
            setUploading(false);
            return;
          }
        }

        if (duplicateExists) {
          const confirmed = window.confirm(
            "An invoice with the same invoice number already exists. Do you want to continue anyway?"
          );
          if (!confirmed) {
            toast.error("Invoice creation cancelled.");
            setUploading(false);
            return;
          } else {
            toast.warning("Proceeding despite duplicate invoice number.");
          }
        }

        // Per-invoice terms override: use current editor terms if present
        const invoiceDataWithOverrides = {
          ...invoiceData,
          termsText, // this wins over template.design.termsText in PdfInvoice if coded that way
        };

        // Render PDF
        const blob = await pdf(
          <PdfInvoice
            invoiceData={invoiceDataWithOverrides}
            templateData={updatedTemplate}
          />
        ).toBlob();

        // Guard: Cloudinary env
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
          toast.error("Missing Cloudinary config.");
          setUploading(false);
          return;
        }

        // Upload PDF to Cloudinary
        const formData = new FormData();
        formData.append("file", blob, fileName);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const cloudinaryUrl = cloudinaryRes.data.secure_url;

        // Ensure template exists and we have an id
        let templateId = id;
        if (!templateId) {
          const created = await api.post(
            "/template/createTemplate",
            updatedTemplate
          );
          templateId = created?.data?._id;
        }

        // Save car invoice record
        saveInvoicePayload = {
          userId,
          pdfUrl: cloudinaryUrl,
          template: { _id: templateId },
          invoiceType: invoiceData.invoiceType || "type1",
          invoiceDetails: {
            consigneeName: invoiceData.consigneeName || "",
            addressLine1: invoiceData.addressLine1 || "",
            addressLine2: invoiceData.addressLine2 || "",
            addressLine3: invoiceData.addressLine3 || "",
            invoiceNo: invoiceData.invoiceNo || "",
            description: invoiceData.description || "",
            items: invoiceData.items || [],
          },
          priceDetails: {
            totalAmount: String(
              invoiceData.totalCIF || invoiceData.totalAmount || 0
            ),
            transactionId: String(invoiceData.transactionId || ""),
            paymentMethod: String(invoiceData.paymentMethod || ""),
          },
        };
        const saveInvoiceRes = await api.post(
          "/invoice/saveInvoiceDetails",
          saveInvoicePayload
        );

        onSave?.({
          template: updatedTemplate,
          invoiceId: saveInvoiceRes?.data?.invoice?._id,
        });

        navigate("/dashboard/send");
        return;
      }

      // --- TEMPLATE-ONLY MODE ---
      let response;
      if (isEditing) {
        response = await api.put(
          `/template/updateTemplate/${id}`,
          updatedTemplate
        );
        toast.success("Template updated successfully!");
      } else {
        response = await api.post("/template/createTemplate", updatedTemplate);
        toast.success("Template created successfully!");
      }

      onSave?.(response.data);
      navigate("/dashboard/templates");
    } catch (err) {
      console.error("Failed to save template or PDF:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status || data) {
        console.error("saveInvoiceDetails response:", status, data);
      }
      const msg =
        data?.error?.message ||
        data?.error ||
        data?.message ||
        err?.message ||
        "Error saving template or uploading PDF. Please try again.";
      toast.error(String(msg));
    } finally {
      setUploading(false);
    }
  };

  const onLetterheadChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setLetterheadUrl(ev.target.result.toString());
    };
    reader.readAsDataURL(file);
  };

  const onBottomLayerChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setBottomLayerUrl(ev.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  const sectionRefs = {
    header: useRef(null), // letterhead
    info: useRef(null), // middle: proforma content
    pricing: useRef(null), // kept for compatibility (unused in new layout)
    // Removed unused refs
    footer: useRef(null), // bottom: terms & conditions
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Template Editor
          </h1>
          <div className="flex flex-col md:flex-row md:space-x-3 items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2 md:mb-0"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <MoonIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <SunIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center mb-2 md:mb-0 transition-colors"
              disabled={uploading}
            >
              <XIcon className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className={`px-4 py-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white rounded-md flex items-center transition-colors ${
                uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <SaveIcon className="w-8 h-8 md:w-4 md:h-4 mr-2" />
              {uploading
                ? "Loading..."
                : invoiceData
                ? "Save & Continue"
                : "Save Template"}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Template Preview */}
          <div className="lg:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h2 className="font-medium text-gray-800 dark:text-gray-200">
                Preview
              </h2>
            </div>
            <div className="p-8 overflow-auto" ref={previewRef}>
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
                  ref={sectionRefs.header}
                  onClick={() => setSelectedSection("header")}
                  className={`flex items-center justify-center border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 h-32 md:h-36 px-6 transition-all duration-150 ${
                    selectedSection === "header"
                      ? "ring-2 ring-orange-500 dark:ring-orange-400 z-10"
                      : ""
                  }`}
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
                  ref={sectionRefs.info}
                  onClick={() => setSelectedSection("info")}
                  className={`p-8 md:p-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 transition-all duration-150 ${
                    selectedSection === "info"
                      ? "ring-2 ring-orange-500 dark:ring-orange-400 z-10"
                      : ""
                  }`}
                  style={{ minHeight: 400 }}
                >
                  {/* Invoice Type Title */}
                  <div className="flex justify-center mt-2 mb-6">
                    <span
                      className="font-bold text-2xl underline"
                      style={{ color: accentColor }}
                    >
                      {INVOICE_TYPE_LABELS[invoiceData?.invoiceType] ||
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
                          <tr
                            key={i}
                            className="text-gray-900 dark:text-gray-100"
                          >
                            <td className="border px-2 py-1">{i + 1}</td>
                            <td className="border px-2 py-1">
                              {r.make || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {r.model || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {r.chassisNo || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {r.year || "-"}
                            </td>
                            <td className="border px-2 py-1">
                              {r.hsCode || "-"}
                            </td>
                            <td className="border px-2 py-1">{r.qty || "-"}</td>
                            <td className="border px-2 py-1">{fmt(r.fob)}</td>
                            <td className="border px-2 py-1">
                              {fmt(r.insurance)}
                            </td>
                            <td className="border px-2 py-1">
                              {fmt(r.freight)}
                            </td>
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

                {/* FOOTER */}
                <div
                  ref={sectionRefs.footer}
                  onClick={() => setSelectedSection("footer")}
                  className={`p-8 md:p-10 transition-all duration-150 ${
                    selectedSection === "footer"
                      ? "ring-2 ring-orange-500 dark:ring-orange-400 z-10"
                      : ""
                  }`}
                  style={{
                    background:
                      theme === "dark"
                        ? accentColor + "22"
                        : accentColor + "0A",
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

                {/* BOTTOM IMAGE */}
                {bottomLayerUrl && (
                  <div
                    className="flex justify-end items-end px-8 pb-6 pt-2"
                    style={{
                      background: theme === "dark" ? "#222" : "#f9fafb",
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
            </div>
          </div>

          {/* Editor Controls */}
          <div className="lg:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h2 className="font-medium text-gray-800 dark:text-gray-200">
                Template Settings
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Letterhead uploader */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Letterhead Image (top bar)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-12 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden flex items-center justify-center">
                    {letterheadUrl ? (
                      <img
                        src={letterheadUrl}
                        alt="Letterhead"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <label className="bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-3 py-1 rounded cursor-pointer transition-colors">
                    Change
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={onLetterheadChange}
                    />
                  </label>
                </div>
              </div>

              {/* Terms & Conditions editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows={8}
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This appears as the third layer in the preview and in the PDF.
                </p>
              </div>
              {/* Bottom Layer Image (appears under Terms) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bottom Layer Image (under Terms)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-40 h-14 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden flex items-center justify-center">
                    {bottomLayerUrl ? (
                      <img
                        src={bottomLayerUrl}
                        alt="Bottom layer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <label className="bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-3 py-1 rounded cursor-pointer transition-colors">
                    Change
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={onBottomLayerChange}
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  PNG/JPG. Transparent PNG recommended.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded mr-4 cursor-pointer border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default TemplateEditor;
