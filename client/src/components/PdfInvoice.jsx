import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const PdfInvoice = ({ invoiceData, templateData }) => {
  // Fallbacks for template fields
  const company = templateData?.company || {};
  const design = templateData?.design || {};
  const accentColor = design.accentColor || "#3B82F6";
  const showFooter = design.showFooter !== false;
  const footerText = design.footerText || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {company.logo && <Image src={company.logo} style={styles.logo} />}
            <Text style={{ ...styles.companyName, color: accentColor }}>
              {company.name || ""}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ ...styles.invoiceTitle, color: accentColor }}>
              INVOICE
            </Text>
            <Text style={styles.invoiceRef}>
              Invoice No: {invoiceData?.invoiceNo || ""}
            </Text>
            <Text style={styles.date}>
              Date:{" "}
              {invoiceData?.date ||
                new Date().toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
            </Text>
          </View>
        </View>

        {/* Company & Client Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>From</Text>
            <Text style={styles.infoText}>
              {company.address ||
                "123 Business Street\nCity, State 12345\nPhone: (123) 456-7890\nEmail: info@yourcompany.com"}
            </Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>To</Text>
            <Text style={styles.infoText}>
              {invoiceData?.consigneeName || "Consignee Name"}
              {invoiceData?.addressLine1 && `\n${invoiceData.addressLine1}`}
              {invoiceData?.addressLine2 && `\n${invoiceData.addressLine2}`}
              {invoiceData?.addressLine3 && `\n${invoiceData.addressLine3}`}
            </Text>
          </View>
        </View>

        {/* Vehicle Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>#</Text>
              <Text style={styles.tableHeaderText}>Make</Text>
              <Text style={styles.tableHeaderText}>Model</Text>
              <Text style={styles.tableHeaderText}>Chassis No</Text>
              <Text style={styles.tableHeaderText}>Year</Text>
              <Text style={styles.tableHeaderText}>HS Code</Text>
              <Text style={styles.tableHeaderText}>Qty</Text>
              <Text style={styles.tableHeaderText}>FOB</Text>
              <Text style={styles.tableHeaderText}>Insurance</Text>
              <Text style={styles.tableHeaderText}>Freight</Text>
              <Text style={styles.tableHeaderText}>CIF</Text>
            </View>
            {invoiceData?.items?.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{i + 1}</Text>
                <Text style={styles.tableCell}>{item.make || "-"}</Text>
                <Text style={styles.tableCell}>{item.model || "-"}</Text>
                <Text style={styles.tableCell}>{item.chassisNo || "-"}</Text>
                <Text style={styles.tableCell}>{item.year || "-"}</Text>
                <Text style={styles.tableCell}>{item.hsCode || "-"}</Text>
                <Text style={styles.tableCell}>{item.qty || "-"}</Text>
                <Text style={styles.tableCell}>{formatMoney(item.fob)}</Text>
                <Text style={styles.tableCell}>
                  {formatMoney(item.insurance)}
                </Text>
                <Text style={styles.tableCell}>
                  {formatMoney(item.freight)}
                </Text>
                <Text style={styles.tableCell}>{formatMoney(item.cif)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Summary</Text>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Total CIF:</Text>
            <Text style={styles.pricingValue}>
              {formatMoney(invoiceData?.totalCIF || 0)}
            </Text>
          </View>
        </View>

        {/* Terms and Conditions */}
        {design.termsText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms and Conditions</Text>
            <Text style={styles.termsText}>{design.termsText}</Text>
          </View>
        )}

        {/* Footer */}
        {showFooter && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>{footerText}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

const formatMoney = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1 solid #eee",
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "50%",
  },
  logo: {
    height: 40,
    width: 100,
    marginBottom: 8,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "medium",
  },
  headerRight: {
    alignItems: "flex-end",
    width: "50%",
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "medium",
    marginBottom: 4,
  },
  invoiceRef: {
    color: "#666",
    marginBottom: 2,
  },
  date: {
    color: "#666",
    fontSize: 10,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    borderBottom: "1 solid #eee",
    paddingBottom: 16,
  },
  infoBlock: {
    width: "48%",
  },
  infoLabel: {
    fontSize: 10,
    color: "#888",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11,
    color: "#222",
    whiteSpace: "pre-line",
  },
  section: {
    marginBottom: 16,
    borderBottom: "1 solid #eee",
    paddingBottom: 12,
  },
  sectionTitle: {
    fontWeight: "medium",
    fontSize: 13,
    marginBottom: 8,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottom: "1 solid #e2e8f0",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "medium",
    padding: 6,
    textAlign: "center",
    borderRight: "1 solid #e2e8f0",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e2e8f0",
  },
  tableCell: {
    fontSize: 9,
    padding: 6,
    textAlign: "center",
    borderRight: "1 solid #e2e8f0",
    flex: 1,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 12,
    fontWeight: "medium",
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 10,
    color: "#666",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    textAlign: "center",
    borderTop: "1 solid #eee",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 9,
    color: "#888",
  },
});

export default PdfInvoice;
