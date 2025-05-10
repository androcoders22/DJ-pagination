import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { processShapesWithAI, prepareShapesForDisplay } from "../utils/openAI";
import GridPlot from "./GridPlot";

const AIAnalysis = ({ shapesData, showAIAnalysis }) => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Run the AI analysis
  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use environment variable for API key
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        setError("OpenAI API key not found in environment variables");
        setLoading(false);
        return;
      }

      const aiResult = await processShapesWithAI(
        shapesData.leftSection,
        shapesData.rightSection,
        apiKey
      );

      if (aiResult.success) {
        // Prepare the combined data for display
        const displayData = prepareShapesForDisplay(shapesData);
        setAnalysisResult({
          ...displayData,
          aiAnalysis: aiResult.analysis,
          timestamp: aiResult.timestamp,
        });
      } else {
        setError(aiResult.error);
      }
    } catch (err) {
      setError(err.message || "Failed to analyze shapes with AI");
      console.error("Error in AI analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run analysis when component is first shown
  useEffect(() => {
    if (showAIAnalysis && shapesData && !analysisResult && !loading) {
      handleRunAnalysis();
    }
  }, [showAIAnalysis, shapesData]);

  // Reset the component if shapes data changes
  useEffect(() => {
    if (!showAIAnalysis) {
      setAnalysisResult(null);
      setError(null);
    }
  }, [showAIAnalysis, shapesData]);

  if (!showAIAnalysis) return null;

  return (
    <div className="shape-analysis full-width">
      <h2 className="analysis-title">AI Analysis</h2>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button className="analysis-button" onClick={handleRunAnalysis}>
            Retry Analysis
          </button>
        </div>
      )}

      <div className="analysis-results">
        {loading ? (
          <div className="loading-container">
            <h3>Processing shapes with AI...</h3>
            <div className="skeleton-container">
              <Skeleton count={5} height={20} className="skeleton-line" />
            </div>
          </div>
        ) : analysisResult ? (
          <div className="results-container">
            <div className="two-column-layout">
              {/* First Column - Statistics */}
              <div className="stats-column">
                <h3 className="column-title">Shape Statistics</h3>
                <div className="stats-list">
                  <div className="stat-item-row">
                    <span className="stat-label">Left Shapes:</span>
                    <span className="stat-value">
                      {analysisResult.leftShapesCount}
                    </span>
                  </div>
                  <div className="stat-item-row">
                    <span className="stat-label">Right Shapes:</span>
                    <span className="stat-value">
                      {analysisResult.rightShapesCount}
                    </span>
                  </div>
                  <div className="stat-item-row">
                    <span className="stat-label">Left Section Area:</span>
                    <span className="stat-value">
                      {analysisResult.leftArea} units²
                    </span>
                  </div>
                  <div className="stat-item-row">
                    <span className="stat-label">Right Section Area:</span>
                    <span className="stat-value">
                      {analysisResult.rightArea} units²
                    </span>
                  </div>
                  <div className="stat-item-row">
                    <span className="stat-label">Placement Efficiency:</span>
                    <span className="stat-value">
                      {analysisResult.placementEfficiency}%
                    </span>
                  </div>
                  <div className="stat-item-row">
                    <span className="stat-label">Analysis Time:</span>
                    <span className="stat-value">
                      {new Date(analysisResult.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Second Column - AI Analysis */}
              <div className="analysis-column">
                <h3 className="column-title">AI Analysis</h3>
                <div className="analysis-content">
                  <pre className="ai-json-output">
                    {analysisResult.aiAnalysis}
                  </pre>
                </div>
              </div>
            </div>
            <div className="grid-plot-container">
              <h3 className="column-title">AI results Plotting</h3>
              {analysisResult && analysisResult.aiAnalysis && (
                <GridPlot
                  data={
                    typeof analysisResult.aiAnalysis === "string"
                      ? JSON.parse(analysisResult.aiAnalysis)
                      : analysisResult.aiAnalysis
                  }
                  title="AI Optimization Result"
                  gridSize={20}
                  gridWidth={40}
                  gridHeight={30}
                  showGrid={true}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>Processing your shape data with AI...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;
