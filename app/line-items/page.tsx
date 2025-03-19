"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { ImSpinner8 } from "react-icons/im";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface LineItem {
  name: string;
  description: string;
  cost: number;
  quantity: number;
}

interface LineItemsForm {
  items: LineItem[];
}

export default function LineItems() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<LineItemsForm>({
    defaultValues: {
      items: [{ name: "", description: "", cost: 0, quantity: 1 }],
    },
    mode: "onChange",
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  const [loadingIndexes, setLoadingIndexes] = useState<number[]>([]);

  useEffect(() => {
    const savedItems = localStorage.getItem("lineItems");
    if (savedItems) {
      const items: LineItem[] = JSON.parse(savedItems);
      items.forEach((item, index) => {
        update(index, item);
      });
    }
  }, [update]);

  const onSubmit = (data: LineItemsForm) => {
    localStorage.setItem("lineItems", JSON.stringify(data.items));
    router.push("/summary");
  };

  const autoFillDetails = async (index: number) => {
    const itemName = getValues(`items.${index}.name`);

    if (!itemName) {
      toast.error(`Item Name must be provided`);
      return;
    }

    setLoadingIndexes((prev) => [...prev, index]);
    try {
      const response = await axios.post("/api/gemini/generate-cost", {
        name: itemName,
      });
      const { description, estimatedCost } = response.data;

      setValue(`items.${index}.description`, description, {
        shouldValidate: true,
      });
      setValue(`items.${index}.cost`, estimatedCost, { shouldValidate: true });
    } catch (error) {
      console.error("AI fetch error:", error);
    } finally {
      setLoadingIndexes((prev) => prev.filter((i) => i !== index));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto my-10 p-8 bg-white shadow-xl rounded-lg"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Construction Line Items
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-h-[calc(100vh-220px)] my-8 overflow-y-auto">
          <AnimatePresence>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 border-b pb-3 my-4 last:border-b-0 last:pb-0 last:mb-0 bg-gray-50 p-4 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-gray-700">
                    Item Name
                  </label>
                  {fields.length > 1 && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => remove(index)}
                      className="text-red-500 text-sm cursor-pointer hover:text-red-700"
                    >
                      Remove
                    </motion.button>
                  )}
                </div>

                <input
                  placeholder="Item Name"
                  className="border p-2 w-full rounded-md"
                  {...register(`items.${index}.name`, {
                    required: "Item name required",
                    minLength: {
                      value: 4,
                      message: "Minimum 4 characters",
                    },
                  })}
                />
                {errors.items?.[index]?.name && (
                  <p className="text-red-500 text-sm">
                    {errors.items[index].name?.message}
                  </p>
                )}

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => autoFillDetails(index)}
                  className="text-blue-500 cursor-pointer flex text-sm items-center gap-2"
                >
                  Auto-Fill Description & Cost (AI)
                  {loadingIndexes.includes(index) && (
                    <ImSpinner8 className="animate-spin" size={16} />
                  )}
                </motion.button>

                <textarea
                  placeholder="Description"
                  className="border p-2 w-full rounded-md"
                  {...register(`items.${index}.description`, {
                    required: "Description required",
                    minLength: {
                      value: 10,
                      message: "Minimum 10 characters",
                    },
                  })}
                />
                {errors.items?.[index]?.description && (
                  <p className="text-red-500 text-sm">
                    {errors.items[index].description?.message}
                  </p>
                )}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="font-semibold text-gray-700">Cost</label>
                    <input
                      type="number"
                      placeholder="Cost"
                      className="border p-2 w-full rounded-md"
                      {...register(`items.${index}.cost`, {
                        required: "Cost required",
                        min: { value: 1, message: "Must be at least 1" },
                        valueAsNumber: true,
                      })}
                    />
                    {errors.items?.[index]?.cost && (
                      <p className="text-red-500 text-sm">
                        {errors.items[index].cost?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="font-semibold text-gray-700">
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="Quantity"
                      className="border p-2 w-full rounded-md"
                      {...register(`items.${index}.quantity`, {
                        required: "Quantity required",
                        min: { value: 1, message: "Must be at least 1" },
                        valueAsNumber: true,
                      })}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-red-500 text-sm">
                        {errors.items[index].quantity?.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              append({ name: "", description: "", cost: 0, quantity: 1 })
            }
            className="px-4 py-2 bg-orange-500 text-white font-bold rounded-md shadow-md hover:bg-orange-600 transition"
          >
            Add Item
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md shadow-md hover:bg-blue-700 transition"
          >
            Next
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
