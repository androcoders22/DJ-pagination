import React, { useEffect, useRef } from "react";

/**
 * GridPlot component that renders rectangles on a canvas grid
 * @param {Object} props - Component props
 * @param {Object} props.data - Object containing FinalLeftSection and Unplaced arrays
 * @param {Array} props.data.FinalLeftSection - Array of placed rectangles with x, y, width, height
 * @param {Array} props.data.Unplaced - Array of unplaced rectangles
 * @param {number} [props.gridSize=20] - Size of each grid cell in pixels
 * @param {number} [props.gridWidth=40] - Grid width in cells
 * @param {number} [props.gridHeight=30] - Grid height in cells
 * @param {boolean} [props.showGrid=true] - Whether to show grid lines
 * @param {string} [props.title="Grid Plot"] - Title of the grid section
 */
const GridPlot = ({
  data,
  gridSize = 20,
  gridWidth = 40,
  gridHeight = 30,
  showGrid = true,
  title = "Grid Plot",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = gridWidth * gridSize;
    const height = gridHeight * gridSize;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, width, height);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let i = 0; i <= gridWidth; i++) {
        const x = i * gridSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let j = 0; j <= gridHeight; j++) {
        const y = j * gridSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw rectangles from FinalLeftSection
    if (data && data.FinalLeftSection) {
      data.FinalLeftSection.forEach((rect, index) => {
        const x = rect.x * gridSize;
        const y = rect.y * gridSize;
        const w = rect.width * gridSize;
        const h = rect.height * gridSize;

        // Fill rectangle with color (matching the light coral from GridSection)
        ctx.fillStyle = "lightcoral";
        ctx.fillRect(x, y, w, h);

        // Draw border (matching the dashed border from GridSection)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);

        // Draw dimensions text (matching the grid-dimensions style)
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(x + 5, y + 5, 40, 20);

        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(`${rect.width}×${rect.height}`, x + 10, y + 19);
      });
    }
  }, [data, gridSize, gridWidth, gridHeight, showGrid]);

  return (
    <div className="section">
      <div className="section-header">{/* <h2>{title}</h2> */}</div>
      <div className="grid-wrapper" style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            backgroundColor: "#1e1e1e",
            border: "1px dashed rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>
      <div
        className="stats-section"
        style={{
          marginTop: "10px",
          fontSize: "0.8rem",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <span>Placed shapes: {data?.FinalLeftSection?.length || 0}</span>
        {data?.Unplaced?.length > 0 && (
          <span style={{ marginLeft: "15px" }}>
            Unplaced shapes: {data.Unplaced.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default GridPlot;
