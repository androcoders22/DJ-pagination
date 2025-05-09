import React from "react";

const ControlPanel = ({
  leftSectionShapes,
  rightSectionShapes,
  autoPositionShapes,
  clearShapes,
  toggleGrid,
  showGrid,
}) => {
  return (
    <div className="button-container">
      <button
        className="action-button"
        onClick={() => {
          const leftSectionData = JSON.stringify(
            leftSectionShapes.map(({ x, y, width, height }) => ({
              x,
              y,
              width,
              height,
            })),
            null,
            2
          );
          console.log("Left Section Data:", leftSectionData);
          alert("Left Section JSON exported to console.");
        }}
      >
        Export Left Section to JSON
      </button>
      <button
        className="action-button"
        onClick={() => {
          const rightSectionData = JSON.stringify(
            rightSectionShapes.map(({ x, y, width, height }) => ({
              x,
              y,
              width,
              height,
            })),
            null,
            2
          );
          console.log("Right Section Data:", rightSectionData);
          alert("Right Section JSON exported to console.");
        }}
      >
        Export Right Section to JSON
      </button>
      <button className="action-button" onClick={autoPositionShapes}>
        Auto-Place News Blocks
      </button>
      <button className="action-button" onClick={clearShapes}>
        Clear All
      </button>
      <button className="action-button" onClick={toggleGrid}>
        {showGrid ? "Hide Grid" : "Show Grid"}
      </button>
    </div>
  );
};

export default ControlPanel;
