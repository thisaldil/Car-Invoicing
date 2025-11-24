import React, { useMemo, useState } from "react";
import { PlusIcon, TrashIcon } from "lucide-react";

const MAKES = [
  "TOYOTA",
  "NISSAN",
  "MAZDA",
  "MITSUBISHI",
  "HONDA",
  "SUZUKI",
  "SUBARU",
  "ISUZU",
  "DAIHATSU",
  "MITSUOKA",
  "LEXUS",
  "ALFAROMEO",
  "ASTON MARTIN",
  "AUDI",
  "BENTLEY",
  "BMW",
  "BMW ALPINA",
  "CADILLAC",
  "CHEVROLET",
  "CHRYSLER",
  "CITROEN",
  "DAIMLER",
  "DODGE",
  "FERRARI",
  "FIAT",
  "FORD",
  "FRUEHAUF",
  "GM",
  "GMC",
  "HINO",
  "HITACHI",
  "HUMMER",
  "HYUNDAI",
  "ISEKI",
  "JAGUAR",
  "JEEP",
  "KAWASAKI",
  "KOMATSU",
  "KUBOTA",
  "LAMBORGHINI",
  "LANCIA",
  "LAND ROVER",
  "LINCOLN",
  "LOTUS",
  "MASERATI",
  "MERCEDES BENZ",
  "MINI",
  "MORGAN",
  "PEUGEOT",
  "PONTIAC",
  "PORSCHE",
  "RENAULT",
  "ROLLS ROYCE",
  "ROVER",
  "SAAB",
  "SMART",
  "TADANO",
  "TCM",
  "TESLA",
  "TRAILER",
  "VOLKSWAGEN",
  "VOLVO",
  "WINNEBAGO",
  "YAMAHA",
  "YANMAR",
  "OTHERS",
];

