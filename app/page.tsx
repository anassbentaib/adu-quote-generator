"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gray-50">
      <div className="relative h-screen bg-[url('https://img.freepik.com/free-photo/carpenter-man-working-roof_23-2148748788.jpg?t=st=1742386044~exp=1742389644~hmac=70afefeaed2bbd5a0fa5d6a7ad3e9a29da54b2fefd6954e0a30350349bcf6e46&w=1800')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4">
            Build Your Dream ADU with Us
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            We specialize in designing and constructing high-quality Accessory
            Dwelling Units (ADUs) that fit your lifestyle and budget.
          </p>
          <Link
            href={"/quote"}
            className="bg-blue-600 cursor-pointer text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Get a Free Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
