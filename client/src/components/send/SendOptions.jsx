import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import {
  DownloadIcon,
  MailIcon,
  PhoneIcon,
  ArrowLeftIcon,
  CheckIcon,
} from "lucide-react";
import toast from "react-hot-toast";

// Utility function for formatting money
function formatMoney(n) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

// Utility function for summing CIF values
function sumCIF(items) {
  return (items || []).reduce((s, r) => s + (Number(r?.cif) || 0), 0);
}

function SendOptions({ invoice, onBack }) {
  const [invoiceData, setInvoiceData] = useState(null);
  const [sendMethod, setSendMethod] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [countryCodes, setCountryCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(
          `/invoice/getInvoiceDetailsByInvoiceId/${invoice.invoiceId}`
        );
        setInvoiceData(res.data);
      } catch (err) {
        console.error("Failed to load invoice preview", err);
      }
    };

    if (invoice?.invoiceId) {
      fetchInvoice();
    }
  }, [invoice?.invoiceId]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      if (sendMethod === "email") {
        await api.post("/invoice/sendInvoiceEmail", {
          email,
          pdfUrl: invoiceData?.pdfUrl,
        });
      }
      if (sendMethod === "whatsapp") {
        const message = `Dear Customer,\n\nThis is ${invoice.template.company.name}. Please find your invoice below:\n\n${invoiceData?.pdfUrl}\n\nThank you for your business.`;
        const sanitizedPhone = `${selectedCode}${phone.replace(/\D/g, "")}`;
        const whatsappLink = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(
          message
        )}`;
        window.open(whatsappLink, "_blank");
      }
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000);
      toast.success("Invoice sent successfully!");
    } catch (err) {
      toast.error("Failed to send invoice. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(invoiceData.pdfUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Create meaningful filename with booking reference and date
      const bookingRef =
        invoiceData?.invoiceDetails.bookingReference || "DRAFT";
      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `${bookingRef}-invoice-${currentDate}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        // Try the primary API first
        const res = await fetch("https://restcountries.com/v3.1/all");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();

        const codes = data
          .map((country) => ({
            name: country.name.common,
            code:
              country.idd?.root && country.idd?.suffixes
                ? `${country.idd.root}${country.idd.suffixes[0]}`
                : null,
          }))
          .filter((c) => c.code);

        const sortedCodes = codes.sort((a, b) => a.name.localeCompare(b.name));
        setCountryCodes(sortedCodes);

        const sriLanka = sortedCodes.find((c) => c.code === "+94");
        if (sriLanka) {
          setSelectedCode(sriLanka.code);
        }
      } catch (error) {
        console.error("Error fetching country codes:", error);
        // Fallback to a basic list of common country codes
        const fallbackCodes = [
          { name: "Sri Lanka", code: "+94" },
          { name: "United States", code: "+1" },
          { name: "United Kingdom", code: "+44" },
          { name: "India", code: "+91" },
          { name: "Australia", code: "+61" },
          { name: "Canada", code: "+1" },
          { name: "Germany", code: "+49" },
          { name: "France", code: "+33" },
          { name: "Japan", code: "+81" },
          { name: "China", code: "+86" },
          { name: "Singapore", code: "+65" },
          { name: "Malaysia", code: "+60" },
          { name: "Thailand", code: "+66" },
          { name: "United Arab Emirates", code: "+971" },
          { name: "Saudi Arabia", code: "+966" },
        ];
        setCountryCodes(fallbackCodes);
        setSelectedCode("+94");
      }
    };

    fetchCountryCodes();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Send Invoice
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Your invoice is ready! Preview it below and choose how you'd like to
        send it.
      </p>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <h2 className="font-medium text-gray-800 dark:text-white">
              Invoice Preview
            </h2>
            {invoiceData?.pdfUrl && (
              <button
                onClick={handleDownload}
                className="text-orange-600 hover:text-orange-800 flex items-center text-sm"
              >
                <DownloadIcon className="w-4 h-4 mr-1" />
                {isDownloading ? "Downloading..." : "Download Invoice"}
              </button>
            )}
          </div>
          <div className="p-4">
            {invoiceData?.pdfUrl ? (
              <div className="space-y-4">
                {/* PDF Preview */}
                <div className="flex justify-center">
                  <iframe
                    src={invoiceData.pdfUrl}
                    title="PDF Preview"
                    width="100%"
                    height="500px"
                    className="border rounded"
                  />
                </div>

                {/* Template Preview with Header and Footer */}
                <div className="mt-6 border border-gray-200 dark:border-gray-600 rounded-md overflow-visible bg-white dark:bg-gray-800">
                  {/* HEADER: Letterhead */}
                  <div className="border-b border-gray-200 dark:border-gray-600">
                    {invoice?.template?.design?.letterheadUrl ? (
                      <img
                        src={invoice.template.design.letterheadUrl}
                        alt="Letterhead"
                        className="w-full h-28 object-cover"
                      />
                    ) : (
                      <div className="h-28 flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-700">
                        No letterhead selected
                      </div>
                    )}
                  </div>

                  {/* MIDDLE: Invoice Content */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-sm">
                        <div className="text-gray-500 dark:text-gray-400">
                          Consignee
                        </div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {invoiceData?.invoiceDetails?.consigneeName || "--"}
                        </div>
                        <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                          {[
                            invoiceData?.invoiceDetails?.addressLine1,
                            invoiceData?.invoiceDetails?.addressLine2,
                            invoiceData?.invoiceDetails?.addressLine3,
                          ]
                            .filter(Boolean)
                            .join("\n") || "--"}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div
                          className="font-bold text-xl"
                          style={{
                            color:
                              invoice?.template?.design?.accentColor ||
                              "#3B82F6",
                          }}
                        >
                          PROFORMA INVOICE
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          Invoice No.:{" "}
                          <span className="font-medium">
                            {invoiceData?.invoiceDetails?.invoiceNo || "--"}
                          </span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          Date:{" "}
                          <span className="font-medium">
                            {invoiceData?.invoiceDetails?.date || "--"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        Description:{" "}
                      </span>
                      <span className="text-gray-800 dark:text-gray-100">
                        {invoiceData?.invoiceDetails?.description ||
                          "USED MOTOR VEHICLES"}
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
                          {(invoiceData?.invoiceDetails?.items || []).map(
                            (r, i) => (
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
                                <td className="border px-2 py-1">
                                  {r.qty || "-"}
                                </td>
                                <td className="border px-2 py-1">
                                  {formatMoney(r.fob)}
                                </td>
                                <td className="border px-2 py-1">
                                  {formatMoney(r.insurance)}
                                </td>
                                <td className="border px-2 py-1">
                                  {formatMoney(r.freight)}
                                </td>
                                <td className="border px-2 py-1">
                                  {formatMoney(r.cif)}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Total CIF */}
                    <div className="text-right mt-4 font-bold text-gray-900 dark:text-gray-100">
                      Total CIF:{" "}
                      {formatMoney(
                        sumCIF(invoiceData?.invoiceDetails?.items || [])
                      )}
                    </div>
                  </div>

                  {/* FOOTER: Terms & Conditions */}
                  <div
                    className="p-6"
                    style={{
                      backgroundColor: invoice?.template?.design?.accentColor
                        ? invoice.template.design.accentColor + "20"
                        : "#3B82F620",
                    }}
                  >
                    <h3
                      className="font-medium mb-2"
                      style={{
                        color:
                          invoice?.template?.design?.accentColor || "#3B82F6",
                      }}
                    >
                      Terms & Conditions
                    </h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                      {invoice?.template?.design?.termsText ||
                        "No terms and conditions set."}
                    </pre>
                  </div>

                  {/* BOTTOM LAYER: Bottom Image */}
                  {invoice?.template?.design?.bottomLayerUrl && (
                    <div className="p-6">
                      <div className="flex justify-end">
                        <img
                          src={invoice.template.design.bottomLayerUrl}
                          alt="Bottom layer"
                          className="h-16 md:h-20 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Details Summary */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Invoice Summary
                  </h3>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Invoice No:
                      </span>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {invoiceData?.invoiceDetails?.invoiceNo || "--"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Date:
                      </span>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {invoiceData?.invoiceDetails?.date || "--"}
                      </p>
                    </div>
                  </div>

                  {/* Consignee Info */}
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Consignee:
                    </span>
                    <p className="text-gray-800 dark:text-white font-medium">
                      {invoiceData?.invoiceDetails?.consigneeName || "--"}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {[
                        invoiceData?.invoiceDetails?.addressLine1,
                        invoiceData?.invoiceDetails?.addressLine2,
                        invoiceData?.invoiceDetails?.addressLine3,
                      ]
                        .filter(Boolean)
                        .join(", ") || "No address provided"}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Description:
                    </span>
                    <p className="text-gray-800 dark:text-white">
                      {invoiceData?.invoiceDetails?.description ||
                        "USED MOTOR VEHICLES"}
                    </p>
                  </div>

                  {/* Items Summary */}
                  {invoiceData?.invoiceDetails?.items &&
                    invoiceData.invoiceDetails.items.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Vehicles ({invoiceData.invoiceDetails.items.length}):
                        </span>
                        <div className="mt-2 space-y-1">
                          {invoiceData.invoiceDetails.items
                            .slice(0, 3)
                            .map((item, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-700 dark:text-gray-300"
                              >
                                {index + 1}. {item.make || "N/A"}{" "}
                                {item.model || "N/A"} ({item.year || "N/A"}) -
                                Chassis: {item.chassisNo || "N/A"}
                              </div>
                            ))}
                          {invoiceData.invoiceDetails.items.length > 3 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ... and{" "}
                              {invoiceData.invoiceDetails.items.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Total Amount */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-800 dark:text-white">
                        Total Amount:
                      </span>
                      <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        $
                        {formatMoney(
                          invoiceData?.priceDetails?.totalAmount || 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-300">
                Loading preview...
              </p>
            )}
          </div>
        </div>

        <div className="md:w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h2 className="font-medium text-gray-800 dark:text-white">
              Send Options
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  How would you like to send this invoice?
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSendMethod("email")}
                    className={`flex items-center w-full p-3 border rounded-md ${
                      sendMethod === "email"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900"
                        : "border-gray-300 dark:border-gray-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mr-4 ${
                        sendMethod === "email"
                          ? "bg-orange-100"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <MailIcon
                        className={`w-5 h-5 ${
                          sendMethod === "email"
                            ? "text-orange-600"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        Send via Email
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send the invoice directly to your client's email address
                      </p>
                    </div>
                    {sendMethod === "email" && (
                      <CheckIcon className="w-5 h-5 text-orange-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setSendMethod("whatsapp")}
                    className={`flex items-center w-full p-3 border rounded-md ${
                      sendMethod === "whatsapp"
                        ? "border-green-500 bg-green-50 dark:bg-green-900"
                        : "border-gray-300 dark:border-gray-600 hover:border-green-300 hover:bg-green-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mr-4 ${
                        sendMethod === "whatsapp"
                          ? "bg-green-100"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <PhoneIcon
                        className={`w-5 h-5 ${
                          sendMethod === "whatsapp"
                            ? "text-green-600"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        Send via WhatsApp
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send the invoice through WhatsApp to your client's phone
                        number
                      </p>
                    </div>
                    {sendMethod === "whatsapp" && (
                      <CheckIcon className="w-5 h-5 text-orange-600" />
                    )}
                  </button>
                </div>
              </div>

              {sendMethod === "email" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  />
                </div>
              )}

              {sendMethod === "whatsapp" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recipient Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCode}
                      onChange={(e) => setSelectedCode(e.target.value)}
                      className="w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.name})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="712345678"
                      className="w-2/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {isSent && (
                <div className="bg-green-50 dark:bg-green-800 text-green-800 dark:text-green-200 p-3 rounded-md flex items-center">
                  <CheckIcon className="w-5 h-5 mr-2" />
                  <span>Invoice sent successfully!</span>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={onBack}
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-white"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleSend}
                  disabled={
                    !sendMethod ||
                    (sendMethod === "email" && !email) ||
                    (sendMethod === "whatsapp" && !phone) ||
                    isSending
                  }
                  className={`px-6 py-2 rounded-md ${
                    !sendMethod ||
                    (sendMethod === "email" && !email) ||
                    (sendMethod === "whatsapp" && !phone) ||
                    isSending
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {isSending ? "Sending..." : "Send Invoice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendOptions;
