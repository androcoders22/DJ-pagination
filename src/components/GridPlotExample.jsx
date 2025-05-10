import React, { useState } from "react";
import GridPlot from "./GridPlot";

const GridPlotExample = () => {
  const [shapesData] = useState({
    FinalLeftSection: [
      { x: 25, y: 5, width: 9, height: 8 },
      { x: 11, y: 9, width: 8, height: 10 },
      { x: 11, y: 19, width: 13, height: 5 },
      { x: 0, y: 0, width: 12, height: 7 },
      { x: 12, y: 0, width: 4, height: 4 },
      { x: 19, y: 0, width: 2, height: 12 },
    ],
    Unplaced: [],
  });

  return (
    <div className="container">
      <h1>Grid Plot Example</h1>
      <div className="grid-container">
        <GridPlot
          data={shapesData}
          title="Rectangle Placement Plot"
          gridSize={20}
          gridWidth={40}
          gridHeight={30}
          showGrid={true}
        />
      </div>
    </div>
  );
};

export default GridPlotExample;
