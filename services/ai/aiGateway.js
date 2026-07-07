const geminiProvider = require("./geminiProvider");

class AIGateway {
  /**
   * Gateway for AI itinerary generation.
   * Delegates to the configured provider, making it easy to swap providers later.
   * @param {string} prompt - The compiled travel prompt.
   * @returns {Promise<string>} Raw model response text.
   */
  async generateItinerary(prompt) {
    console.log("[AIGateway] Routing itinerary request to active provider.");
    return await geminiProvider.generate(prompt);
  }
}

module.exports = new AIGateway();
