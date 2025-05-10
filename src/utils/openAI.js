import OpenAI from "openai";

export const processShapesWithAI = async (
  leftSectionShapes,
  rightSectionShapes,
  apiKey
) => {
  try {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // no backend for now
    });

    const shapesData = {
      leftSection: leftSectionShapes.map(({ x, y, width, height }) => ({
        x,
        y,
        width,
        height,
      })),
      rightSection: rightSectionShapes.map(({ x, y, width, height }) => ({
        // no need for cooordinates in the right section
        // x,
        // y,
        width,
        height,
      })),
    };
    console.log("Shapes data for AI:", JSON.stringify(shapesData));

    const prompt = `
          Instructions:
          - In a 40×30 grid, given two arrays:
          - leftSection: boxes with { x, y, width, height } — fixed in position and must remain unchanged.
          - rightSection: boxes with { width, height } — to be placed top-left to bottom-right, avoiding overlap with others or exceeding grid bounds.
          - Return a single array combining all placed boxes as { x, y, width, height }.
          - All leftSection boxes must be included as-is.
          - Place as many rightSection boxes as possible.
          - Skip any that cannot be placed.
          - Do not modify, or overlap boxes.
          - The output must reflect optimal tight packing starting from the top-left corner.
          - Output in valid JSON format ('?' will bereplaced with calculated values) example :
          {
          "FinalLeftSection" : [{ "x": ?,  "y": ?,  "width": ?,  "height": ? },{ "x": ?,  "y": ?, "width": ?, "height": ?  },{ "x": ?, "y": ?,  "width": ?,  "height": ? },{ "x": ?,  "y": ?,  "width": ?, "height": ?  },{ "x": ?, "y": ?,  "width": ?,  "height": ? },{ "x": ?,  "y": ?,  "width": ?, "height": ?  }]
          "Unplaced" : [{"width": ?, "height": ? },{ "width": ?, "height": ?  },{ "width": ?, "height": ? },{ "width": ?, "height": ?  },{ "width": ?, "height": ? }] 
          }
          Input shapes:
          ${JSON.stringify(shapesData)}
          `.trim();

    const response = await openai.responses.create({
      model: "o4-mini",
      input: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return {
      success: true,
      analysis: response.output_text,
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

// STEP 3 : util funcs

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
