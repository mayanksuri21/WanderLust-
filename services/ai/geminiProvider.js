const geminiClient = require("./geminiClient");

class GeminiProvider {
  /**
   * Sends a prompt to Google Gemini and returns the response text.
   * @param {string} prompt - The compiled prompt.
   * @returns {Promise<string>} Gemini response text.
   */
  async generate(prompt) {
    console.log("[GeminiProvider] Sending request to Gemini API...");
    try {
      const response = await geminiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text;
      console.log("[GeminiProvider] Response received successfully.");
      return text;
    } catch (error) {
      console.error("[GeminiProvider] Error calling Gemini API:", error.message);

      if (error.status === 429) {
        throw new Error("AI rate limit exceeded. Please try again in a moment.");
      }
      if (error.status === 403) {
        throw new Error("AI service access error. Please contact support.");
      }
      if (error.status >= 500) {
        throw new Error("AI service is temporarily unavailable. Please try again later.");
      }
      if (error.code === "ECONNABORTED" || error.name === "AbortError") {
        throw new Error("AI request timed out. Please try again.");
      }

      throw new Error("Unable to generate itinerary. Please try again.");
    }
  }
}

module.exports = new GeminiProvider();