const MODELS_BY_MAKE = {
  TOYOTA: [
    "Corolla",
    "Camry",
    "Yaris",
    "Aqua",
    "Vitz",
    "RAV4",
    "Harrier",
    "Land Cruiser",
    "Prado",
    "Hilux",
    "Hiace",
    "Crown",
    "Premio",
    "Allion",
    "Axio",
  ],
  NISSAN: [
    "Note",
    "March",
    "Serena",
    "X-Trail",
    "Skyline",
    "Fuga",
    "Elgrand",
    "Juke",
    "Dayz",
    "Tiida",
    "Bluebird Sylphy",
    "NV350 Caravan",
  ],
  MAZDA: [
    "Demio (2)",
    "Axela (3)",
    "Atenza (6)",
    "CX-3",
    "CX-5",
    "CX-8",
    "Roadster (MX-5)",
    "Bongo",
  ],
  MITSUBISHI: [
    "Outlander",
    "RVR",
    "Pajero",
    "Delica D:5",
    "EK Wagon",
    "Lancer",
    "Mirage",
  ],
  HONDA: [
    "Fit (Jazz)",
    "Civic",
    "Accord",
    "Vezel (HR-V)",
    "CR-V",
    "N-BOX",
    "Freed",
    "Stepwgn",
  ],
  SUZUKI: ["Swift", "Alto", "Wagon R", "Hustler", "Spacia", "Jimny", "Every"],
  SUBARU: ["Impreza", "Legacy", "Forester", "XV", "Levorg", "Outback", "WRX"],
  ISUZU: ["Elf", "Forward", "Giga", "D-MAX", "MU-X"],
  DAIHATSU: ["Mira", "Tanto", "Move", "Hijet", "Rocky", "Copen"],
  MITSUOKA: ["Viewt", "Himiko", "Galue"],
  LEXUS: ["IS", "ES", "GS", "LS", "CT", "RX", "NX", "UX", "LX", "GX"],
  ALFAROMEO: ["Giulietta", "Giulia", "Stelvio", "MiTo"],
  "ASTON MARTIN": ["Vantage", "DB9", "DB11", "Rapide"],
  AUDI: ["A3", "A4", "A6", "A8", "Q2", "Q3", "Q5", "Q7", "TT"],
  BENTLEY: ["Continental GT", "Flying Spur", "Bentayga"],
  BMW: [
    "1 Series",
    "3 Series",
    "5 Series",
    "7 Series",
    "X1",
    "X3",
    "X5",
    "i3",
    "i8",
  ],
  "BMW ALPINA": ["B3", "B5", "B7", "D3"],
  CADILLAC: ["CTS", "ATS", "Escalade", "XT5"],
  CHEVROLET: ["Camaro", "Corvette", "Cruze", "Trailblazer"],
  CHRYSLER: ["300", "Pacifica", "PT Cruiser"],
  CITROEN: ["C3", "C4", "C5", "Berlingo", "DS3"],
  DAIMLER: ["XJ", "Super V8"],
  DODGE: ["Charger", "Challenger", "Durango", "Ram"],
  FERRARI: ["458", "488", "California", "F8", "Portofino"],
  FIAT: ["500", "Panda", "Punto", "500X"],
  FORD: ["Focus", "Fiesta", "Mustang", "Explorer", "Ranger"],
  FRUEHAUF: ["Trailer"],
  GM: ["Sierra", "Silverado"],
  GMC: ["Sierra", "Yukon", "Acadia", "Terrain"],
  HINO: ["Dutro", "Ranger", "Profia"],
  HITACHI: ["Excavator", "Wheel Loader"],
  HUMMER: ["H1", "H2", "H3"],
  HYUNDAI: ["i10", "i20", "Elantra", "Sonata", "Tucson", "Santa Fe"],
  ISEKI: ["Tractor", "Combine"],
  JAGUAR: ["XE", "XF", "XJ", "F-PACE", "E-PACE", "F-TYPE"],
  JEEP: ["Wrangler", "Cherokee", "Grand Cherokee", "Renegade", "Compass"],
  KAWASAKI: ["Ninja 250", "Ninja 400", "Z1000", "Versys"],
  KOMATSU: ["Excavator", "Forklift", "Bulldozer"],
  KUBOTA: ["Tractor", "Combine", "Excavator"],
  LAMBORGHINI: ["Huracán", "Aventador", "Urus", "Gallardo"],
  LANCIA: ["Ypsilon", "Delta", "Thema"],
  "LAND ROVER": [
    "Defender",
    "Discovery",
    "Range Rover",
    "Range Rover Sport",
    "Evoque",
    "Velar",
  ],
  LINCOLN: ["MKZ", "Navigator", "Aviator", "Continental"],
  LOTUS: ["Elise", "Exige", "Evora", "Emira"],
  MASERATI: ["Ghibli", "Quattroporte", "Levante", "GranTurismo"],
  "MERCEDES BENZ": [
    "A-Class",
    "C-Class",
    "E-Class",
    "S-Class",
    "GLA",
    "GLC",
    "GLE",
    "GLS",
    "V-Class",
  ],
  MINI: ["One", "Cooper", "Clubman", "Countryman"],
  MORGAN: ["4/4", "Plus 4", "Plus 8"],
  PEUGEOT: ["208", "308", "508", "2008", "3008", "5008"],
  PONTIAC: ["G6", "G8", "Firebird", "Trans Am"],
  PORSCHE: [
    "911",
    "Cayman",
    "Boxster",
    "Panamera",
    "Macan",
    "Cayenne",
    "Taycan",
  ],
  RENAULT: ["Clio", "Megane", "Talisman", "Captur", "Kadjar"],
  "ROLLS ROYCE": ["Phantom", "Ghost", "Wraith", "Dawn", "Cullinan"],
  ROVER: ["25", "45", "75", "Mini (classic)"],
  SAAB: ["9-3", "9-5", "900"],
  SMART: ["fortwo", "forfour"],
  TADANO: ["Rough Terrain Crane", "All Terrain Crane"],
  TCM: ["Forklift", "Reach Truck"],
  TESLA: ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck"],
  TRAILER: ["Flatbed", "Box", "Reefer"],
  VOLKSWAGEN: ["Polo", "Golf", "Passat", "Tiguan", "Touareg", "Transporter"],
  VOLVO: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
  WINNEBAGO: ["Brave", "Travato", "View"],
  YAMAHA: ["YZF-R3", "MT-07", "MT-09", "NMAX"],
  YANMAR: ["Tractor", "Combine Harvester"],
  OTHERS: ["Other"],
};

