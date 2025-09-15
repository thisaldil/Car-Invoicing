import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import RequireAuth from "./components/auth/RequireAuth";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import TemplateManager from "./components/templates/TemplateManager.jsx";
import TemplateEditor from "./components/templates/TemplateEditor.jsx";
import SendOptions from "./components/send/SendOptions.jsx";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register.jsx";
import AllInvoices from "./components/AllInvoices";
import Settings from "./components/Settings";
import Crm from "./components/Crm";
import CarInvoiceForm from "./components/invoice/CarInvoiceForm";

function AppWrapper() {
  const [uploadedInvoice, setUploadedInvoice] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const navigate = useNavigate();

  // theme only
  useEffect(() => {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "system";
    const applyTheme = (mode) => {
      if (mode === "dark") html.classList.add("dark");
      else if (mode === "light") html.classList.remove("dark");
      else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        html.classList.toggle("dark", prefersDark);
      }
    };
    applyTheme(savedTheme);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <Toaster position="top-center" />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />

          <Route
            path="upload"
            element={
              <CarInvoiceForm
                onSave={(invoice) => {
                  setUploadedInvoice(invoice);
                  navigate("/dashboard/templates", { replace: true });
                }}
                onBack={() => navigate("/dashboard", { replace: true })}
                onContinue={(invoice) => {
                  setUploadedInvoice(invoice);
                  navigate("/dashboard/templates", { replace: true });
                }}
              />
            }
          />

          <Route
            path="templates"
            element={
              <TemplateManager
                invoiceData={uploadedInvoice}
                onSelectTemplate={({ template }) => {
                  setSelectedTemplate(template);
                  navigate(`/dashboard/template-editor/${template._id}`, {
                    replace: true,
                  });
                }}
                onCreateTemplate={() =>
                  navigate("/dashboard/template-editor", { replace: true })
                }
              />
            }
          />

          <Route
            path="template-editor"
            element={
              <TemplateEditor
                invoiceData={uploadedInvoice}
                onSave={({ template, invoiceId }) => {
                  setSelectedTemplate(template);
                  setGeneratedInvoice({ template, invoiceId });
                  navigate("/dashboard/send", { replace: true });
                }}
                onCancel={() =>
                  navigate("/dashboard/templates", { replace: true })
                }
              />
            }
          />

          <Route
            path="template-editor/:id"
            element={
              <TemplateEditor
                invoiceData={uploadedInvoice}
                onSave={({ template, invoiceId }) => {
                  setSelectedTemplate(template);
                  setGeneratedInvoice({ template, invoiceId });
                  navigate("/dashboard/send", { replace: true });
                }}
                onCancel={() =>
                  navigate("/dashboard/templates", { replace: true })
                }
              />
            }
          />

          <Route
            path="send"
            element={
              <SendOptions
                invoice={generatedInvoice}
                onBack={() =>
                  navigate("/dashboard/invoices", { replace: true })
                }
              />
            }
          />

          <Route
            path="invoices"
            element={
              <AllInvoices
                setGeneratedInvoice={(inv) => setGeneratedInvoice(inv)}
              />
            }
          />

          <Route path="crm" element={<Crm />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Root → protected home */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Route path="/register" element={<Register />} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
