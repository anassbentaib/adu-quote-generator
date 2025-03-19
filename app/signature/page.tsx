"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignaturePage() {
  const [isSigned, setIsSigned] = useState(false);
  const router = useRouter();
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsSigned(false);
    }
  };

  const saveSignature = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert("Please sign before proceeding.");
      return;
    }

    const signatureData = signatureRef.current.toDataURL("image/png");

    localStorage.setItem("signature", signatureData);

    router.push("/generate-pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto mt-10 p-8 bg-white shadow-xl rounded-lg text-center"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Sign Below</h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="border border-gray-300 rounded-md overflow-hidden p-2"
      >
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{ className: "w-full h-40" }}
          onEnd={() => setIsSigned(true)}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex justify-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearSignature}
          className="px-5 py-3 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-600 transition"
        >
          Clear
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSignature}
          disabled={!isSigned}
          className={`px-5 py-3 w-full font-bold rounded-lg shadow-md transition ${
            isSigned
              ? "submit-button"
              : "bg-gray-400 text-gray-100  cursor-not-allowed"
          }`}
        >
          Confirm & Proceed
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
