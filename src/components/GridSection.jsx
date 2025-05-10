import React from "react";

const GridSection = ({
  title,
  gridRef,
  gridSize,
  gridWidth,
  gridHeight,
  showGrid,
  handleMouseDown,
  handleMouseMove,
  isDrawing,
  activeSection,
  handleMouseLeave,
  sectionType,
  shapes,
  currentShape,
  handleUndo,
  handleRedo,
  canUndo,
  canRedo,
  handleDeleteShape,
}) => {
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
          >
            <div className="grid-dimensions">
              {shape.width}×{shape.height}
            </div>
            <div
              className="shape-close"
              onClick={(e) => {
                e.stopPropagation(); // Prevent grid click
                e.preventDefault(); // Prevent default behavior
                handleDeleteShape(sectionType, index);
                return false; // Ensure event doesn't continue
              }}
              onMouseDown={(e) => {
                e.stopPropagation(); // Prevent shape drawing on close button mousedown
                e.preventDefault();
              }}
            >
              ×
            </div>
          </div>
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
          >
            <div className="grid-dimensions">
              {temporaryShape.width}×{temporaryShape.height}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>{title}</h2>
        <div className="history-controls">
          <button
            className="history-btn undo-btn"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
          >
            ↩ Undo
          </button>
          <button
            className="history-btn redo-btn"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo"
          >
            ↪ Redo
          </button>
        </div>
      </div>
      <div
        ref={gridRef}
        className="grid"
        style={{
          width: `${gridWidth * gridSize}px`,
          height: `${gridHeight * gridSize}px`,
          backgroundColor: "#1e1e1e",
        }}
        onMouseDown={(e) => handleMouseDown(e, sectionType)}
        onMouseMove={
          isDrawing && activeSection === sectionType
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
          shapes,
          activeSection === sectionType ? currentShape : null
        )}
      </div>
    </div>
  );
};

export default GridSection;
