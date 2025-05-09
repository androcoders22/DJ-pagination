import React from "react";

const ControlPanel = ({
  leftSectionShapes,
  rightSectionShapes,
  autoPositionShapes,
  clearShapes,
  toggleGrid,
  showGrid,
  handleExportAll,
}) => {
  return (
    <div className="button-container">
      {/* <button className="action-button" onClick={autoPositionShapes}>
        Auto-Position Shapes
      </button> */}
      <button className="action-button" onClick={handleExportAll}>
        Export Coordinates
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
