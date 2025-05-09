import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ShapeAnalysis = ({
  isLoading,
  analysisData,
  apiKey,
  setApiKey,
  handleRunAnalysis,
}) => {
  // Handle API key input change
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  return (
    <div className="shape-analysis">
      <h2 className="analysis-title">Step 2: Shape Analysis</h2>

      <div className="api-key-section">
        <input
          type="text"
          placeholder="Enter OpenAI API Key"
          value={apiKey}
          onChange={handleApiKeyChange}
          className="api-key-input"
        />
        <button
          className="analysis-button"
          onClick={handleRunAnalysis}
          disabled={isLoading || !apiKey}
        >
          {isLoading ? "Analyzing..." : "Analyze Shapes"}
        </button>
      </div>

      <div className="analysis-results">
        {isLoading ? (
          <div className="loading-container">
            <h3>Processing shapes with AI...</h3>
            <div className="skeleton-container">
              <Skeleton count={5} height={20} className="skeleton-line" />
            </div>
          </div>
        ) : analysisData ? (
          <div className="results-container">
            <div className="stats-section">
              <h3>Shape Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Left Shapes:</span>
                  <span className="stat-value">
                    {analysisData.leftShapesCount}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Right Shapes:</span>
                  <span className="stat-value">
                    {analysisData.rightShapesCount}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Left Section Area:</span>
                  <span className="stat-value">
                    {analysisData.leftArea} units²
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Right Section Area:</span>
                  <span className="stat-value">
                    {analysisData.rightArea} units²
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Placement Efficiency:</span>
                  <span className="stat-value">
                    {analysisData.placementEfficiency}%
                  </span>
                </div>
              </div>
            </div>

            {analysisData.aiAnalysis && (
              <div className="ai-analysis">
                <h3>AI Analysis</h3>
                <div className="analysis-content">
                  <p>{analysisData.aiAnalysis}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-data">
            <p>
              Click "Analyze Shapes" to get AI-powered insights about your shape
              layout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShapeAnalysis;
