import { useState, useRef, useEffect } from "react";
import "./App.css";
import GridSection from "./components/GridSection";
import ControlPanel from "./components/ControlPanel";
import Legend from "./components/Legend";
import { findBestPosition } from "./utils/gridHelpers";

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
      color: section === "left" ? "lightcoral" : "lightyellow",
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
      color: activeSection === "left" ? "lightcoral" : "lightyellow",
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

  // Function to automatically position shapes from right to left section
  const autoPositionShapes = () => {
    let newLeftSectionShapes = [...leftSectionShapes];
    // Sort shapes by area (largest first) to optimize placement
    const shapesToPosition = [...rightSectionShapes].sort(
      (a, b) => b.width * b.height - a.width * a.height
    );
    const unplacedShapes = [];

    // Try to position each shape from the right section
    for (const shape of shapesToPosition) {
      const bestPosition = findBestPosition(
        shape,
        newLeftSectionShapes,
        gridWidth,
        gridHeight
      );
      if (bestPosition) {
        const newShape = {
          ...shape,
          x: bestPosition.x,
          y: bestPosition.y,
          color: "lightyellow",
        };
        newLeftSectionShapes.push(newShape);
      } else {
        unplacedShapes.push(shape);
      }
    }

    setLeftSectionShapes(newLeftSectionShapes);
    setRightSectionShapes(unplacedShapes); // Keep unplaced shapes in right section
    if (unplacedShapes.length > 0) {
      alert(
        `${unplacedShapes.length} block(s) couldn't be placed due to overlapping.`
      );
    }
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

  return (
    <div className="container" ref={containerRef}>
      <h1>Pagination Tool</h1>

      <div className="grid-container">
        <GridSection
          title="Output Canvas (Ads + Stories)"
          gridRef={leftSectionRef}
          gridSize={gridSize}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          showGrid={showGrid}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          isDrawing={isDrawing}
          activeSection={activeSection}
          handleMouseLeave={handleMouseLeave}
          sectionType="left"
          shapes={leftSectionShapes}
          currentShape={currentShape}
        />

        <GridSection
          title="Input Canvas (Stories)"
          gridRef={rightSectionRef}
          gridSize={gridSize}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          showGrid={showGrid}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          isDrawing={isDrawing}
          activeSection={activeSection}
          handleMouseLeave={handleMouseLeave}
          sectionType="right"
          shapes={rightSectionShapes}
          currentShape={currentShape}
        />
      </div>

      <ControlPanel
        leftSectionShapes={leftSectionShapes}
        rightSectionShapes={rightSectionShapes}
        autoPositionShapes={autoPositionShapes}
        clearShapes={clearShapes}
        toggleGrid={toggleGrid}
        showGrid={showGrid}
      />

      <Legend />
    </div>
  );
}

export default App;
