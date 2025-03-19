import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GEMINI_API_KEY as string
);

export async function POST(req: Request) {
  try {
    const { lineItems } = await req.json();

    if (!lineItems || !lineItems.length) {
      return NextResponse.json(
        { error: "No Line Items provided" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent(
      `Analyze the following ADU construction line items: ${JSON.stringify(
        lineItems
      )}.
      
      - Calculate an optimized estimated total cost.
      - Return the result in **pure JSON format only**, with no explanations or extra text.
      - Ensure the response strictly follows this JSON structure:
      
      {
        "optimizedCost": <total_cost_number>
      }
    
      - The value of "optimizedCost" should be a single numeric value representing the total cost.
      - Do not include markdown, code blocks, or any additional text in the response.
      `
    );

    let priceText = await response.response.text();
    console.log("🚀 ~ POST ~ Raw AI Response:", priceText);

    priceText = priceText.replace(/```json|```/g, "").trim();

    let optimizedCost = 0;
    try {
      const parsedData = JSON.parse(priceText);
      optimizedCost = parsedData.optimizedCost || 0;
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", error);
    }
    console.log(" optimizedCost: ", optimizedCost);

    return NextResponse.json({ optimizedCost });
  } catch (error) {
    console.error("Failed to fetch AI response", error);

    return NextResponse.json(
      { error: "Failed to fetch AI response" },
      { status: 500 }
    );
  }
}
