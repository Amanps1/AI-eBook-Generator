const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

const generateOutline = async (req, res) => {
  try {
    const { topic, style, numChapters, description } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const prompt = `
You are an expert book outline generator. Create a detailed book outline based on these parameters:

Topic: "${topic}"
${description ? `Description: ${description}` : ""}
Writing Style: ${style || "Informative"}
Number of Chapters: ${numChapters || 5}

Requirements:
1. Generate exactly ${numChapters || 5} chapters.
2. Each chapter should include a "title" and "description".
3. Each description should be 2–3 sentences long.
4. Output ONLY a valid JSON array, no extra text or markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", text: prompt }],
      maxOutputTokens: 1000,
    })

    const text=response.text;
    const startIndex = text.indexOf("[");
    const endIndex = text.lastIndexOf("]");
    if (startIndex === -1 || endIndex === -1) {
      console.error("AI returned invalid format:", text);
      return res.status(500).json({
        success: false,
        message: "Invalid AI response format",
      });
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    const outline = JSON.parse(jsonString);

    return res.status(200).json({
      success: true,
      outline,
    });
  } catch (error) {
    console.error("Error generating outline:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const generateChapterContent = async (req, res) => {
  try {
    const { chapterTitle, chapterDescription, style } = req.body;
    if (!chapterTitle) {
      return res.status(400).json({
        success: false,
        message: "Chapter title is required",
      });
    }

   const prompt = `You are an expert writer specializing in ${style} content. Write a complete chapter for a book with the following specifications:

Chapter Title: "${chapterTitle}"
${chapterDescription ? `Chapter Description: ${chapterDescription}` : ""}
Writing Style: ${style}
Target Length: Comprehensive and detailed (aim for 1500-2500 words)

Requirements:
1. Write in a ${style.toLowerCase()} tone throughout the chapter
2. Structure the content with clear sections and smooth transitions
3. Include relevant examples, explanations, or anecdotes as appropriate for the style
4. Ensure the content flows logically from introduction to conclusion
5. Make the content engaging and valuable to readers
${
  chapterDescription
    ? "6. Cover all points mentioned in the chapter description"
    : ""
}

Format Guidelines:
- Start with a compelling opening paragraph
- Use clear paragraph breaks for readability
- Include subheadings if appropriate for the content length
- End with a strong conclusion or transition to the next chapter
- Write in plain text without markdown formatting

Begin writing the chapter content now:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", text: prompt }],
      maxOutputTokens: 1000,
    });
    return res.status(200).json({
      success: true,
      message: "Chapter content generation coming soon!",
      content: response.text,
    });
  } catch (error) {
    console.error("Error generating chapter content:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { generateOutline, generateChapterContent };
