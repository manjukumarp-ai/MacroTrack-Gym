import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealName: string;
  quantity: string;
}

export async function estimateMacros(mealName: string, quantity: string): Promise<MacroData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Estimate the nutritional macros for this meal: "${mealName}" with quantity: "${quantity}". Provide a realistic estimation based on standard nutritional data.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER, description: "Total calories in kcal" },
          protein: { type: Type.NUMBER, description: "Protein in grams" },
          carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
          fats: { type: Type.NUMBER, description: "Fats in grams" },
        },
        required: ["calories", "protein", "carbs", "fats"],
      },
    },
  });

  const macros = JSON.parse(response.text);
  return {
    ...macros,
    mealName,
    quantity,
  };
}
