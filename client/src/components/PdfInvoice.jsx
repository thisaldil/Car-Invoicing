import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

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

  const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];
  const totalCIF = items.reduce((sum, r) => sum + toNum(r?.cif), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead bar (full width) */}
        {letterheadUrl ? (
          <Image src={letterheadUrl} style={styles.letterhead} />
        ) : (
          <View
            style={[
              styles.letterheadFallback,
              { backgroundColor: accentColor },
            ]}
          />
        )}

        {/* Title/Meta row */}
        <View style={styles.topRow}>
          {/* Left: Consignee */}
          <View style={styles.blockLeft}>
            <Text style={styles.blockLabel}>Consignee</Text>
            <Text style={styles.blockText}>
              {safe(invoiceData.consigneeName)}
              {line(invoiceData.addressLine1)}
              {line(invoiceData.addressLine2)}
              {line(invoiceData.addressLine3)}
            </Text>
          </View>

          {/* Right: PROFORMA and meta */}
          <View style={styles.blockRight}>
            <Text style={[styles.proformaTitle, { color: accentColor }]}>
              PROFORMA INVOICE
            </Text>
            <Text style={styles.metaText}>
              Invoice No.:{" "}
              <Text style={styles.metaStrong}>{safe(bookingRef)}</Text>
            </Text>
            <Text style={styles.metaText}>
              Date: <Text style={styles.metaStrong}>{safe(displayDate)}</Text>
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

        {/* Terms & Conditions */}
        {!!termsText && (
          <View style={styles.termsSection}>
            <Text style={[styles.termsTitle, { color: accentColor }]}>
              Terms &amp; Conditions
            </Text>
            <Text style={styles.termsBody}>{termsText}</Text>
          </View>
        )}

        {/* Bottom signature image (align right) */}
        {!!bottomLayerUrl && (
          <View style={styles.signatureRow}>
            <View style={{ flex: 1 }} />
            <Image src={bottomLayerUrl} style={styles.signatureImg} />
          </View>
        )}
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

/* ---------- styles (React-PDF / RN style) ---------- */
const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 24,
    fontSize: 10,
    color: "#111",
    backgroundColor: "#fff",
  },

  letterhead: {
    width: "100%",
    height: 60,
  },
  letterheadFallback: {
    width: "100%",
    height: 8,
    borderRadius: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  blockLeft: {
    width: "55%",
    paddingRight: 8,
  },
  blockRight: {
    width: "45%",
    alignItems: "flex-end",
  },
  blockLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  blockText: {
    fontSize: 11,
    lineHeight: 1.35,
    color: "#111827",
    whiteSpace: "pre", // React-PDF supports literal \n in Text
  },

  proformaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 10,
    color: "#374151",
    marginTop: 1,
  },
  metaStrong: {
    fontWeight: "bold",
    color: "#111827",
  },

  section: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginRight: 4,
  },
  sectionText: {
    fontSize: 11,
  },

  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  tr: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },
  trHead: {
    backgroundColor: "#f3f4f6",
  },
  th: {
    flex: 1,
    fontSize: 9,
    fontWeight: "bold",
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },
  td: {
    flex: 1,
    fontSize: 9,
    paddingVertical: 6,
    paddingHorizontal: 4,
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
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginRight: 6,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },

  termsSection: {
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    backgroundColor: "#fafafa",
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  termsBody: {
    fontSize: 9.5,
    color: "#374151",
    lineHeight: 1.35,
  },

  signatureRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 16,
  },
  signatureImg: {
    width: 140,
    height: 48,
  },
});

export default PdfInvoice;
