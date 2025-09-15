import React, { useEffect, useState } from "react";
import {
  FileTextIcon,
  FileUpIcon,
  SendIcon,
  BoxIcon,
  QuoteIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../utils/axios";
//import avatar from "../images/default-avatar.png";

function Dashboard({ setGeneratedInvoice }) {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [allInvoices, setAllInvoices] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [monthlyInvoices, setMonthlyInvoices] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [lastMonthInvoices, setLastMonthInvoices] = useState([]);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get(
          `https://car-invoicing.vercel.app/invoice/getInvoiceDetailsByUserId/${userId}`
        );

        const allInvoices = res.data.map((inv) => ({
          ...inv,
          date: inv.date
            ? new Date(inv.date).toISOString().split("T")[0]
            : "N/A",
        }));

        const sortedInvoices = allInvoices.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setRecentInvoices(sortedInvoices.slice(0, 5));

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear =
          currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthInvoices = allInvoices.filter((inv) => {
          const invoiceDate = new Date(inv.date);
          return (
            invoiceDate.getFullYear() === currentYear &&
            invoiceDate.getMonth() === currentMonth
          );
        });

        const lastMonthInvoicesFiltered = allInvoices.filter((inv) => {
          const invoiceDate = new Date(inv.date);
          return (
            invoiceDate.getFullYear() === lastMonthYear &&
            invoiceDate.getMonth() === lastMonth
          );
        });

        const currentRevenue = currentMonthInvoices.reduce(
          (sum, inv) => sum + parseFloat(inv.priceDetails?.totalAmount || 0),
          0
        );

        const previousRevenue = lastMonthInvoicesFiltered.reduce(
          (sum, inv) => sum + parseFloat(inv.priceDetails?.totalAmount || 0),
          0
        );

        setAllInvoices(allInvoices);
        setMonthlyInvoices(currentMonthInvoices);
        setLastMonthInvoices(lastMonthInvoicesFiltered);
        setMonthlyRevenue(
          currentRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
        setLastMonthRevenue(previousRevenue);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          console.error("Failed to load invoices:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 space-y-10 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md" />
          <div className="flex items-center space-x-3">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md" />
            <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="h-6 w-40 bg-gray-300 dark:bg-gray-600 rounded-md" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    );
  }

  const invoiceChange =
    lastMonthInvoices.length > 0
      ? (
          ((monthlyInvoices.length - lastMonthInvoices.length) /
            lastMonthInvoices.length) *
          100
        ).toFixed(1)
      : "N/A";

  const revenueChange =
    lastMonthRevenue > 0
      ? (
          ((parseFloat(monthlyRevenue.replace(/,/g, "")) - lastMonthRevenue) /
            lastMonthRevenue) *
          100
        ).toFixed(1)
      : "N/A";

  const handleSend = (invoice) => {
    if (!invoice) return;

    setGeneratedInvoice({
      template: {
        _id: invoice.template?._id,
        company: {
          name: invoice.template?.company?.name,
          logo: invoice.template?.company?.logo,
          address: invoice.template?.company?.address,
        },
      },
      invoiceId: invoice._id,
      invoiceDetails: {
        ...invoice.invoiceDetails,
        ...invoice.priceDetails,
        pdfUrl: invoice.pdfUrl,
      },
    });

    navigate("/dashboard/send");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        {user && (
          <div className="flex items-center space-x-3 ">
            <span className="hidden md:block text-gray-700 font-medium dark:text-white">
              {user.name}
            </span>
            {/* <img
              src={
                user?.picture
                  ? user.picture
                      .replace("=s96-c", "")
                      .replace("http://", "https://")
                  : avatar
              }
              alt={user.name}
              className="w-10 h-10 object-cover rounded-full border border-gray-300 "
            /> */}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link
          to={`/dashboard/upload`}
          className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-full">
              <FileUpIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">Create a New Invoice</h3>
              <p className="text-sm text-white text-opacity-90">
                Create a new car invoice
              </p>
            </div>
          </div>
        </Link>

        {/* <Link
          to={`/dashboard/quotation`}
          className="bg-green-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-full">
              <QuoteIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">Create New Quatation</h3>
              <p className="text-sm text-white text-opacity-90">
                Create a new quatation for customers
              </p>
            </div>
          </div>
        </Link> */}

        <Link
          to={`/dashboard/templates`}
          className="bg-purple-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-full">
              <BoxIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">Manage Templates</h3>
              <p className="text-sm text-white text-opacity-90">
                Manage the created templates
              </p>
            </div>
          </div>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Recent Invoices
          </h2>
          <Link
            to={"/dashboard/invoices"}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-white">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-white">
                  Consingee
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-white">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-white">
                  Amount
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-gray-500 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-4 px-4 text-sm text-gray-800 dark:text-white">
                    {invoice.invoiceType || "Invoice"}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800 dark:text-white">
                    {invoice.invoiceDetails?.consigneeName || "N/A"}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-white">
                    {invoice.date}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800 font-medium dark:text-white">
                    {invoice.invoiceDetails?.items.cif}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleSend(invoice)}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    >
                      <FileTextIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSend(invoice)}
                      className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <SendIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Invoices  This Month",
            value: `${monthlyInvoices.length}`,
            change: invoiceChange === "N/A" ? "N/A" : `${invoiceChange}%`,
            isPositive:
              invoiceChange !== "N/A" && parseFloat(invoiceChange) >= 0,
          },
          {
            label: "This Month Revenue",
            value: `$${monthlyRevenue}`,
            change: revenueChange === "N/A" ? "N/A" : `${revenueChange}%`,
            isPositive:
              revenueChange !== "N/A" && parseFloat(revenueChange) >= 0,
          },
          {
            label: "All Invoices ",
            value: `${allInvoices.length}`,
            change: "",
            isPositive: true,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {stat.label}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {stat.value}
              </h3>
              <span
                className={`text-sm flex items-center gap-1 ${
                  stat.change === "N/A"
                    ? "text-gray-400"
                    : stat.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {stat.change === "N/A" ? "N/A" : stat.isPositive ? "↑" : "↓"}{" "}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Dashboard;
