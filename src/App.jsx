import { useState, useRef, useEffect } from "react";
import "./App.css";
import GridSection from "./components/GridSection";
import ControlPanel from "./components/ControlPanel";
import Legend from "./components/Legend";
import ExportedData from "./components/ExportedData";
import AIAnalysis from "./components/AIAnalysis";
import { findBestPosition } from "./utils/gridHelpers";

function App() {
  // State for grid configuration with fixed dimensions
  const [gridSize, setGridSize] = useState(20); // Size of each grid cell in pixels
  const [gridWidth, setGridWidth] = useState(40); // Fixed number of columns
  const [gridHeight, setGridHeight] = useState(30); // Fixed number of rows
  const [showGrid, setShowGrid] = useState(true);

  // State for tracking shapes
  const [leftSectionShapes, setLeftSectionShapes] = useState([]); // Black/locked shapes
  const [rightSectionShapes, setRightSectionShapes] = useState([]); // Green/movable shapes

  // Step 2 and Step 3 states
  const [showExportedData, setShowExportedData] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [exportedShapesData, setExportedShapesData] = useState(null);

  // History states for undo/redo functionality
  const [leftSectionHistory, setLeftSectionHistory] = useState([]);
  const [leftSectionRedoHistory, setLeftSectionRedoHistory] = useState([]);
  const [rightSectionHistory, setRightSectionHistory] = useState([]);
  const [rightSectionRedoHistory, setRightSectionRedoHistory] = useState([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState(null);
  const [activeSection, setActiveSection] = useState(null); // 'left' or 'right'

  // Refs for each section
  const leftSectionRef = useRef(null);
  const rightSectionRef = useRef(null);
  const containerRef = useRef(null);

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
      // Save current state to history before updating
      setLeftSectionHistory([...leftSectionHistory, [...leftSectionShapes]]);
      setLeftSectionRedoHistory([]);
      setLeftSectionShapes([...leftSectionShapes, currentShape]);
    } else {
      // Save current state to history before updating
      setRightSectionHistory([...rightSectionHistory, [...rightSectionShapes]]);
      setRightSectionRedoHistory([]);
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
    leftSectionHistory,
    rightSectionHistory,
  ]);

  // Undo/Redo functions for left section
  const handleLeftUndo = () => {
    if (leftSectionHistory.length > 0) {
      const previousState = leftSectionHistory[leftSectionHistory.length - 1];
      const newHistory = leftSectionHistory.slice(0, -1);

      // Save current state to redo history
      setLeftSectionRedoHistory([
        ...leftSectionRedoHistory,
        [...leftSectionShapes],
      ]);

      // Set shapes to previous state
      setLeftSectionShapes(previousState);
      setLeftSectionHistory(newHistory);
    }
  };

  const handleLeftRedo = () => {
    if (leftSectionRedoHistory.length > 0) {
      const nextState =
        leftSectionRedoHistory[leftSectionRedoHistory.length - 1];
      const newRedoHistory = leftSectionRedoHistory.slice(0, -1);

      // Save current state to undo history
      setLeftSectionHistory([...leftSectionHistory, [...leftSectionShapes]]);

      // Set shapes to next state
      setLeftSectionShapes(nextState);
      setLeftSectionRedoHistory(newRedoHistory);
    }
  };

  // Undo/Redo functions for right section
  const handleRightUndo = () => {
    if (rightSectionHistory.length > 0) {
      const previousState = rightSectionHistory[rightSectionHistory.length - 1];
      const newHistory = rightSectionHistory.slice(0, -1);

      // Save current state to redo history
      setRightSectionRedoHistory([
        ...rightSectionRedoHistory,
        [...rightSectionShapes],
      ]);

      // Set shapes to previous state
      setRightSectionShapes(previousState);
      setRightSectionHistory(newHistory);
    }
  };

  const handleRightRedo = () => {
    if (rightSectionRedoHistory.length > 0) {
      const nextState =
        rightSectionRedoHistory[rightSectionRedoHistory.length - 1];
      const newRedoHistory = rightSectionRedoHistory.slice(0, -1);

      // Save current state to undo history
      setRightSectionHistory([...rightSectionHistory, [...rightSectionShapes]]);

      // Set shapes to next state
      setRightSectionShapes(nextState);
      setRightSectionRedoHistory(newRedoHistory);
    }
  };

  // Function to automatically position shapes from right to left section
  const autoPositionShapes = () => {
    // Save current state to history before updating
    setLeftSectionHistory([...leftSectionHistory, [...leftSectionShapes]]);
    setLeftSectionRedoHistory([]);
    setRightSectionHistory([...rightSectionHistory, [...rightSectionShapes]]);
    setRightSectionRedoHistory([]);

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
    // Save current state to history before clearing
    if (leftSectionShapes.length > 0) {
      setLeftSectionHistory([...leftSectionHistory, [...leftSectionShapes]]);
      setLeftSectionRedoHistory([]);
    }
    if (rightSectionShapes.length > 0) {
      setRightSectionHistory([...rightSectionHistory, [...rightSectionShapes]]);
      setRightSectionRedoHistory([]);
    }

    setLeftSectionShapes([]);
    setRightSectionShapes([]);

    // Reset step 2 and 3 states
    setShowExportedData(false);
    setShowAIAnalysis(false);
    setExportedShapesData(null);

    // Reset all history states when clearing all shapes
    setLeftSectionHistory([]);
    setLeftSectionRedoHistory([]);
    setRightSectionHistory([]);
    setRightSectionRedoHistory([]);
  };

  // Function to delete a shape
  const handleDeleteShape = (sectionType, index) => {
    if (sectionType === "left") {
      // Save current state to history before deleting
      setLeftSectionHistory([...leftSectionHistory, [...leftSectionShapes]]);
      setLeftSectionRedoHistory([]);

      // Create a new array without the shape at index
      const newShapes = [...leftSectionShapes];
      newShapes.splice(index, 1);
      setLeftSectionShapes(newShapes);
    } else {
      // Save current state to history before deleting
      setRightSectionHistory([...rightSectionHistory, [...rightSectionShapes]]);
      setRightSectionRedoHistory([]);

      // Create a new array without the shape at index
      const newShapes = [...rightSectionShapes];
      newShapes.splice(index, 1);
      setRightSectionShapes(newShapes);
    }
  };

  // Function to export all data to JSON
  const handleExportAll = () => {
    // Show the Step 2 component
    setShowExportedData(true);

    // Hide Step 3 if it's visible
    setShowAIAnalysis(false);
    setExportedShapesData(null);

    // Scroll to the exported data section
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  // Function to handle starting the AI analysis from Step 2
  const handleStartAnalysis = (data) => {
    setExportedShapesData(data);
    setShowAIAnalysis(true);

    // Scroll to the AI analysis section
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  // Function to toggle grid visibility
  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  // Add CSS to customize the components' widths
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .full-width {
        width: 100% !important;
        max-width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      
      .analysis-button-container {
        margin-top: 2rem;
        text-align: center;
      }
      
      .error-message {
        background-color: rgba(255, 80, 80, 0.1);
        border: 1px solid #ff5050;
        border-radius: 4px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="container" ref={containerRef}>
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
          handleUndo={handleLeftUndo}
          handleRedo={handleLeftRedo}
          canUndo={leftSectionHistory.length > 0}
          canRedo={leftSectionRedoHistory.length > 0}
          handleDeleteShape={handleDeleteShape}
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
          handleUndo={handleRightUndo}
          handleRedo={handleRightRedo}
          canUndo={rightSectionHistory.length > 0}
          canRedo={rightSectionRedoHistory.length > 0}
          handleDeleteShape={handleDeleteShape}
        />
      </div>

      <ControlPanel
        leftSectionShapes={leftSectionShapes}
        rightSectionShapes={rightSectionShapes}
        autoPositionShapes={autoPositionShapes}
        clearShapes={clearShapes}
        toggleGrid={toggleGrid}
        showGrid={showGrid}
        handleExportAll={handleExportAll}
      />

      <Legend />

      {/* Step 2: Display Exported Data with Loading Animation */}
      <ExportedData
        leftSectionShapes={leftSectionShapes}
        rightSectionShapes={rightSectionShapes}
        onStartAnalysis={handleStartAnalysis}
        showExportedData={showExportedData}
      />

      {/* Step 3: AI Analysis with Loading Animation */}
      {exportedShapesData && (
        <AIAnalysis
          shapesData={exportedShapesData}
          showAIAnalysis={showAIAnalysis}
        />
      )}
    </div>
  );
}

export default App;
