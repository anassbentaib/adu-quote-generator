"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

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

export default function Summary() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    address: "",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [optimizedTotal, setOptimizedTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setCustomerData(JSON.parse(localStorage.getItem("customerData") || "{}"));
    setLineItems(JSON.parse(localStorage.getItem("lineItems") || "[]"));
  }, []);

  useEffect(() => {
    const newTotal = lineItems.reduce(
      (sum, item) => sum + item.cost * item.quantity,
      0
    );
    setTotal(newTotal);
  }, [lineItems]);

  const optimizeCost = async () => {
    if (!lineItems.length) return;
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/optimize-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineItems }),
      });
      const data = await response.json();

      if (data.optimizedCost) {
        setOptimizedTotal(data.optimizedCost);
      }
    } catch (error) {
      console.error("Error optimizing cost:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleNextClick = () => {
    const data = {
      customerData,
      lineItems,
      total,
      optimizedTotal,
    };

    localStorage.setItem("summary", JSON.stringify(data));
    router.push("/signature");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto my-10 p-8 bg-white shadow-xl rounded-lg"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Summary
      </h2>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6"
      >
        <h3 className="text-xl font-semibold mb-2 text-gray-700">
          Customer Details
        </h3>
        <p className="text-gray-600">
          <strong>Name:</strong> {customerData.name}
        </p>
        <p className="text-gray-600">
          <strong>Email:</strong> {customerData.email}
        </p>
        <p className="text-gray-600">
          <strong>Address:</strong> {customerData.address}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Construction Line Items
        </h3>
        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 border rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <h4 className="text-lg font-medium text-gray-800">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-sm font-semibold text-gray-800">
                  Cost: ${item.cost} x {item.quantity}
                </p>
              </div>
              <FaCheckCircle className="text-green-500 text-xl w-10" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-100 p-4 rounded-lg shadow-sm"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Total Cost:</h3>
          <p className="text-xl font-bold text-blue-600">${total}</p>
        </div>
        {optimizedTotal !== null && (
          <p className="text-xl font-semibold  mt-2">
            Optimized Total (AI):{" "}
            <span className="text-blue-600">${optimizedTotal}</span>
          </p>
        )}
      </motion.div>

      <div className="flex justify-between mt-6">
        <button
          onClick={optimizeCost}
          className="px-6 py-2 cursor-pointer flex items-center gap-2 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition"
        >
          {loading ? (
            <>
              <ImSpinner8 className="animate-spin" />
              Optimizing...
            </>
          ) : (
            "Optimize Cost (AI)"
          )}
        </button>
        <div>
          <button onClick={handleNextClick} className="submit-button">
            Proceed to Signature
          </button>
        </div>
      </div>
    </motion.div>
  );
}
