//  Check if two rectangles overlap

export const doRectanglesOverlap = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

//  * Check if a position is valid
export const isPositionValid = (
  shape,
  existingShapes,
  gridWidth,
  gridHeight
) => {
  // Check if shape is within grid boundaries
  if (
    shape.x < 0 ||
    shape.y < 0 ||
    shape.x + shape.width > gridWidth ||
    shape.y + shape.height > gridHeight
  ) {
    return false;
  }

  // Check if shape overlaps with any existing shape
  return !existingShapes.some((existing) =>
    doRectanglesOverlap(shape, existing)
  );
};

/**
 * Create a grid occupancy map
 */
export const createOccupancyMap = (shapes, gridWidth, gridHeight) => {
  // Initialize a 2D array representing the grid
  const grid = Array(gridHeight)
    .fill()
    .map(() => Array(gridWidth).fill(false));

  // Mark cells as occupied where shapes exist
  shapes.forEach((shape) => {
    for (let y = shape.y; y < shape.y + shape.height; y++) {
      for (let x = shape.x; x < shape.x + shape.width; x++) {
        if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
          grid[y][x] = true;
        }
      }
    }
  });

  return grid;
};

/**
 * Find the best position for a shape
 */
export const findBestPosition = (
  shape,
  existingShapes,
  gridWidth,
  gridHeight
) => {
  const occupancyMap = createOccupancyMap(
    existingShapes,
    gridWidth,
    gridHeight
  );
  let bestPosition = null;
  let bestScore = Infinity;

  // Try each possible position in the grid
  for (let y = 0; y <= gridHeight - shape.height; y++) {
    for (let x = 0; x <= gridWidth - shape.width; x++) {
      // Check if this position is valid
      let isValid = true;

      // Check if all cells required by the shape are free
      for (let dy = 0; dy < shape.height && isValid; dy++) {
        for (let dx = 0; dx < shape.width && isValid; dx++) {
          if (occupancyMap[y + dy][x + dx]) {
            isValid = false;
          }
        }
      }

      if (isValid) {
        // Score this position (prefer positions closer to top-left)
        const score = y * 100 + x; // Prioritize top positions over left positions

        if (score < bestScore) {
          bestScore = score;
          bestPosition = { x, y };
        }
      }
    }
  }

  return bestPosition;
};
