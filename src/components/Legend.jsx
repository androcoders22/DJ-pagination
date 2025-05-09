import React from "react";

const Legend = () => {
  return (
    <div className="legend">
      <div className="legend-item">
        <div className="color-box maroon"></div>
        <span>Locked Shapes (Left)</span>
      </div>
      <div className="legend-item">
        <div className="color-box blue"></div>
        <span>Stories (Right) </span>
      </div>
    </div>
  );
};

export default Legend;
