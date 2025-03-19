import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GEMINI_API_KEY as string
);

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "No item name provided" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent(
      `Provide a concise description and an estimated cost for the construction item "${name}" in an ADU construction project.
        Format your response as follows:
        
        Description: [Short description here]
        Cost: [Exact amount in dollars, e.g., Cost: 1200$]
        `
    );

    const priceText = response.response.text();
    console.log("🚀 ~ POST ~ priceText:", priceText);
    const descriptionMatch = priceText.match(/Description:\s*(.*)/i);
    const costMatch = priceText.match(/Cost:\s*\$?([\d,]+)/i);
    const description = descriptionMatch
      ? descriptionMatch[1].trim()
      : "No description available";
    const estimatedCost = costMatch
      ? parseFloat(costMatch[1].replace(/,/g, ""))
      : 0;

    console.log("🚀 ~ POST ~ description:", description);
    console.log("🚀 ~ POST ~ estimatedCost:", estimatedCost);

    return NextResponse.json({ description, estimatedCost });
  } catch (error) {
    console.error("Failed to fetch AI response", error);

    return NextResponse.json(
      { error: "Failed to fetch AI response" },
      { status: 500 }
    );
  }
}
