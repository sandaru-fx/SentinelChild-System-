
import { GoogleGenAI } from "@google/genai";

export const imageService = {
  /**
   * Generates a professional hero background image using Gemini 2.5 Flash Image.
   */
  generateHeroBackground: async (): Promise<string | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = "A professional, ultra-high-quality, minimalist background for a law enforcement portal focused on child safety. Soft blue and white color palette with subtle abstract geometric depth. The image should evoke a sense of protection, trust, and transparency. 4k resolution style, very clean, no text, no faces, blurred architectural elements.";

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        },
      });

      // Find the image part in the response candidates
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("AI Image Generation Error:", error);
      return null;
    }
  }
};
