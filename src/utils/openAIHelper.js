// OpenAI integration helper
import OpenAI from "openai";

// Process shape data with OpenAI
export const processShapesWithAI = async (
  leftSectionShapes,
  rightSectionShapes,
  apiKey
) => {
  try {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // Initialize OpenAI client with provided API key
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, you should use a backend proxy
    });

    // Format the shape data
    const shapesData = {
      leftSection: leftSectionShapes.map(({ x, y, width, height }) => ({
        x,
        y,
        width,
        height,
      })),
      rightSection: rightSectionShapes.map(({ x, y, width, height }) => ({
        x,
        y,
        width,
        height,
      })),
    };

    // Make the API request
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a spatial reasoning AI that analyzes grid-based shape placements.",
        },
        {
          role: "user",
          content: `Analyze these shape placements and provide insights on their layout efficiency and optimization suggestions: ${JSON.stringify(
            shapesData
          )}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      success: true,
      analysis: response.choices[0].message.content,
      timestamp: new Date().toISOString(),
      shapesData,
    };
  } catch (error) {
    console.error("Error processing shapes with AI:", error);
    return {
      success: false,
      error: error.message || "Failed to process shapes with AI",
    };
  }
};

// Format and prepare shape data for visualization
export const prepareShapesForDisplay = (shapesData) => {
  // Calculate statistics
  const leftShapesCount = shapesData.leftSection.length;
  const rightShapesCount = shapesData.rightSection.length;

  // Calculate total area for each section
  const leftArea = shapesData.leftSection.reduce(
    (sum, shape) => sum + shape.width * shape.height,
    0
  );
  const rightArea = shapesData.rightSection.reduce(
    (sum, shape) => sum + shape.width * shape.height,
    0
  );

  // Calculate efficiency (what percentage of shapes were successfully placed)
  const totalShapes = leftShapesCount + rightShapesCount;
  const placementEfficiency =
    totalShapes > 0 ? Math.round((leftShapesCount / totalShapes) * 100) : 0;

  return {
    leftShapesCount,
    rightShapesCount,
    leftArea,
    rightArea,
    placementEfficiency,
    shapesData,
  };
};
