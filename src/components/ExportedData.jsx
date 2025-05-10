import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ExportedData = ({
  leftSectionShapes,
  rightSectionShapes,
  onStartAnalysis,
  showExportedData,
}) => {
  const [loading, setLoading] = useState(false);
  const [exportedData, setExportedData] = useState(null);

  // Effect to handle the loading animation when data is requested
  useEffect(() => {
    if (showExportedData && !exportedData) {
      setLoading(true);

      // Simulate loading delay of exactly 1200ms
      const timer = setTimeout(() => {
        const formattedData = {
          leftSection: leftSectionShapes.map(({ x, y, width, height }) => ({
            x,
            y,
            width,
            height,
          })),
          rightSection: rightSectionShapes.map(({ x, y, width, height }) => ({
            x,
            y,
            width,
            height,
          })),
        };

        setExportedData(formattedData);
        setLoading(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [showExportedData, leftSectionShapes, rightSectionShapes]);

  // Reset the component state if shapes change
  useEffect(() => {
    if (!showExportedData) {
      setExportedData(null);
      setLoading(false);
    }
  }, [showExportedData, leftSectionShapes, rightSectionShapes]);

  const handleStartAnalysis = () => {
    if (onStartAnalysis && exportedData) {
      onStartAnalysis(exportedData);
    }
  };

  if (!showExportedData) return null;

  return (
    <div className="shape-analysis full-width">
      <h2 className="analysis-title">GeometricData of Shapes</h2>

      <div className="analysis-results">
        {loading ? (
          <div className="loading-container">
            <h3>Loading exported shape data...</h3>
            <div className="skeleton-container">
              <Skeleton count={8} height={25} className="skeleton-line" />
            </div>
          </div>
        ) : exportedData ? (
          <div className="results-container">
            <div className="two-column-layout">
              {/* First Column - Summary */}
              <div className="shapes-column">
                <h3 className="column-title">
                  Left Section Shapes ({exportedData.leftSection.length} shapes)
                </h3>
                <div className="shapes-list">
                  {exportedData.leftSection.length > 0 ? (
                    exportedData.leftSection.map((shape, index) => (
                      <div key={index} className="shape-item">
                        <span className="shape-index">Shape {index + 1}:</span>
                        <span className="shape-details">
                          x:{shape.x}, y:{shape.y}, w:{shape.width}, h:
                          {shape.height}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-shapes">No shapes in this section</p>
                  )}
                </div>
              </div>

              {/* Second Column - Left Section Shapes */}
              <div className="shapes-column">
                <h3 className="column-title">
                  Right Section Shapes ({exportedData.rightSection.length}{" "}
                  shapes)
                </h3>
                <div className="shapes-list">
                  {exportedData.rightSection.length > 0 ? (
                    exportedData.rightSection.map((shape, index) => (
                      <div key={index} className="shape-item">
                        <span className="shape-index">Shape {index + 1}:</span>
                        <span className="shape-details">
                          x:{shape.x}, y:{shape.y}, w:{shape.width}, h:
                          {shape.height}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-shapes">No shapes in this section</p>
                  )}
                </div>
              </div>
            </div>

            <div className="analysis-button-container">
              <button className="analysis-button" onClick={handleStartAnalysis}>
                AI Pagination Analysis
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ExportedData;
