"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";

interface CustomerData {
  name: string;
  email: string;
  address: string;
}

interface LineItem {
  name: string;
  description: string;
  cost: number;
  quantity: number;
}

export default function GeneratePDF() {
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    address: "",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [optimizedTotal, setOptimizedTotal] = useState<number>(0);
  const [signature, setSignature] = useState<string>("");
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedCustomerData = localStorage.getItem("customerData");
    const storedSummary = localStorage.getItem("summary");
    const storedLineItems = localStorage.getItem("lineItems");
    const storedSignature = localStorage.getItem("signature");

    if (storedCustomerData) {
      try {
        setCustomerData(JSON.parse(storedCustomerData));
      } catch (error) {
        console.error("Error parsing customer data:", error);
      }
    }

    if (storedSummary) {
      try {
        const summary = JSON.parse(storedSummary);
        setTotal(summary?.total || 0);
        setOptimizedTotal(summary?.optimizedTotal || 0);
      } catch (error) {
        console.error("Error parsing summary data:", error);
      }
    }

    if (storedLineItems) {
      try {
        setLineItems(JSON.parse(storedLineItems));
      } catch (error) {
        console.error("Error parsing line items:", error);
      }
    }

    if (storedSignature) {
      setSignature(storedSignature);
    }
  }, []);

  const downloadPDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save(`ADU_Construction_Quote.pdf`);
    router.push("/");
    localStorage.clear();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ADU Construction Quote</h2>

      <div ref={pdfRef} style={styles.pdfPreview}>
        <h3 style={styles.subtitle}>Customer Details</h3>
        <p>
          <strong>Name:</strong> {customerData.name}
        </p>
        <p>
          <strong>Email:</strong> {customerData.email}
        </p>
        <p>
          <strong>Address:</strong> {customerData.address}
        </p>

        <hr style={styles.divider} />

        <h3 style={styles.subtitle}>Construction Line Items</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeaderCell}>Item</th>
              <th style={styles.tableHeaderCell}>Description</th>
              <th style={styles.tableHeaderCell}>Quantity</th>
              <th style={styles.tableHeaderCell}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} style={styles.tableRow}>
                <td style={styles.tableCell}>{item.name}</td>
                <td style={styles.tableCell}>{item.description}</td>
                <td style={styles.tableCell}>{item.quantity}</td>
                <td style={styles.tableCell}>${item.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr style={styles.divider} />

        <div style={styles.totalSection}>
          <p style={styles.totalText}>
            <strong>Total:</strong> ${total}
          </p>
          <p style={styles.optimizedTotalText}>
            <strong>Optimized Total (AI):</strong> ${optimizedTotal}
          </p>
        </div>

        <hr style={styles.divider} />

        <h3 style={styles.subtitle}>Authorized Signature</h3>
        {signature ? (
          <Image
            src={signature}
            alt="Signature"
            width={192}
            height={192}
            unoptimized
            className="border border-gray-300 rounded-md"
          />
        ) : (
          <p style={styles.noSignatureText}>No signature provided.</p>
        )}
      </div>

      <div style={styles.buttonContainer}>
        <button onClick={downloadPDF} style={styles.downloadButton}>
          Download PDF
        </button>
        <button
          onClick={() => {
            router.push("/");
            localStorage.clear();
          }}
          style={styles.backButton}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "56rem",
    margin: "2.5rem auto 0",
    padding: "1.5rem",
    backgroundColor: "#ffffff",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
  },
  pdfPreview: {
    padding: "1.5rem",
    border: "1px solid #d1d5db",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f9fafb",
    borderRadius: "0.5rem",
    textAlign: "left",
  },
  subtitle: {
    fontSize: "1.125rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  divider: {
    margin: "1rem 0",
    borderColor: "#d1d5db",
    borderWidth: "1px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #d1d5db",
    fontSize: "0.875rem",
  },
  tableHeaderRow: {
    backgroundColor: "#e5e7eb",
  },
  tableHeaderCell: {
    border: "1px solid #d1d5db",
    padding: "0.5rem",
  },
  tableRow: {
    border: "1px solid #d1d5db",
  },
  tableCell: {
    border: "1px solid #d1d5db",
    padding: "0.5rem",
  },
  totalSection: {
    textAlign: "right",
  },
  totalText: {
    fontSize: "1.125rem",
  },
  optimizedTotalText: {
    fontSize: "1.125rem",
    color: "#2563eb",
  },
  signatureImage: {
    width: "12rem",
    height: "6rem",
    border: "1px solid #d1d5db",
  },
  noSignatureText: {
    color: "#6b7280",
  },
  buttonContainer: {
    marginTop: "1.5rem",
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
  },
  downloadButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    cursor: "pointer",
  },
  backButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#4b5563",
    color: "#ffffff",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    cursor: "pointer",
  },
};
