"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { motion } from "framer-motion";

interface LocationSuggestion {
  name: string;
}

export default function QuoteDetails() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("customerData") || "{}");
    if (savedData.name) setValue("name", savedData.name);
    if (savedData.email) setValue("email", savedData.email);
    if (savedData.address) setValue("address", savedData.address);
  }, [setValue]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    localStorage.setItem("customerData", JSON.stringify(data));
    router.push("/line-items");
  };

  const [pickupSuggestions, setPickupSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLocationSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setPickupSuggestions([]);
      return;
    }
    setLoading(true);

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const suggestions: LocationSuggestion[] = res.data.map(
        (place: { display_name: string }) => ({
          name: place.display_name,
        })
      );

      setPickupSuggestions(suggestions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    setValue("address", location.name, { shouldValidate: true });
    setPickupSuggestions([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto mt-10 p-8 bg-white shadow-xl rounded-lg"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Customer Details
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            placeholder="Full Name"
            className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 transition"
            {...register("name", {
              required: "Name is required",
              pattern: {
                value:
                  /^(?=.{6,20}$)([A-Za-z]{3,}\s[A-Za-z]{3,})(?:\s[A-Za-z]{3,})?$/,
                message:
                  "Name must be 2-3 words, each with at least 3 letters, and max 20 chars",
              },
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name.message as string}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="email"
            placeholder="Email"
            className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 transition"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message as string}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <input
            type="text"
            placeholder="Address"
            className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 transition"
            {...register("address", { required: "Address is required" })}
            onChange={(e) => fetchLocationSuggestions(e.target.value)}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message as string}
            </p>
          )}

          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: pickupSuggestions.length > 0 ? 1 : 0,
              y: pickupSuggestions.length > 0 ? 0 : -10,
            }}
            className="absolute bg-white max-h-[200px] overflow-y-auto shadow-md w-full z-10 mt-1 rounded-md"
          >
            {loading ? (
              <p className="text-sm text-center py-3">Loading...</p>
            ) : (
              pickupSuggestions.map((place, index) => (
                <li
                  key={index}
                  className="p-3 hover:bg-gray-200 cursor-pointer transition"
                  onClick={() => handleLocationSelect(place)}
                >
                  {place.name}
                </li>
              ))
            )}
          </motion.ul>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-md shadow-md hover:bg-blue-700 transition"
        >
          Next
        </motion.button>
      </form>
    </motion.div>
  );
}
