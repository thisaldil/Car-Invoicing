import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const INVOICE_TYPE_LABELS = {
  type1: "PERFORMA INVOICE",
  type2: "COMMERCIAL INVOICE",
  type3: "INVOICE",
  type4: "CASH RECEIPT",
};

const PdfInvoice = ({ invoiceData = {}, templateData = {} }) => {
  const design = templateData.design || {};
  const accentColor = design.accentColor || "#3B82F6";
  const letterheadUrl = design.letterheadUrl || null;
  const termsText = (invoiceData.termsText ?? design.termsText) || "";
  const bottomLayerUrl = design.bottomLayerUrl || null;

  const bookingRef =
    invoiceData.bookingReference || invoiceData.invoiceNo || "";
  const displayDate =
    invoiceData.date ||
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "numeric",
      year: "numeric",
    });

  // Get the correct invoice type label
  const invoiceTypeLabel =
    INVOICE_TYPE_LABELS[invoiceData?.invoiceType] ||
    invoiceData?.invoiceType ||
    "INVOICE";

  const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];
  const totalCIF = items.reduce((sum, r) => sum + toNum(r?.cif), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Wrap everything in a flex container */}
        <View style={styles.pageContainer}>
          {/* Letterhead bar (full width) */}
          {letterheadUrl ? (
            <Image src={letterheadUrl} style={styles.letterhead} />
          ) : (
            <View style={styles.letterheadFallback} />
          )}

          {/* Main content section - grows to fill space */}
          <View style={styles.mainContent}>
            {/* Invoice Type Title - Centered */}
            <View style={styles.titleRow}>
              <Text style={[styles.invoiceTitle, { color: accentColor }]}>
                {invoiceTypeLabel}
              </Text>
            </View>

            {/* Consignee and Invoice Meta Row */}
            <View style={styles.topRow}>
              {/* Left: Consignee */}
              <View style={styles.blockLeft}>
                <Text style={styles.blockLabel}>Consignee:</Text>
                <Text style={styles.blockText}>
                  {safe(invoiceData.consigneeName)}
                  {line(invoiceData.addressLine1)}
                  {line(invoiceData.addressLine2)}
                  {line(invoiceData.addressLine3)}
                </Text>
              </View>

              {/* Right: Invoice meta */}
              <View style={styles.blockRight}>
                <Text style={styles.metaText}>
                  Invoice No.:{" "}
                  <Text style={styles.metaStrong}>{safe(bookingRef)}</Text>
                </Text>
                <Text style={styles.metaText}>
                  Date:{" "}
                  <Text style={styles.metaStrong}>{safe(displayDate)}</Text>
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description: </Text>
              <Text style={styles.sectionText}>
                {safe(invoiceData.description) || "USED MOTOR VEHICLES"}
              </Text>
            </View>

            {/* Vehicles table */}
            <View style={styles.table}>
              <View style={[styles.tr, styles.trHead]}>
                {[
                  "#",
                  "Make",
                  "Model",
                  "Chassis No",
                  "Year",
                  "HS Code",
                  "Qty",
                  "FOB",
                  "Insurance",
                  "Freight",
                  "CIF",
                ].map((h, i) => (
                  <Text
                    key={h}
                    style={[styles.th, i === 10 && styles.noRightBorder]}
                  >
                    {h}
                  </Text>
                ))}
              </View>

              {items.map((it, i) => (
                <View key={i} style={styles.tr}>
                  <Text style={styles.td}>{i + 1}</Text>
                  <Text style={styles.td}>{safe(it.make) || "-"}</Text>
                  <Text style={styles.td}>{safe(it.model) || "-"}</Text>
                  <Text style={styles.td}>{safe(it.chassisNo) || "-"}</Text>
                  <Text style={styles.td}>{safe(it.year) || "-"}</Text>
                  <Text style={styles.td}>{safe(it.hsCode) || "-"}</Text>
                  <Text style={styles.td}>{safe(it.qty) || "-"}</Text>
                  <Text style={styles.td}>{fmt(it.fob)}</Text>
                  <Text style={styles.td}>{fmt(it.insurance)}</Text>
                  <Text style={styles.td}>{fmt(it.freight)}</Text>
                  <Text style={[styles.td, styles.noRightBorder]}>
                    {fmt(it.cif)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total CIF:</Text>
              <Text style={styles.totalValue}>{fmt(totalCIF)}</Text>
            </View>
          </View>

          {/* Spacer to push footer to bottom */}
          <View style={{ flex: 1 }} />

          {/* Terms & Conditions - Colored footer section */}
          {!!termsText && (
            <View
              style={[
                styles.termsSection,
                { backgroundColor: hexToRgba(accentColor, 0.08) },
              ]}
            >
              <Text style={[styles.termsTitle, { color: accentColor }]}>
                Terms & Conditions
              </Text>
              <Text style={styles.termsBody}>{termsText}</Text>
            </View>
          )}

          {/* Bottom signature image (align right) */}
          {!!bottomLayerUrl && (
            <View style={styles.signatureRow}>
              <Image src={bottomLayerUrl} style={styles.signatureImg} />
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

/* ---------- helpers ---------- */
function toNum(x) {
  const n = typeof x === "string" ? Number(x.replace(/,/g, "")) : Number(x);
  return Number.isFinite(n) ? n : 0;
}
function fmt(n) {
  const v = toNum(n);
  if (!v) return n ? String(n) : "-";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}
function safe(s) {
  return s == null ? "" : String(s);
}
function line(s) {
  return s ? `\n${s}` : "";
}
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---------- styles (React-PDF / RN style) ---------- */
const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
    fontSize: 10,
    color: "#111",
    backgroundColor: "#fff",
  },

  // NEW: Flex container for the entire page
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
  },

  letterhead: {
    width: "100%",
    height: 80,
    objectFit: "contain",
  },
  letterheadFallback: {
    width: "100%",
    height: 80,
    backgroundColor: "#f9fafb",
  },

  mainContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#f9fafb",
    flexGrow: 1, // Allow content to grow
  },

  titleRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textDecoration: "underline",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  blockLeft: {
    width: "55%",
    flexDirection: "row",
  },
  blockRight: {
    width: "45%",
    alignItems: "flex-end",
  },
  blockLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginRight: 8,
  },
  blockText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#111827",
  },

  metaText: {
    fontSize: 10,
    color: "#374151",
    marginTop: 2,
  },
  metaStrong: {
    fontWeight: "bold",
    color: "#111827",
  },

  section: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 4,
  },
  sectionText: {
    fontSize: 10,
  },

  table: {
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  trHead: {
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  th: {
    flex: 1,
    fontSize: 8,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },
  td: {
    flex: 1,
    fontSize: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },
  noRightBorder: {
    borderRightWidth: 0,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginRight: 6,
  },
  totalValue: {
    fontSize: 11,
    fontWeight: "bold",
  },

  termsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexShrink: 0, // Prevent shrinking
  },
  termsTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
  },
  termsBody: {
    fontSize: 9,
    color: "#1f2937",
    lineHeight: 1.4,
  },

  signatureRow: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "flex-end",
    backgroundColor: "#f9fafb",
    flexShrink: 0, // Prevent shrinking
  },
  signatureImg: {
    width: 120,
    height: 50,
    objectFit: "contain",
  },
});

export default PdfInvoice;