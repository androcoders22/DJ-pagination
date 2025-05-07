import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  // State for dynamic grid configuration
  const [gridSize, setGridSize] = useState(20); // Size of each grid cell in pixels
  const [gridWidth, setGridWidth] = useState(30); // Number of columns
  const [gridHeight, setGridHeight] = useState(20); // Number of rows
  const [showGrid, setShowGrid] = useState(true);
  const [columnSnap, setColumnSnap] = useState(true);

  // State for tracking shapes
  const [leftSectionShapes, setLeftSectionShapes] = useState([]); // Black/locked shapes
  const [rightSectionShapes, setRightSectionShapes] = useState([]); // Green/movable shapes
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState(null);
  const [activeSection, setActiveSection] = useState(null); // 'left' or 'right'

  // Refs for each section
  const leftSectionRef = useRef(null);
  const rightSectionRef = useRef(null);
  const containerRef = useRef(null);

  // Update grid dimensions based on viewport size
  useEffect(() => {
    const updateGridDimensions = () => {
      if (containerRef.current) {
        const containerWidth = window.innerWidth * 0.9;
        const containerHeight = window.innerHeight * 0.6;

        // Each section gets half the width minus padding
        const sectionWidth = containerWidth / 2 - 40;

        // Calculate grid dimensions based on available space
        const newGridSize = Math.floor(Math.min(20, sectionWidth / 30));
        const newGridWidth = Math.floor(sectionWidth / newGridSize);
        const newGridHeight = Math.floor(containerHeight / newGridSize);

        setGridSize(newGridSize);
        setGridWidth(newGridWidth);
        setGridHeight(newGridHeight);
      }
    };

    updateGridDimensions();
    window.addEventListener("resize", updateGridDimensions);

    return () => {
      window.removeEventListener("resize", updateGridDimensions);
    };
  }, []);

  // Handle mouse down to start drawing
  const handleMouseDown = (e, section) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / gridSize);
    const y = Math.floor((e.clientY - rect.top) / gridSize);

    setIsDrawing(true);
    setStartPos({ x, y });
    setActiveSection(section);
    setCurrentShape({
      x,
      y,
      width: 1,
      height: 1,
      color: section === "left" ? "maroon" : "darkblue",
    });
  };

  // Handle mouse move to update shape size
  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rect = (
      activeSection === "left" ? leftSectionRef : rightSectionRef
    ).current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / gridSize);
    const y = Math.floor((e.clientY - rect.top) / gridSize);

    // Ensure x and y are within grid bounds
    const boundedX = Math.max(0, Math.min(x, gridWidth - 1));
    const boundedY = Math.max(0, Math.min(y, gridHeight - 1));

    const width = Math.abs(boundedX - startPos.x) + 1;
    const height = Math.abs(boundedY - startPos.y) + 1;

    setCurrentShape({
      x: Math.min(startPos.x, boundedX),
      y: Math.min(startPos.y, boundedY),
      width,
      height,
      color: activeSection === "left" ? "maroon" : "darkblue",
    });
  };

  // Handle mouse up to finalize shape
  const handleMouseUp = () => {
    if (!isDrawing) return;

    if (activeSection === "left") {
      setLeftSectionShapes([...leftSectionShapes, currentShape]);
    } else {
      setRightSectionShapes([...rightSectionShapes, currentShape]);
    }

    setIsDrawing(false);
    setCurrentShape(null);
    setActiveSection(null);
  };

  // Mouse leave handler to cancel drawing
  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentShape(null);
      setActiveSection(null);
    }
  };

  // Handle window mouse up to ensure drawing stops even if mouse is released outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawing) {
        handleMouseUp();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [
    isDrawing,
    activeSection,
    currentShape,
    leftSectionShapes,
    rightSectionShapes,
  ]);

  // Function to check if two rectangles overlap
  const doRectanglesOverlap = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  // Function to check if a position is valid
  const isPositionValid = (shape, existingShapes) => {
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

  // Function to create a grid occupancy map
  const createOccupancyMap = (shapes) => {
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

  // Function to find the best position for a shape
  const findBestPosition = (shape, existingShapes) => {
    const occupancyMap = createOccupancyMap(existingShapes);
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

  // Function to automatically position shapes from right to left section
  const autoPositionShapes = () => {
    let newLeftSectionShapes = [...leftSectionShapes];
    // Sort shapes by area (largest first) to optimize placement
    const shapesToPosition = [...rightSectionShapes].sort(
      (a, b) => b.width * b.height - a.width * a.height
    );

    // Try to position each shape from the right section
    for (const shape of shapesToPosition) {
      const bestPosition = findBestPosition(shape, newLeftSectionShapes);

      if (bestPosition) {
        const newShape = {
          ...shape,
          x: bestPosition.x,
          y: bestPosition.y,
          color: "darkblue", // Change color to blue when placed in left section
        };

        newLeftSectionShapes.push(newShape);
      }
    }

    setLeftSectionShapes(newLeftSectionShapes);
    setRightSectionShapes([]); // Clear right section after positioning
  };

  // Function to clear all shapes
  const clearShapes = () => {
    setLeftSectionShapes([]);
    setRightSectionShapes([]);
  };

  // Function to toggle grid visibility
  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  // Function to toggle column snap
  const toggleColumnSnap = () => {
    setColumnSnap(!columnSnap);
  };

  // Function to export layout (placeholder)
  const exportLayout = () => {
    console.log("Export layout", {
      leftSectionShapes,
      rightSectionShapes,
      gridWidth,
      gridHeight,
    });
    alert("Layout export functionality would go here");
  };

  // Render shapes for a section
  const renderShapes = (shapes, temporaryShape) => {
    return (
      <>
        {shapes.map((shape, index) => (
          <div
            key={index}
            className="shape"
            style={{
              left: `${shape.x * gridSize}px`,
              top: `${shape.y * gridSize}px`,
              width: `${shape.width * gridSize}px`,
              height: `${shape.height * gridSize}px`,
              backgroundColor: shape.color,
              border: `2px dashed rgba(255, 255, 255, 0.7)`,
            }}
          />
        ))}
        {temporaryShape && (
          <div
            className="shape current"
            style={{
              left: `${temporaryShape.x * gridSize}px`,
              top: `${temporaryShape.y * gridSize}px`,
              width: `${temporaryShape.width * gridSize}px`,
              height: `${temporaryShape.height * gridSize}px`,
              backgroundColor: temporaryShape.color,
              opacity: 0.7,
              border: `2px dashed rgba(255, 255, 255, 0.7)`,
            }}
          />
        )}
      </>
    );
  };

  return (
    <div className="container" ref={containerRef}>
      <h1>Pagination Tool</h1>

      <div className="grid-container">
        <div className="section">
          <h2>Left Canvas (Ads + Stories)</h2>
          <div
            ref={leftSectionRef}
            className="grid"
            style={{
              width: `${gridWidth * gridSize}px`,
              height: `${gridHeight * gridSize}px`,
              backgroundColor: "#1e1e1e",
            }}
            onMouseDown={(e) => handleMouseDown(e, "left")}
            onMouseMove={
              isDrawing && activeSection === "left"
                ? handleMouseMove
                : undefined
            }
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid lines */}
            {showGrid && (
              <div className="grid-lines">
                {Array.from({ length: gridWidth + 1 }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="grid-line vertical"
                    style={{ left: `${i * gridSize}px` }}
                  />
                ))}
                {Array.from({ length: gridHeight + 1 }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="grid-line horizontal"
                    style={{ top: `${i * gridSize}px` }}
                  />
                ))}
              </div>
            )}

            {/* Shapes */}
            {renderShapes(
              leftSectionShapes,
              activeSection === "left" ? currentShape : null
            )}
          </div>
        </div>

        <div className="section">
          <h2>Input Canvas (Stories)</h2>
          <div
            ref={rightSectionRef}
            className="grid"
            style={{
              width: `${gridWidth * gridSize}px`,
              height: `${gridHeight * gridSize}px`,
              backgroundColor: "#1e1e1e",
            }}
            onMouseDown={(e) => handleMouseDown(e, "right")}
            onMouseMove={
              isDrawing && activeSection === "right"
                ? handleMouseMove
                : undefined
            }
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid lines */}
            {showGrid && (
              <div className="grid-lines">
                {Array.from({ length: gridWidth + 1 }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="grid-line vertical"
                    style={{ left: `${i * gridSize}px` }}
                  />
                ))}
                {Array.from({ length: gridHeight + 1 }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="grid-line horizontal"
                    style={{ top: `${i * gridSize}px` }}
                  />
                ))}
              </div>
            )}

            {/* Shapes */}
            {renderShapes(
              rightSectionShapes,
              activeSection === "right" ? currentShape : null
            )}
          </div>
        </div>
      </div>

      <div className="button-container">
        <button className="action-button" onClick={autoPositionShapes}>
          Auto-Place News Blocks
        </button>
        <button className="action-button" onClick={clearShapes}>
          Clear All
        </button>
        <button className="action-button" onClick={toggleGrid}>
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button>
        <button className="action-button" onClick={toggleColumnSnap}>
          {columnSnap ? "Disable Column Snap" : "Enable Column Snap"}
        </button>
        <button className="action-button" onClick={exportLayout}>
          Export Layout
        </button>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="color-box maroon"></div>
          <span>Locked Shapes (Left)</span>
        </div>
        <div className="legend-item">
          <div className="color-box darkblue"></div>
          <span>Movable Shapes (Right)</span>
        </div>
        <div className="legend-item">
          <div className="color-box blue"></div>
          <span>Positioned Shapes</span>
        </div>
      </div>
    </div>
  );
}

export default App;
