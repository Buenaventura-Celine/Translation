
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

export interface ServiceTranslationResult {
  original: string;
  translations: Record<string, string>;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const translateIcuStrings = async (icuStrings: string[], languages: string[]): Promise<ServiceTranslationResult[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }

  // Dynamically generate the properties for the translations object in the schema
  const translationProperties = languages.reduce((acc, lang) => {
    acc[lang] = {
      type: Type.STRING,
      description: `The translation in ${lang}.`
    };
    return acc;
  }, {} as Record<string, { type: Type; description: string }>);


  const responseSchema = {
      type: Type.ARRAY,
      description: "A list of translation objects, one for each original English string provided.",
      items: {
          type: Type.OBJECT,
          properties: {
              original: {
                  type: Type.STRING,
                  description: "The original English ICU string that was translated."
              },
              translations: {
                  type: Type.OBJECT,
                  properties: translationProperties,
                  description: "An object containing the translations, where each key is a language code."
              }
          },
          required: ['original', 'translations']
      }
  };


  const languageList = languages.join(', ');

  const prompt = `
    You are a specialized translation tool for a Flutter developer.
    Your goal is to translate a given list of English strings that follow the ICU Message Format into multiple languages.

    **Core Instruction:**
    The most important rule is to preserve any dynamic placeholders in their original form. A placeholder is any text, including the surrounding curly braces, that looks like this: {variableName} or {plural, ...}. You should only translate the words that are not part of these placeholders.

    **Language List:**
    Please provide the translations for the following languages: ${languageList}.

    **Input Strings:**
    Here is a JSON array of the ICU strings to translate:
    ${JSON.stringify(icuStrings)}

    **Final Format:**
    Respond with a valid JSON array that adheres to the provided schema. Each object in the array should correspond to one of the original input strings and contain its translations. Ensure every language requested is present as a key in the 'translations' object for every string.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const responseText = response.text.trim();
    if (!responseText) {
        throw new Error("Received an empty response from the API.");
    }
    
    const parsedResult = JSON.parse(responseText);

    if (!Array.isArray(parsedResult)) {
        throw new Error("API response is not in the expected array format.");
    }

    // Ensure the result matches the expected interface
    return parsedResult.map((item: any) => ({
        original: item.original || '',
        translations: item.translations || {},
    }));

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the translation response from the API. The format might be invalid.");
    }
    throw new Error("Failed to fetch translation from Gemini API.");
  }
};