export default function ProformaInvoiceForm({ onSave }) {
  const [invoice, setInvoice] = useState({
    consigneeName: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    invoiceNo: "",
    date: new Date().toISOString().slice(0, 10),
    description: "USED MOTOR VEHICLES",
    invoiceType: "type1",
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
  });

  const totalCIF = useMemo(
    () =>
      invoice.items.reduce((sum, r) => {
        const cif = toNum(r.cif);
        return sum + (isFinite(cif) ? cif : 0);
      }, 0),
    [invoice.items]
  );

const handleItemChange = (index, key, value) => {
  setInvoice((prev) => {
    const next = { ...prev };
    next.items = prev.items.map((it, i) =>
      i === index ? { ...it, [key]: value } : it
    );
    
    // Recalculate CIF when FOB, Insurance, Freight, or Qty changes
    if (["fob", "insurance", "freight", "qty"].includes(key)) {
      const row = next.items[index];
      
      // Extract numeric quantity (handles "1 UNIT", "2 UNITS", "2", etc.)
      const qtyStr = String(row.qty || "1");
      const qtyMatch = qtyStr.match(/(\d+)/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      
      // Calculate CIF per unit
      const cifPerUnit = toNum(row.fob) + toNum(row.insurance) + toNum(row.freight);
      
      // Multiply by quantity
      const totalCif = cifPerUnit * quantity;
      
      next.items[index].cif =
        Number.isFinite(totalCif) && totalCif > 0 ? String(totalCif) : "";
    }
    
    if (key === "make") {
      const models = MODELS_BY_MAKE[value] || [];
      if (!models.includes(next.items[index].model)) {
        next.items[index].model = "";
      }
    }
    return next;
  });
};

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
    }));

  const removeRow = (index) =>
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invoice Type <span className="text-red-500">*</span>
            </label>
            <select
              value={invoice.invoiceType}
              onChange={(e) =>
                setInvoice((s) => ({ ...s, invoiceType: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            >
              <option value="type1">PERFORMA INVOICE</option>
              <option value="type2">COMMERCIAL INVOICE</option>
              <option value="type3">INVOICE</option>
              <option value="type4">CASH RECEIPT</option>
            </select>
          </div>
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
              {invoice.items.map((row, i) => {
                const models = MODELS_BY_MAKE[row.make] || [];
                return (
                  <tr key={i} className="text-gray-900 dark:text-gray-100">
                    <td className="border px-2 py-1">{i + 1}</td>
                    {/* Make */}
                    <td className="border px-2 py-1">
                      <select
                        value={row.make}
                        onChange={(e) =>
                          handleItemChange(i, "make", e.target.value)
                        }
                        className="w-full bg-transparent outline-none"
                      >
                        <option value="">— Select Make —</option>
                        {MAKES.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Model (depends on Make) */}
                    <td className="border px-2 py-1">
                      <select
                        value={row.model}
                        onChange={(e) =>
                          handleItemChange(i, "model", e.target.value)
                        }
                        disabled={!row.make}
                        className="w-full bg-transparent outline-none"
                      >
                        {!row.make ? (
                          <option value="">— Select make first —</option>
                        ) : (
                          <>
                            <option value="">— Select Model —</option>
                            {models.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
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
                );
              })}
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
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}) {
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
  );
}

function toNum(x) {
  const n = typeof x === "string" ? Number(x.replace(/,/g, "")) : Number(x);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}
